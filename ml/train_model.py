"""AutoVista price-model training pipeline.

Trains a gradient-boosting regressor on the ikman.lk vehicle dataset and
exports it to ONNX for serving via onnxruntime-web. The script also emits
``src/lib/model-metadata.json``, which is the single source of truth for the
feature encoding contract shared between this pipeline and the TypeScript
inference wrapper (``src/lib/encoders.ts``).

Feature vector (float32, shape [1, 8]) — order must never change without
retraining and re-emitting the metadata:

    [brand, model, year, condition, transmission, fuelType, engineCc, mileageKm]

Categorical features are ordinal-encoded as the index of the value inside the
sorted category list stored in the metadata file. The target is trained as
``log1p(Price_LKR)``; consumers must apply ``expm1`` to the raw model output.

Usage (local):
    python3 ml/train_model.py

Usage (Google Colab): paste the file into a cell after uploading the CSV, and
adjust ``DATA_PATH`` / output paths. See docs/ml-model.md for the full guide.
"""

from __future__ import annotations

import json
import time
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "data" / "ikman_clean_master.csv"
ONNX_PATH = ROOT.parent / "public" / "model.onnx"
METADATA_PATH = ROOT.parent / "src" / "lib" / "model-metadata.json"

FEATURE_ORDER = [
    "brand",
    "model",
    "year",
    "condition",
    "transmission",
    "fuelType",
    "engineCc",
    "mileageKm",
]

# Grouping thresholds for rare categories. Rare brands/models collapse into the
# explicit fallback buckets so unseen values at inference time have a home.
MIN_BRAND_ROWS = 12
MIN_MODEL_ROWS = 4
BRAND_FALLBACK = "Other brand"
MODEL_FALLBACK = "Other model"

RANGES = {
    "year": [1980, 2027],
    "mileageKm": [0, 400_000],
    "engineCc": [0, 5_500],
}
PRICE_RANGE = (500_000, 300_000_000)


def normalise_condition(raw: str) -> str:
    """Collapse the ~50 free-text condition strings into four canonical values."""
    value = str(raw).strip().lower()
    if "recondition" in value:
        return "Reconditioned"
    if "import" in value:
        return "Import"
    if "brand new" in value or "brandnew" in value or value == "new" or "0 km" in value:
        return "Brand New"
    return "Used"


def normalise_transmission(raw: str) -> str:
    """Collapse free-text transmission strings into four canonical values."""
    value = str(raw).strip().lower()
    if "tiptronic" in value or "tronic" in value:
        return "Tiptronic"
    if "cvt" in value:
        return "CVT"
    if "manual" in value:
        return "Manual"
    return "Automatic"


def normalise_fuel(raw: str) -> str:
    """Collapse free-text fuel strings into four canonical values."""
    value = str(raw).strip().lower()
    if "hybrid" in value or ("petrol" in value and "electric" in value):
        return "Hybrid"
    if "electric" in value:
        return "Electric"
    if "diesel" in value:
        return "Diesel"
    return "Petrol"


