'use client';

import { HeartIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { VehicleCard } from '@/components/VehicleCard';
import { useFavourites } from '@/hooks/useFavourites';
import { getVehicleById } from '@/lib/vehicles';
import type { Vehicle } from '@/lib/types';

/** Favourites page listing every bookmarked vehicle from localStorage. */
export default function FavouritesPage(): React.JSX.Element {
  const { favourites, isReady } = useFavourites();

  const vehicles = favourites
    .map((id) => getVehicleById(id))
    .filter((vehicle): vehicle is Vehicle => vehicle !== undefined);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Your favourites</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Saved on this device — no account needed.
      </p>

      <div className="mt-8">
        {!isReady ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70"
              />
            ))}
          </div>
        ) : vehicles.length > 0 ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <li key={vehicle.id}>
                <VehicleCard vehicle={vehicle} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 py-20 text-center dark:border-slate-700">
            <HeartIcon
              className="h-12 w-12 text-slate-300 dark:text-slate-600"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-slate-600 dark:text-slate-300">No favourites yet</p>
              <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                Tap the heart on any listing to save it here.
              </p>
            </div>
            <Link
              href="/vehicles"
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition-colors hover:bg-brand-700"
            >
              Browse vehicles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
