/**
 * @jest-environment node
 */
import type { PredictionErrorResponse, PredictionInput, PredictionResult } from '@/lib/types';

import { POST } from '../route';

function buildRequest(body: unknown): Request {
  return new Request('http://localhost/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const validInput: PredictionInput = {
  brand: 'Toyota',
  model: 'Aqua',
  year: 2018,
  condition: 'Used',
  transmission: 'Automatic',
  fuelType: 'Hybrid',
  engineCc: 1500,
  mileageKm: 60_000,
};

describe('POST /api/predict', () => {
  it('returns a prediction for a valid payload', async () => {
    const response = await POST(buildRequest(validInput));
    expect(response.status).toBe(200);

    const data = (await response.json()) as PredictionResult;
    expect(data.currency).toBe('LKR');
    expect(data.predictedPrice).toBeGreaterThan(0);
    expect(Number.isInteger(data.predictedPrice)).toBe(true);
    expect(['onnx', 'heuristic']).toContain(data.engine);
    expect(typeof data.latencyMs).toBe('number');
  });

  it('maps unknown categorical values onto fallback buckets instead of failing', async () => {
    const response = await POST(
      buildRequest({ ...validInput, brand: 'Koenigsegg', model: 'Jesko' }),
    );
    expect(response.status).toBe(200);

    const data = (await response.json()) as PredictionResult;
    expect(data.predictedPrice).toBeGreaterThan(0);
  });

  it('rejects payloads with missing or invalid fields', async () => {
    const response = await POST(buildRequest({ brand: 'Toyota', year: 'not-a-year' }));
    expect(response.status).toBe(400);

    const data = (await response.json()) as PredictionErrorResponse;
    expect(data.error).toBe('Invalid prediction input.');
    expect(data.details?.length).toBeGreaterThan(0);
  });

  it('rejects out-of-range numeric values', async () => {
    const response = await POST(buildRequest({ ...validInput, year: 1900, mileageKm: -5 }));
    expect(response.status).toBe(400);

    const data = (await response.json()) as PredictionErrorResponse;
    expect(data.details?.some((message) => message.includes('"year"'))).toBe(true);
    expect(data.details?.some((message) => message.includes('"mileageKm"'))).toBe(true);
  });

  it('rejects malformed JSON bodies', async () => {
    const response = await POST(buildRequest('{not json'));
    expect(response.status).toBe(400);

    const data = (await response.json()) as PredictionErrorResponse;
    expect(data.error).toBe('Request body must be valid JSON.');
  });
});