def load_and_clean(path: Path) -> pd.DataFrame:
    """Load the raw CSV and apply outlier filtering plus category normalisation."""
    df = pd.read_csv(path, encoding="utf-8-sig")
    df = df.rename(
        columns={
            "Brand": "brand",
            "Model": "model",
            "Year_of_Manufacture": "year",
            "Condition": "condition",
            "Transmission": "transmission",
            "Fuel_Type": "fuelType",
            "Engine_Capacity": "engineCc",
            "Mileage": "mileageKm",
            "Price_LKR": "price",
        },
    )

    for col in ["year", "engineCc", "mileageKm", "price"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df = df.dropna(subset=["brand", "model", "year", "engineCc", "mileageKm", "price"])

    df["brand"] = df["brand"].astype(str).str.strip()
    df["model"] = df["model"].astype(str).str.strip()

    # Sellers often repeat the brand inside the model field ("BYD Atto 3") and
    # vary the casing ("ATTO 3" vs "Atto 3"); both fragment the category space.
    def strip_brand_prefix(row: pd.Series) -> str:
        model, brand = row["model"], row["brand"]
        if model.lower().startswith(brand.lower() + " ") and len(model) > len(brand) + 1:
            return model[len(brand) :].strip()
        return model

    df["model"] = df.apply(strip_brand_prefix, axis=1)
    canonical = df.groupby(df["model"].str.casefold())["model"].agg(lambda s: s.mode().iat[0])
    df["model"] = df["model"].str.casefold().map(canonical)

    # The raw data already contains "Other brand"/"Other Model" placeholders;
    # pin any casing variant to the exact fallback constants so they share a
    # single bucket with the rows collapsed below.
    df.loc[df["model"].str.casefold() == MODEL_FALLBACK.casefold(), "model"] = MODEL_FALLBACK
    df.loc[df["brand"].str.casefold() == BRAND_FALLBACK.casefold(), "brand"] = BRAND_FALLBACK

    df["condition"] = df["condition"].map(normalise_condition)
    df["transmission"] = df["transmission"].map(normalise_transmission)
    df["fuelType"] = df["fuelType"].map(normalise_fuel)

    df = df[df["price"].between(*PRICE_RANGE)]
    df = df[df["year"].between(*RANGES["year"])]
    df = df[df["mileageKm"].between(*RANGES["mileageKm"])]
    # Electric "engine capacity" values in the source data are motor ratings
    # (kW-ish); everything else must look like a genuine cubic capacity.
    is_electric = df["fuelType"] == "Electric"
    df = df[(is_electric & df["engineCc"].between(0, 2_000)) | (~is_electric & df["engineCc"].between(500, 5_500))]

    # Collapse rare brands, then rare models within the surviving rows.
    brand_counts = df["brand"].value_counts()
    df.loc[df["brand"].map(brand_counts) < MIN_BRAND_ROWS, "brand"] = BRAND_FALLBACK
    model_counts = df["model"].value_counts()
    df.loc[df["model"].map(model_counts) < MIN_MODEL_ROWS, "model"] = MODEL_FALLBACK

    return df.reset_index(drop=True)


def build_categories(df: pd.DataFrame) -> dict[str, list[str]]:
    """Emit sorted category lists; sorting makes the index contract deterministic."""
    categories = {
        "brand": sorted(df["brand"].unique().tolist()),
        "model": sorted(df["model"].unique().tolist()),
        "condition": sorted(df["condition"].unique().tolist()),
        "transmission": sorted(df["transmission"].unique().tolist()),
        "fuelType": sorted(df["fuelType"].unique().tolist()),
    }
    for column, fallback in (("brand", BRAND_FALLBACK), ("model", MODEL_FALLBACK)):
        if fallback not in categories[column]:
            categories[column].append(fallback)
            categories[column].sort()
    return categories


def encode_features(df: pd.DataFrame, categories: dict[str, list[str]]) -> np.ndarray:
    """Ordinal-encode the dataframe into the float32 matrix the ONNX model expects."""
    matrix = np.zeros((len(df), len(FEATURE_ORDER)), dtype=np.float32)
    for j, feature in enumerate(FEATURE_ORDER):
        if feature in categories:
            index = {value: i for i, value in enumerate(categories[feature])}
            matrix[:, j] = df[feature].map(index).to_numpy(dtype=np.float32)
        else:
            matrix[:, j] = df[feature].to_numpy(dtype=np.float32)
    return matrix


def export_onnx(model: GradientBoostingRegressor, n_features: int, path: Path) -> None:
    """Convert the fitted sklearn model to ONNX and write it to ``path``."""
    from skl2onnx import convert_sklearn
    from skl2onnx.common.data_types import FloatTensorType

    onnx_model = convert_sklearn(
        model,
        initial_types=[("float_input", FloatTensorType([None, n_features]))],
        target_opset={"": 15, "ai.onnx.ml": 2},
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(onnx_model.SerializeToString())


def verify_and_benchmark(path: Path, x_test: np.ndarray, sk_log_preds: np.ndarray) -> float:
    """Assert ONNX/sklearn parity and return mean single-row latency in ms."""
    import onnxruntime as rt

    session = rt.InferenceSession(str(path), providers=["CPUExecutionProvider"])
    input_name = session.get_inputs()[0].name

    onnx_log_preds = session.run(None, {input_name: x_test.astype(np.float32)})[0].ravel()
    max_rel_err = float(np.max(np.abs(onnx_log_preds - sk_log_preds) / np.abs(sk_log_preds)))
    assert max_rel_err < 5e-3, f"ONNX/sklearn divergence too high: {max_rel_err}"

    single = x_test[:1].astype(np.float32)
    for _ in range(20):  # warm-up
        session.run(None, {input_name: single})
    started = time.perf_counter()
    runs = 200
    for _ in range(runs):
        session.run(None, {input_name: single})
    return (time.perf_counter() - started) / runs * 1000


def main() -> None:
    df = load_and_clean(DATA_PATH)
    categories = build_categories(df)
    print(f"Cleaned rows: {len(df)} | brands: {len(categories['brand'])} | models: {len(categories['model'])}")

    x = encode_features(df, categories)
    y = np.log1p(df["price"].to_numpy(dtype=np.float64))
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)

    model = GradientBoostingRegressor(
        n_estimators=500,
        learning_rate=0.05,
        max_depth=5,
        subsample=0.9,
        min_samples_leaf=8,
        random_state=42,
    )
    model.fit(x_train, y_train)

    log_preds = model.predict(x_test)
    price_preds = np.expm1(log_preds)
    price_true = np.expm1(y_test)
    mae = mean_absolute_error(price_true, price_preds)
    r2 = r2_score(y_test, log_preds)
    median_ape = float(np.median(np.abs(price_preds - price_true) / price_true) * 100)
    print(f"MAE: Rs {mae:,.0f} | R² (log): {r2:.4f} | median APE: {median_ape:.2f}%")

    export_onnx(model, x.shape[1], ONNX_PATH)
    latency_ms = verify_and_benchmark(ONNX_PATH, x_test, log_preds)
    size_kb = ONNX_PATH.stat().st_size / 1024
    print(f"ONNX written: {ONNX_PATH} ({size_kb:,.0f} KB) | mean latency: {latency_ms:.2f} ms/row")

    brand_models: dict[str, list[str]] = {
        brand: sorted(group["model"].unique().tolist())
        for brand, group in df.groupby("brand")
    }
    metadata = {
        "version": 1,
        "trainedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "targetTransform": "log1p",
        "featureOrder": FEATURE_ORDER,
        "categories": categories,
        "brandModels": brand_models,
        "fallbacks": {
            "brand": BRAND_FALLBACK,
            "model": MODEL_FALLBACK,
            "condition": "Used",
            "transmission": "Automatic",
            "fuelType": "Petrol",
        },
        "ranges": RANGES,
        "metrics": {
            "rows": int(len(df)),
            "trainRows": int(len(x_train)),
            "testRows": int(len(x_test)),
            "maeLkr": round(float(mae)),
            "r2Log": round(float(r2), 4),
            "medianApePct": round(median_ape, 2),
            "onnxSizeKb": round(size_kb),
            "meanLatencyMs": round(latency_ms, 2),
        },
    }
    METADATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    METADATA_PATH.write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Metadata written: {METADATA_PATH}")


if __name__ == "__main__":
    main()
