/**
 * Deterministic statistical price estimator.
 *
 * Used as a graceful fallback whenever the ONNX model cannot serve a request
 * (model file missing, WASM runtime unavailable, malformed model output). It
 * applies a classic depreciation curve over a brand-level base price, adjusted
 * for engine size, condition, mileage, fuel and transmission.
 */
import type { PredictionInput } from './types';

/** Approximate showroom price (LKR) for a new ~1500 cc vehicle of each brand. */
const BRAND_BASE_PRICES: Record<string, number> = {
  Audi: 38_000_000,
  BMW: 40_000_000,
  BYD: 18_500_000,
  Daihatsu: 8_500_000,
  Ford: 22_000_000,
  Honda: 17_500_000,
  Hyundai: 14_000_000,
  Kia: 15_000_000,
  'Land Rover': 60_000_000,
  Mazda: 14_500_000,
  'Mercedes Benz': 45_000_000,
  Mitsubishi: 16_000_000,
  Nissan: 14_000_000,
  Perodua: 9_000_000,
  Peugeot: 20_000_000,
  Suzuki: 9_500_000,
  Toyota: 18_500_000,
  Volkswagen: 20_000_000,
};

const DEFAULT_BASE_PRICE = 15_000_000;
const ANNUAL_DEPRECIATION = 0.925;
const MAX_DEPRECIATION_YEARS = 25;
const EXPECTED_KM_PER_YEAR = 12_000;
const MILEAGE_PENALTY_PER_KM = 8;

const CONDITION_MULTIPLIERS: Record<string, number> = {
  'Brand New': 1.05,
  Import: 1.0,
  Reconditioned: 0.97,
  Used: 0.92,
};

const FUEL_MULTIPLIERS: Record<string, number> = {
  Diesel: 1.06,
  Electric: 0.95,
  Hybrid: 1.04,
  Petrol: 1.0,
};

/** Clamp a value into an inclusive range. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Estimate a market price in Sri Lankan rupees. The function is pure and
 * deterministic for a given input and calendar year.
 */
export function estimatePriceHeuristic(input: PredictionInput): number {
  const basePrice = BRAND_BASE_PRICES[input.brand] ?? DEFAULT_BASE_PRICE;

  // Engine size scales the base price; electric motor ratings are not
  // comparable to cubic capacity, so EVs use the brand base as-is.
  const engineFactor =
    input.fuelType === 'Electric' ? 1 : clamp(0.55 + (input.engineCc / 1_500) * 0.45, 0.6, 2.2);

  const age = clamp(new Date().getFullYear() - input.year, 0, MAX_DEPRECIATION_YEARS);
  const depreciation = ANNUAL_DEPRECIATION ** age;

  let estimate = basePrice * engineFactor * depreciation;
  estimate *= CONDITION_MULTIPLIERS[input.condition] ?? CONDITION_MULTIPLIERS.Used;
  estimate *= FUEL_MULTIPLIERS[input.fuelType] ?? 1;
  estimate *= input.transmission === 'Manual' ? 0.93 : 1;

  // Reward below-average mileage and penalise above-average, capped at ±10 %.
  const expectedMileage = age * EXPECTED_KM_PER_YEAR;
  const mileageAdjustment = clamp(
    (expectedMileage - input.mileageKm) * MILEAGE_PENALTY_PER_KM,
    -0.1 * estimate,
    0.1 * estimate,
  );
  estimate += mileageAdjustment;

  return Math.max(Math.round(estimate / 25_000) * 25_000, 600_000);
}
