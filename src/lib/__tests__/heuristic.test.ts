import { estimatePriceHeuristic } from '../heuristic';
import type { PredictionInput } from '../types';

const baseInput: PredictionInput = {
  brand: 'Toyota',
  model: 'Aqua',
  year: 2018,
  condition: 'Used',
  transmission: 'Automatic',
  fuelType: 'Hybrid',
  engineCc: 1500,
  mileageKm: 60_000,
};

describe('estimatePriceHeuristic', () => {
  it('is deterministic for identical inputs', () => {
    expect(estimatePriceHeuristic(baseInput)).toBe(estimatePriceHeuristic(baseInput));
  });

  it('always returns a positive, rounded rupee amount', () => {
    const price = estimatePriceHeuristic(baseInput);
    expect(price).toBeGreaterThan(0);
    expect(price % 25_000).toBe(0);
  });

  it('prices newer vehicles above older ones, all else equal', () => {
    const newer = estimatePriceHeuristic({ ...baseInput, year: 2022, mileageKm: 20_000 });
    const older = estimatePriceHeuristic({ ...baseInput, year: 2012, mileageKm: 20_000 });
    expect(newer).toBeGreaterThan(older);
  });

  it('penalises higher mileage', () => {
    const lowMileage = estimatePriceHeuristic({ ...baseInput, mileageKm: 20_000 });
    const highMileage = estimatePriceHeuristic({ ...baseInput, mileageKm: 180_000 });
    expect(lowMileage).toBeGreaterThan(highMileage);
  });

  it('prices premium brands above budget brands', () => {
    const premium = estimatePriceHeuristic({
      ...baseInput,
      brand: 'Mercedes Benz',
      engineCc: 2000,
    });
    const budget = estimatePriceHeuristic({ ...baseInput, brand: 'Suzuki', engineCc: 2000 });
    expect(premium).toBeGreaterThan(budget);
  });

  it('handles unknown brands via the default base price', () => {
    const price = estimatePriceHeuristic({ ...baseInput, brand: 'Unknown Marque' });
    expect(price).toBeGreaterThan(0);
  });
});
