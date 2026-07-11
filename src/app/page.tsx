import { faMagnifyingGlass, faRobot, faHandshake } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { Carousel } from '@/components/Carousel';
import { HeroBanner } from '@/components/HeroBanner';
import { VehicleCard } from '@/components/VehicleCard';
import { getCatalogueBrands, getFeaturedVehicles } from '@/lib/vehicles';

const HOW_IT_WORKS = [
  {
    icon: faMagnifyingGlass,
    title: 'Browse curated listings',
    detail: 'Search and filter vehicles by brand, price, year and fuel type.',
  },
  {
    icon: faRobot,
    title: 'AI checks the price',
    detail: 'Our ONNX model estimates fair market value for every listing in milliseconds.',
  },
  {
    icon: faHandshake,
    title: 'Decide with confidence',
    detail: 'Instantly see whether a listing is a bargain, fair, or worth negotiating down.',
  },
] as const;

/** Home page: hero, featured carousel, how-it-works and brand shortcuts. */
export default function HomePage(): React.JSX.Element {
  const featured = getFeaturedVehicles();
  const brands = getCatalogueBrands();

  return (
    <>
      <HeroBanner />

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured vehicles</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Hand-picked listings with strong price-to-value scores.
            </p>
          </div>
          <Link
            href="/vehicles"
            className="hidden items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 sm:flex dark:text-brand-400 dark:hover:text-brand-300"
          >
            View all
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <Carousel ariaLabel="Featured vehicles">
          {featured.map((vehicle) => (
            <div key={vehicle.id} className="w-72 shrink-0 snap-start sm:w-80">
              <VehicleCard vehicle={vehicle} />
            </div>
          ))}
        </Carousel>
      </section>

      <section className="border-y border-slate-200 bg-white py-14 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight">How AutoVista works</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, index) => (
              <li
                key={step.title}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="mt-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <FontAwesomeIcon icon={step.icon} className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight">Shop by brand</h2>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {brands.map((brand) => (
            <Link
              key={brand}
              href={`/vehicles?brand=${encodeURIComponent(brand)}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-400 dark:hover:text-brand-400"
            >
              {brand}
            </Link>
          ))}
        </div>

        <div className="mt-14 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 to-violet-700 px-8 py-12 text-center sm:px-14">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Selling your vehicle? Price it right from day one.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-brand-100">
            Overpriced listings sit unsold for months. Get a free AI valuation in seconds and
            attract serious buyers immediately.
          </p>
          <Link
            href="/estimate"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-800 shadow-lg transition-transform hover:scale-[1.03]"
          >
            Get my free estimate
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
