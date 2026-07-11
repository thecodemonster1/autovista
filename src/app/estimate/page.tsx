import type { Metadata } from 'next';

import { PredictionForm } from '@/components/PredictionForm';
import { modelMetadata } from '@/lib/encoders';

export const metadata: Metadata = {
  title: 'Price estimate',
  description: 'Get an instant AI valuation for any vehicle in the Sri Lankan market.',
};

/** Standalone valuation page built around the prediction form. */
export default function EstimatePage(): React.JSX.Element {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Value my vehicle</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
        Our model was trained on {modelMetadata.metrics.rows.toLocaleString('en-GB')} real Sri
        Lankan listings and predicts prices with a median error of{' '}
        {modelMetadata.metrics.medianApePct}%. Choose your vehicle&apos;s details below for an
        instant market valuation.
      </p>
      <div className="mt-8">
        <PredictionForm />
      </div>
    </div>
  );
}
