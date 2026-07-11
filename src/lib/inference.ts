/**
 * Server-side ONNX inference wrapper.
 *
 * Loads `public/model.onnx` once per serverless instance and reuses the
 * session across warm invocations. Every failure mode (missing model file,
 * WASM initialisation failure, non-finite output) degrades gracefully to the
 * deterministic heuristic estimator so the API never returns a 5xx for a
 * well-formed request.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { encodeFeatures, invertTargetTransform } from './encoders';
import { estimatePriceHeuristic } from './heuristic';
import type { PredictionEngine, PredictionInput } from './types';

type OrtModule = typeof import('onnxruntime-web');
type OrtSession = import('onnxruntime-web').InferenceSession;

interface LoadedModel {
  ort: OrtModule;
  session: OrtSession;
}

const MODEL_PATH = path.join(process.cwd(), 'public', 'model.onnx');

/** Cached across warm invocations; `null` means loading failed permanently. */
let loadPromise: Promise<LoadedModel | null> | null = null;

/**
 * Create the ONNX Runtime session. Returns `null` (rather than throwing) when
 * the model or runtime is unavailable, which switches the API to the
 * heuristic engine.
 */
async function loadModel(): Promise<LoadedModel | null> {
  try {
    const modelBuffer = await readFile(MODEL_PATH);
    const ort = await import('onnxruntime-web');
    // Serverless functions must not spawn worker threads for WASM execution.
    ort.env.wasm.numThreads = 1;
    const session = await ort.InferenceSession.create(new Uint8Array(modelBuffer), {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });
    return { ort, session };
  } catch (error) {
    console.warn(
      `AutoVista: ONNX model unavailable, falling back to heuristic estimator. Reason: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return null;
  }
}

/**
 * Predict a market price for the given vehicle specification.
 *
 * @returns The rounded rupee price and which engine produced it.
 */
export async function predictPrice(
  input: PredictionInput,
): Promise<{ predictedPrice: number; engine: PredictionEngine }> {
  loadPromise ??= loadModel();
  const loaded = await loadPromise;

  if (loaded) {
    try {
      const { ort, session } = loaded;
      const features = encodeFeatures(input);
      const tensor = new ort.Tensor('float32', features, [1, features.length]);
      const outputs = await session.run({ [session.inputNames[0]]: tensor });
      const rawOutput = Number(outputs[session.outputNames[0]].data[0]);
      const price = invertTargetTransform(rawOutput);
      if (Number.isFinite(price) && price > 0) {
        return { predictedPrice: Math.round(price), engine: 'onnx' };
      }
    } catch (error) {
      console.warn(
        `AutoVista: ONNX inference failed, using heuristic estimator. Reason: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  return { predictedPrice: estimatePriceHeuristic(input), engine: 'heuristic' };
}
