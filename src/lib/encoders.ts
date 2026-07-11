/**
 * Feature-encoding contract shared with the training pipeline.
 *
 * `ml/train_model.py` ordinal-encodes every categorical feature as its index
 * within the sorted category lists it writes to `model-metadata.json`. This
 * module performs the identical encoding at inference time. If the model is
 * retrained, only the JSON file changes — this code stays untouched.
 */
import metadataJson from './model-metadata.json';
import type { ModelMetadata, PredictionInput } from './types';

/** Metadata emitted by the most recent training run. */
export const modelMetadata = metadataJson as unknown as ModelMetadata;

/** Number of features in the model's input tensor. */
export const FEATURE_COUNT = 8;

/**
 * Resolve a categorical value to its ordinal index, mapping unknown values to
 * the trained fallback bucket (e.g. "Other brand").
 */
function categoryIndex(list: string[], value: string, fallback: string): number {
  const index = list.indexOf(value);
  if (index >= 0) {
    return index;
  }
  const fallbackIndex = list.indexOf(fallback);
  return fallbackIndex >= 0 ? fallbackIndex : 0;
}

/**
 * Encode a prediction input into the `[1, 8]` float32 vector expected by the
 * ONNX model: `[brand, model, year, condition, transmission, fuelType,
 * engineCc, mileageKm]`.
 */
export function encodeFeatures(input: PredictionInput): Float32Array {
  const { categories, fallbacks } = modelMetadata;
  return Float32Array.from([
    categoryIndex(categories.brand, input.brand, fallbacks.brand),
    categoryIndex(categories.model, input.model, fallbacks.model),
    input.year,
    categoryIndex(categories.condition, input.condition, fallbacks.condition),
    categoryIndex(categories.transmission, input.transmission, fallbacks.transmission),
    categoryIndex(categories.fuelType, input.fuelType, fallbacks.fuelType),
    input.engineCc,
    input.mileageKm,
  ]);
}

/**
 * Invert the target transform applied during training to recover a rupee
 * price from the model's raw output.
 */
export function invertTargetTransform(rawOutput: number): number {
  if (modelMetadata.targetTransform === 'log1p') {
    return Math.expm1(rawOutput);
  }
  return rawOutput;
}
