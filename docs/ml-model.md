# Machine Learning Model

How the AutoVista price model is trained, exported to ONNX, optimised and
deployed. The whole pipeline lives in [`ml/train_model.py`](../ml/train_model.py)
and can be run locally or in Google Colab.

## 1. Dataset

`ml/data/ikman_clean_master.csv` — 4,386 vehicle advertisements scraped from
ikman.lk with the columns:

```
Brand, Model, Year_of_Manufacture, Condition, Transmission,
Fuel_Type, Engine_Capacity, Mileage, Price_LKR
```

Real scraped data is messy. The raw file contains ~50 distinct `Condition`
strings ("Brand New (0 KM)", "High Grade Japan Unit", whole sentences…),
37 distinct `Transmission` strings, price outliers as low as Rs 2,009 and a
mileage of 15.4 million km. The cleaning stage handles all of this.

## 2. Preprocessing

Implemented in `load_and_clean()`:

1. **Numeric coercion** — non-numeric year/engine/mileage/price rows dropped.
2. **Outlier filtering** — price Rs 500k–300M, year 1980–2027, mileage 0–400k km,
   engine 500–5,500 cc (0–2,000 for electric, whose "capacity" is a motor rating).
3. **Category normalisation** — free-text values collapsed into canonical sets:
   - Condition → `Brand New`, `Import`, `Reconditioned`, `Used`
   - Transmission → `Automatic`, `CVT`, `Manual`, `Tiptronic`
   - Fuel → `Petrol`, `Diesel`, `Hybrid`, `Electric`
4. **Model-name normalisation** — redundant brand prefixes are stripped
   (`BYD Atto 3` → `Atto 3`) and casing variants (`ATTO 3` vs `Atto 3`) are
   unified onto the most frequent spelling, so one vehicle is one category.
5. **Rare-category grouping** — brands with < 12 rows → `Other brand`; models
   with < 4 rows → `Other model`. This gives unseen values a trained home at
   inference time.

Result: **4,330 clean rows, 28 brands, 178 models.**

## 3. Feature encoding — the shared contract

The feature vector is `float32[1, 8]`:

```
[brand, model, year, condition, transmission, fuelType, engineCc, mileageKm]
```

Categoricals are **ordinal-encoded** as the index of the value within the
_sorted_ category list. The lists are written to `src/lib/model-metadata.json`,
and `src/lib/encoders.ts` performs the identical lookup in TypeScript. Ordinal
encoding is appropriate here because gradient-boosted trees split on feature
values rather than assuming linear ordering.

> ⚠️ **Never** reorder or hand-edit the category lists in the metadata file.
> They must match what the model was trained with. Retrain instead.

## 4. Model and target

```python
GradientBoostingRegressor(
    n_estimators=500, learning_rate=0.05, max_depth=5,
    subsample=0.9, min_samples_leaf=8, random_state=42,
)
```

The target is `log1p(Price_LKR)` because prices span three orders of
magnitude; the server inverts with `expm1`. The transform name is stored in
the metadata (`targetTransform`) so consumers never hard-code it.

**Evaluation (20 % held-out split):**

| Metric                | Value       |
| --------------------- | ----------- |
| R² (log price)        | **0.941**   |
| Median absolute % err | **5.8 %**   |
| MAE                   | Rs 2.31M    |
| ONNX artefact size    | **634 KB**  |
| Mean latency (1 row)  | **0.01 ms** |

## 5. Training in Google Colab

1. Open <https://colab.research.google.com> → new notebook.
2. Upload the CSV via the Files panel (or mount Drive).
3. Install dependencies:

   ```python
   !pip -q install scikit-learn skl2onnx onnx onnxruntime pandas
   ```

4. Paste the contents of `ml/train_model.py` into a cell and adjust the paths:

   ```python
   DATA_PATH = Path("/content/ikman_clean_master.csv")
   ONNX_PATH = Path("/content/model.onnx")
   METADATA_PATH = Path("/content/model-metadata.json")
   ```

5. Run the cell, then download both artefacts:

   ```python
   from google.colab import files
   files.download("/content/model.onnx")
   files.download("/content/model-metadata.json")
   ```

6. Place them in the repository — `public/model.onnx` and
   `src/lib/model-metadata.json` — commit **both together**, and redeploy.

## 6. ONNX export details

```python
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

onnx_model = convert_sklearn(
    model,
    initial_types=[("float_input", FloatTensorType([None, 8]))],
    target_opset={"": 15, "ai.onnx.ml": 2},
)
```

The graph compiles to a single `TreeEnsembleRegressor` node. The script then
verifies parity between sklearn and onnxruntime outputs (max relative error
< 0.5 %) and benchmarks single-row latency — both assertions must pass before
the artefact is written.

## 7. Inference optimisation

- **Model size** — tree count and depth dominate. 500 × depth-5 trees ≈ 634 KB.
  If you need a smaller artefact, reduce `n_estimators` before anything else;
  accuracy degrades gracefully.
- **Quantisation** — tree ensembles are already compact integers+floats;
  dynamic quantisation (`onnxruntime.quantization`) mainly benefits neural
  networks. If you switch to an MLP, quantise to int8 and re-verify parity.
- **Serverless** — `inference.ts` sets `ort.env.wasm.numThreads = 1` (no
  worker threads in serverless) and caches the session per warm instance, so
  the model loads once, not per request.
- **Browser** — the same `model.onnx` is served statically from `/model.onnx`
  and can be run client-side with `onnxruntime-web` for ≤ 30 ms predictions
  (the current API round-trip is already only a few ms server-side; client
  inference is an optional enhancement, not required for the latency budget).

## 8. Budget compliance

| Constraint                    | Target  | Actual                           |
| ----------------------------- | ------- | -------------------------------- |
| Model + runtime bundle        | < 10 MB | 634 KB model + ~5 MB ORT WASM    |
| Server-side inference latency | ≤ 50 ms | ≈ 1 ms warm (0.01 ms graph)      |
| Browser inference latency     | ≤ 30 ms | ≈ 0.01 ms/row after session init |
| Export format                 | ONNX    | ONNX (opset 15 / ai.onnx.ml 2)   |

## 9. Retraining checklist

- [ ] Replace/extend `ml/data/ikman_clean_master.csv`
- [ ] `npm run train` (or run in Colab)
- [ ] Check printed MAE / R² / median APE against the table above
- [ ] Confirm `public/model.onnx` **and** `src/lib/model-metadata.json` both changed
- [ ] `npm test && npm run build`
- [ ] Deploy; verify `/api/predict` responds with `"engine": "onnx"`
