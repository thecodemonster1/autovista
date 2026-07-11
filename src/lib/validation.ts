/** Request validation for the prediction API. */
import type { PredictionInput } from './types';

/** Successful validation outcome carrying the typed, trimmed input. */
export interface ValidationSuccess {
  ok: true;
  value: PredictionInput;
}

/** Failed validation outcome carrying human-readable field errors. */
export interface ValidationFailure {
  ok: false;
  errors: string[];
}

const MIN_YEAR = 1980;
const MAX_MILEAGE_KM = 1_000_000;
const MAX_ENGINE_CC = 8_000;
const MAX_STRING_LENGTH = 80;

const STRING_FIELDS = ['brand', 'model', 'condition', 'transmission', 'fuelType'] as const;

/**
 * Validate an unknown request body against the `PredictionInput` contract.
 *
 * Categorical values are only checked for shape (non-empty, bounded strings);
 * unknown categories are legal and are mapped to the model's fallback buckets
 * during encoding, so retraining with new categories never breaks callers.
 */
export function validatePredictionInput(body: unknown): ValidationSuccess | ValidationFailure {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, errors: ['Request body must be a JSON object.'] };
  }

  const record = body as Record<string, unknown>;
  const errors: string[] = [];

  for (const field of STRING_FIELDS) {
    const value = record[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`"${field}" must be a non-empty string.`);
    } else if (value.length > MAX_STRING_LENGTH) {
      errors.push(`"${field}" must be at most ${MAX_STRING_LENGTH} characters.`);
    }
  }

  const maxYear = new Date().getFullYear() + 1;
  const year = record.year;
  if (typeof year !== 'number' || !Number.isInteger(year) || year < MIN_YEAR || year > maxYear) {
    errors.push(`"year" must be an integer between ${MIN_YEAR} and ${maxYear}.`);
  }

  const mileageKm = record.mileageKm;
  if (
    typeof mileageKm !== 'number' ||
    !Number.isFinite(mileageKm) ||
    mileageKm < 0 ||
    mileageKm > MAX_MILEAGE_KM
  ) {
    errors.push(`"mileageKm" must be a number between 0 and ${MAX_MILEAGE_KM}.`);
  }

  const engineCc = record.engineCc;
  if (
    typeof engineCc !== 'number' ||
    !Number.isFinite(engineCc) ||
    engineCc < 0 ||
    engineCc > MAX_ENGINE_CC
  ) {
    errors.push(`"engineCc" must be a number between 0 and ${MAX_ENGINE_CC}.`);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      brand: (record.brand as string).trim(),
      model: (record.model as string).trim(),
      year: record.year as number,
      condition: (record.condition as string).trim(),
      transmission: (record.transmission as string).trim(),
      fuelType: (record.fuelType as string).trim(),
      engineCc: record.engineCc as number,
      mileageKm: record.mileageKm as number,
    },
  };
}
