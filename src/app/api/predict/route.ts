/**
 * `POST /api/predict` — vehicle price prediction endpoint.
 *
 * Accepts a JSON `PredictionInput` payload and responds with a
 * `PredictionResult`. Inference runs through the ONNX model when available
 * and falls back to the deterministic heuristic estimator otherwise; the
 * response's `engine` field reports which path served the request.
 */
import { predictPrice } from '@/lib/inference';
import type { PredictionErrorResponse, PredictionResult } from '@/lib/types';
import { validatePredictionInput } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'Request body must be valid JSON.' } satisfies PredictionErrorResponse,
      { status: 400 },
    );
  }

  const validation = validatePredictionInput(body);
  if (!validation.ok) {
    return Response.json(
      {
        error: 'Invalid prediction input.',
        details: validation.errors,
      } satisfies PredictionErrorResponse,
      { status: 400 },
    );
  }

  const started = performance.now();
  const { predictedPrice, engine } = await predictPrice(validation.value);
  const latencyMs = Math.round((performance.now() - started) * 10) / 10;

  return Response.json({
    predictedPrice,
    currency: 'LKR',
    engine,
    latencyMs,
  } satisfies PredictionResult);
}
