'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { PredictionErrorResponse, PredictionInput, PredictionResult } from '@/lib/types';

/** Lifecycle of a prediction request. */
export type PredictionStatus = 'idle' | 'loading' | 'success' | 'error';

interface PredictionState {
  status: PredictionStatus;
  result: PredictionResult | null;
  error: string | null;
}

const INITIAL_STATE: PredictionState = { status: 'idle', result: null, error: null };

/**
 * Call `POST /api/predict` and track the request lifecycle.
 *
 * Rapid successive calls abort the in-flight request, so the state always
 * reflects the most recent input (important for live re-prediction as a user
 * edits a form).
 *
 * @example
 * const { status, result, predict } = useVehiclePricePrediction();
 * await predict({ brand: 'Toyota', model: 'Aqua', year: 2015, ... });
 */
export function useVehiclePricePrediction(): PredictionState & {
  predict: (input: PredictionInput) => Promise<PredictionResult | null>;
  reset: () => void;
} {
  const [state, setState] = useState<PredictionState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const predict = useCallback(async (input: PredictionInput): Promise<PredictionResult | null> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ status: 'loading', result: null, error: null });

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      const data = (await response.json()) as PredictionResult | PredictionErrorResponse;

      if (!response.ok || 'error' in data) {
        const message = 'error' in data ? data.error : 'Prediction failed.';
        setState({ status: 'error', result: null, error: message });
        return null;
      }

      setState({ status: 'success', result: data, error: null });
      return data;
    } catch (error) {
      // A newer request superseded this one; leave state to the newer call.
      if (error instanceof DOMException && error.name === 'AbortError') {
        return null;
      }
      setState({
        status: 'error',
        result: null,
        error: 'Could not reach the prediction service. Please try again.',
      });
      return null;
    }
  }, []);

  const reset = useCallback((): void => setState(INITIAL_STATE), []);

  return { ...state, predict, reset };
}
