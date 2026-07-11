/**
 * Shared domain types for AutoVista.
 *
 * The categorical unions below use the canonical (capitalised) spellings from
 * the training dataset — they must match the category lists emitted into
 * `model-metadata.json` by `ml/train_model.py`.
 */

/** Canonical fuel types recognised by the price model. */
export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';

/** Canonical vehicle conditions recognised by the price model. */
export type Condition = 'Brand New' | 'Import' | 'Reconditioned' | 'Used';

/** Canonical transmission types recognised by the price model. */
export type Transmission = 'Automatic' | 'CVT' | 'Manual' | 'Tiptronic';

/** A vehicle listing shown in the marketplace. */
export interface Vehicle {
  /** Stable unique identifier, used in URLs and favourites storage. */
  id: string;
  /** Human-readable listing title, e.g. "Honda Vezel Z Grade 2018". */
  title: string;
  brand: string;
  model: string;
  year: number;
  condition: Condition;
  transmission: Transmission;
  fuelType: FuelType;
  /** Engine capacity in cc; for electric vehicles this is the motor rating in kW. */
  engineCc: number;
  mileageKm: number;
  bodyType: string;
  colour: string;
  /** City / district of the seller. */
  location: string;
  /** Advertised price in Sri Lankan rupees. */
  price: number;
  description: string;
  /** Featured listings appear in the home-page carousel. */
  featured: boolean;
  sellerType: 'Dealer' | 'Private seller';
  /** ISO 8601 date the listing was posted. */
  postedAt: string;
}

/**
 * Payload accepted by `POST /api/predict`.
 *
 * Categorical fields are plain strings so that callers are not broken when the
 * model is retrained with new categories; unknown values are mapped onto the
 * fallback buckets defined in the model metadata.
 */
export interface PredictionInput {
  brand: string;
  model: string;
  year: number;
  condition: string;
  transmission: string;
  fuelType: string;
  engineCc: number;
  mileageKm: number;
}

/** Which engine produced a prediction. */
export type PredictionEngine = 'onnx' | 'heuristic';

/** Successful response body from `POST /api/predict`. */
export interface PredictionResult {
  /** Predicted market price in Sri Lankan rupees, rounded to the nearest rupee. */
  predictedPrice: number;
  currency: 'LKR';
  /** `onnx` when the trained model served the request, `heuristic` for the statistical fallback. */
  engine: PredictionEngine;
  /** Server-side inference time in milliseconds. */
  latencyMs: number;
}

/** Error response body from `POST /api/predict`. */
export interface PredictionErrorResponse {
  error: string;
  /** Field-level validation messages, present for 400 responses. */
  details?: string[];
}

/** Shape of `src/lib/model-metadata.json`, emitted by `ml/train_model.py`. */
export interface ModelMetadata {
  version: number;
  trainedAt: string;
  /** Transform applied to the target during training; consumers must invert it. */
  targetTransform: 'log1p' | 'none';
  featureOrder: string[];
  categories: {
    brand: string[];
    model: string[];
    condition: string[];
    transmission: string[];
    fuelType: string[];
  };
  /** Models observed per brand in the training data, for dependent dropdowns. */
  brandModels: Record<string, string[]>;
  /** Buckets used when an input value is not in the corresponding category list. */
  fallbacks: {
    brand: string;
    model: string;
    condition: string;
    transmission: string;
    fuelType: string;
  };
  ranges: {
    year: number[];
    mileageKm: number[];
    engineCc: number[];
  };
  metrics: {
    rows: number;
    trainRows: number;
    testRows: number;
    maeLkr: number;
    r2Log: number;
    medianApePct: number;
    onnxSizeKb: number;
    meanLatencyMs: number;
  };
}
