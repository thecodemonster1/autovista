'use client';

import {
  ArrowPathIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  CheckBadgeIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useEffect } from 'react';

import { useVehiclePricePrediction } from '@/hooks/useVehiclePricePrediction';
import { formatLKR } from '@/lib/format';
import type { Vehicle } from '@/lib/types';

interface PredictedPriceBadgeProps {
  vehicle: Vehicle;
}

/** Verdict comparing the advertised price with the model's estimate. */
function priceVerdict(
  advertised: number,
  predicted: number,
): {
  label: string;
  tone: 'good' | 'fair' | 'high';
} {
  const differencePct = ((advertised - predicted) / predicted) * 100;
  if (differencePct <= -5) {
    return { label: 'Listed below our estimate — potentially a great deal', tone: 'good' };
  }
  if (differencePct < 5) {
    return { label: 'Listed close to our estimate — fairly priced', tone: 'fair' };
  }
  return { label: 'Listed above our estimate — worth negotiating', tone: 'high' };
}

const TONE_CLASSES = {
  good: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  fair: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  high: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
} as const;

/**
 * Card that requests an AI price estimate for a listing and compares it with
 * the advertised price.
 */
export function PredictedPriceBadge({ vehicle }: PredictedPriceBadgeProps): React.JSX.Element {
  const { status, result, error, predict } = useVehiclePricePrediction();

  useEffect(() => {
    void predict({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      condition: vehicle.condition,
      transmission: vehicle.transmission,
      fuelType: vehicle.fuelType,
      engineCc: vehicle.engineCc,
      mileageKm: vehicle.mileageKm,
    });
  }, [vehicle, predict]);

  return (
    <section
      aria-label="AI price estimate"
      className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 transition-colors duration-300 dark:border-brand-900 dark:bg-brand-950/40"
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-800 dark:text-brand-300">
        <SparklesIcon className="h-4 w-4" aria-hidden="true" />
        AI price estimate
      </h2>

      {status === 'loading' && (
        <div className="mt-3 space-y-2" aria-live="polite" aria-busy="true">
          <div className="h-7 w-40 animate-pulse rounded-lg bg-brand-200/60 dark:bg-brand-900/60" />
          <div className="h-4 w-full animate-pulse rounded bg-brand-200/40 dark:bg-brand-900/40" />
        </div>
      )}

      {status === 'success' && result && (
        <div className="mt-2 animate-fade-in" aria-live="polite">
          <p className="text-2xl font-bold text-brand-900 dark:text-brand-200">
            {formatLKR(result.predictedPrice)}
          </p>
          {(() => {
            const verdict = priceVerdict(vehicle.price, result.predictedPrice);
            const Icon =
              verdict.tone === 'good'
                ? ArrowTrendingDownIcon
                : verdict.tone === 'high'
                  ? ArrowTrendingUpIcon
                  : CheckBadgeIcon;
            return (
              <p
                className={`mt-2 flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${TONE_CLASSES[verdict.tone]}`}
              >
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {verdict.label}
              </p>
            );
          })()}
          <p className="mt-2 text-[11px] text-brand-700/70 dark:text-brand-400/70">
            {result.engine === 'onnx' ? 'ONNX model' : 'Statistical estimator'} · {result.latencyMs}{' '}
            ms
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-2" aria-live="polite">
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          <button
            type="button"
            onClick={() =>
              void predict({
                brand: vehicle.brand,
                model: vehicle.model,
                year: vehicle.year,
                condition: vehicle.condition,
                transmission: vehicle.transmission,
                fuelType: vehicle.fuelType,
                engineCc: vehicle.engineCc,
                mileageKm: vehicle.mileageKm,
              })
            }
            className="mt-2 flex items-center gap-1.5 rounded-lg border border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-800 dark:text-brand-300 dark:hover:bg-brand-950"
          >
            <ArrowPathIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Try again
          </button>
        </div>
      )}
    </section>
  );
}
