import { faGaugeHigh, faGasPump } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { formatLKR, formatMileage } from '@/lib/format';
import type { Vehicle } from '@/lib/types';

import { FavouriteButton } from './FavouriteButton';
import { VehicleArt } from './VehicleArt';

interface VehicleCardProps {
  vehicle: Vehicle;
}

/** Marketplace listing card linking to the vehicle detail page. */
export function VehicleCard({ vehicle }: VehicleCardProps): React.JSX.Element {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-card-dark">
      <Link href={`/vehicles/${vehicle.id}`} className="block">
        <div className="relative">
          <VehicleArt
            brand={vehicle.brand}
            label={vehicle.title}
            className="aspect-[16/10] w-full"
          />
          {vehicle.featured && (
            <span className="absolute bottom-3 left-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-semibold text-amber-950">
              Featured
            </span>
          )}
        </div>
        <div className="space-y-3 p-4">
          <h3 className="line-clamp-1 font-semibold text-slate-900 transition-colors group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-400">
            {vehicle.title}
          </h3>
          <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <dt className="sr-only">Year</dt>
              <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <dd>{vehicle.year}</dd>
            </div>
            <div className="flex items-center gap-1">
              <dt className="sr-only">Mileage</dt>
              <FontAwesomeIcon icon={faGaugeHigh} className="h-3 w-3" aria-hidden="true" />
              <dd>{formatMileage(vehicle.mileageKm)}</dd>
            </div>
            <div className="flex items-center gap-1">
              <dt className="sr-only">Fuel type</dt>
              <FontAwesomeIcon icon={faGasPump} className="h-3 w-3" aria-hidden="true" />
              <dd>{vehicle.fuelType}</dd>
            </div>
          </dl>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <p className="text-base font-bold text-brand-700 dark:text-brand-400">
              {formatLKR(vehicle.price)}
            </p>
            <p className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {vehicle.location}
            </p>
          </div>
        </div>
      </Link>
      <FavouriteButton
        vehicleId={vehicle.id}
        vehicleTitle={vehicle.title}
        className="absolute right-3 top-3"
      />
    </article>
  );
}
