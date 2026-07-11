import {
  faCar,
  faGasPump,
  faGaugeHigh,
  faGears,
  faPalette,
  faStamp,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ArrowLeftIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { FavouriteButton } from '@/components/FavouriteButton';
import { PredictedPriceBadge } from '@/components/PredictedPriceBadge';
import { VehicleArt } from '@/components/VehicleArt';
import { formatDate, formatEngine, formatLKR, formatMileage } from '@/lib/format';
import { getAllVehicles, getVehicleById } from '@/lib/vehicles';

interface VehicleDetailPageProps {
  params: { id: string };
}

/** Pre-render every catalogue vehicle at build time. */
export function generateStaticParams(): Array<{ id: string }> {
  return getAllVehicles().map((vehicle) => ({ id: vehicle.id }));
}

export function generateMetadata({ params }: VehicleDetailPageProps): Metadata {
  const vehicle = getVehicleById(params.id);
  return {
    title: vehicle ? vehicle.title : 'Vehicle not found',
    description: vehicle?.description,
  };
}

interface SpecItem {
  label: string;
  value: string;
  icon: IconDefinition;
}

/** Vehicle detail page with full specifications and the AI price estimate. */
export default function VehicleDetailPage({ params }: VehicleDetailPageProps): React.JSX.Element {
  const vehicle = getVehicleById(params.id);
  if (!vehicle) {
    notFound();
  }

  const specs: SpecItem[] = [
    { label: 'Mileage', value: formatMileage(vehicle.mileageKm), icon: faGaugeHigh },
    { label: 'Fuel type', value: vehicle.fuelType, icon: faGasPump },
    { label: 'Transmission', value: vehicle.transmission, icon: faGears },
    { label: 'Engine', value: formatEngine(vehicle.engineCc, vehicle.fuelType), icon: faCar },
    { label: 'Condition', value: vehicle.condition, icon: faStamp },
    { label: 'Colour', value: vehicle.colour, icon: faPalette },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/vehicles"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        Back to listings
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr,22rem]">
        <div>
          <div className="relative overflow-hidden rounded-3xl">
            <VehicleArt
              brand={vehicle.brand}
              label={vehicle.title}
              className="aspect-[16/9] w-full"
            />
            <FavouriteButton
              vehicleId={vehicle.id}
              vehicleTitle={vehicle.title}
              className="absolute right-4 top-4 h-10 w-10"
            />
          </div>

          <div className="mt-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{vehicle.title}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4" aria-hidden="true" />
                {vehicle.location}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                Posted {formatDate(vehicle.postedAt)}
              </span>
              <span>{vehicle.sellerType}</span>
            </p>
          </div>

          <section className="mt-6" aria-label="Specifications">
            <h2 className="text-lg font-semibold">Specifications</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[{ label: 'Year', value: String(vehicle.year), icon: faCar }, ...specs].map(
                (spec) => (
                  <div
                    key={spec.label}
                    className="rounded-xl border border-slate-200 bg-white p-3.5 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <dt className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                      <FontAwesomeIcon icon={spec.icon} className="h-3 w-3" aria-hidden="true" />
                      {spec.label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold">{spec.value}</dd>
                  </div>
                ),
              )}
            </dl>
          </section>

          <section className="mt-6" aria-label="Description">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
              {vehicle.description}
            </p>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Advertised price
            </p>
            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
              {formatLKR(vehicle.price)}
            </p>
          </div>
          <PredictedPriceBadge vehicle={vehicle} />
        </aside>
      </div>
    </div>
  );
}
