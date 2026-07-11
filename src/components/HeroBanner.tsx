import { faBolt, faChartLine, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { modelMetadata } from '@/lib/encoders';

const HIGHLIGHTS = [
  {
    icon: faChartLine,
    title: 'Data-driven pricing',
    detail: `Trained on ${modelMetadata.metrics.rows.toLocaleString('en-GB')} real listings`,
  },
  {
    icon: faBolt,
    title: 'Instant estimates',
    detail: 'Predictions served in milliseconds',
  },
  {
    icon: faShieldHalved,
    title: 'Negotiate with confidence',
    detail: 'Spot overpriced listings at a glance',
  },
] as const;

/** Home-page hero with headline, calls to action and trust highlights. */
export function HeroBanner(): React.JSX.Element {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-violet-700">
      {/* Decorative glows */}
      <div
        aria-hidden="true"
        className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-200">
          Sri Lanka&apos;s smarter vehicle marketplace
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Know the right price <span className="text-amber-300">before</span> you buy.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-brand-100">
          Every listing on AutoVista carries an AI price estimate trained on thousands of real Sri
          Lankan vehicle advertisements — so you never overpay again.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/vehicles"
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-800 shadow-lg transition-transform hover:scale-[1.03]"
          >
            Browse vehicles
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/estimate"
            className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Value my vehicle
          </Link>
        </div>

        <dl className="mt-12 grid max-w-3xl gap-6 sm:grid-cols-3">
          {HIGHLIGHTS.map((highlight) => (
            <div key={highlight.title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-300">
                <FontAwesomeIcon icon={highlight.icon} className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <dt className="text-sm font-semibold text-white">{highlight.title}</dt>
                <dd className="text-xs text-brand-200">{highlight.detail}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
