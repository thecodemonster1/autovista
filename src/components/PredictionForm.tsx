'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';

import { useVehiclePricePrediction } from '@/hooks/useVehiclePricePrediction';
import { modelMetadata } from '@/lib/encoders';
import { formatLKR } from '@/lib/format';

const fieldClasses =
  'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition-colors duration-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

const labelClasses = 'block text-xs font-medium text-slate-500 dark:text-slate-400';

/**
 * Interactive valuation form. Brand and model options come from the model
 * metadata, so the form always matches whatever the current ONNX model was
 * trained on.
 */
export function PredictionForm(): React.JSX.Element {
  const { status, result, error, predict } = useVehiclePricePrediction();

  const brands = useMemo(() => Object.keys(modelMetadata.brandModels).sort(), []);
  const [brand, setBrand] = useState('Toyota');
  const [model, setModel] = useState('Aqua');
  const [year, setYear] = useState(2018);
  const [condition, setCondition] = useState('Used');
  const [transmission, setTransmission] = useState('Automatic');
  const [fuelType, setFuelType] = useState('Hybrid');
  const [engineCc, setEngineCc] = useState('1500');
  const [mileageKm, setMileageKm] = useState('60000');

  const modelsForBrand = modelMetadata.brandModels[brand] ?? [modelMetadata.fallbacks.model];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1979 }, (_, index) => currentYear - index);

  const handleBrandChange = (nextBrand: string): void => {
    setBrand(nextBrand);
    const models = modelMetadata.brandModels[nextBrand] ?? [modelMetadata.fallbacks.model];
    setModel(models[0]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void predict({
      brand,
      model,
      year,
      condition,
      transmission,
      fuelType,
      engineCc: Math.min(Math.max(Number(engineCc) || 0, 0), 8_000),
      mileageKm: Math.min(Math.max(Number(mileageKm) || 0, 0), 1_000_000),
    });
  };

  const uncertaintyPct = modelMetadata.metrics.medianApePct;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,20rem]">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClasses}>
            Brand
            <select
              value={brand}
              onChange={(event) => handleBrandChange(event.target.value)}
              className={fieldClasses}
            >
              {brands.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClasses}>
            Model
            <select
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className={fieldClasses}
            >
              {modelsForBrand.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClasses}>
            Year of manufacture
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className={fieldClasses}
            >
              {years.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClasses}>
            Condition
            <select
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
              className={fieldClasses}
            >
              {modelMetadata.categories.condition.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClasses}>
            Transmission
            <select
              value={transmission}
              onChange={(event) => setTransmission(event.target.value)}
              className={fieldClasses}
            >
              {modelMetadata.categories.transmission.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClasses}>
            Fuel type
            <select
              value={fuelType}
              onChange={(event) => setFuelType(event.target.value)}
              className={fieldClasses}
            >
              {modelMetadata.categories.fuelType.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClasses}>
            {fuelType === 'Electric' ? 'Motor rating (kW)' : 'Engine capacity (cc)'}
            <input
              type="number"
              min={0}
              max={8000}
              value={engineCc}
              onChange={(event) => setEngineCc(event.target.value)}
              className={fieldClasses}
              required
            />
          </label>

          <label className={labelClasses}>
            Mileage (km)
            <input
              type="number"
              min={0}
              max={1000000}
              step={500}
              value={mileageKm}
              onChange={(event) => setMileageKm(event.target.value)}
              className={fieldClasses}
              required
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
        >
          <SparklesIcon className="h-4 w-4" aria-hidden="true" />
          {status === 'loading' ? 'Estimating…' : 'Estimate price'}
        </button>
      </form>

      <aside
        aria-label="Estimate result"
        aria-live="polite"
        className="flex flex-col justify-center rounded-2xl border border-brand-200 bg-brand-50/60 p-6 transition-colors duration-300 dark:border-brand-900 dark:bg-brand-950/40"
      >
        {status === 'idle' && (
          <p className="text-sm text-brand-800/80 dark:text-brand-300/80">
            Fill in your vehicle&apos;s details and we&apos;ll estimate its current market value
            from {modelMetadata.metrics.rows.toLocaleString('en-GB')} real listings.
          </p>
        )}

        {status === 'loading' && (
          <div className="space-y-3" aria-busy="true">
            <div className="h-8 w-44 animate-pulse rounded-lg bg-brand-200/60 dark:bg-brand-900/60" />
            <div className="h-4 w-full animate-pulse rounded bg-brand-200/40 dark:bg-brand-900/40" />
          </div>
        )}

        {status === 'success' && result && (
          <div className="animate-fade-in">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
              Estimated market value
            </p>
            <p className="mt-1 text-3xl font-bold text-brand-900 dark:text-brand-200">
              {formatLKR(result.predictedPrice)}
            </p>
            <p className="mt-2 text-xs text-brand-700/80 dark:text-brand-400/80">
              Typical range: {formatLKR(result.predictedPrice * (1 - uncertaintyPct / 100))} –{' '}
              {formatLKR(result.predictedPrice * (1 + uncertaintyPct / 100))}
            </p>
            <p className="mt-4 text-[11px] text-brand-700/60 dark:text-brand-400/60">
              {result.engine === 'onnx' ? 'ONNX model' : 'Statistical estimator'} ·{' '}
              {result.latencyMs} ms · estimates are indicative, not formal valuations.
            </p>
          </div>
        )}

        {status === 'error' && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      </aside>
    </div>
  );
}
