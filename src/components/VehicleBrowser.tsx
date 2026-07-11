'use client';

import { FaceFrownIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';

import type { Vehicle } from '@/lib/types';

import { SearchBar } from './SearchBar';
import { VehicleCard } from './VehicleCard';
import { DEFAULT_FILTERS, VehicleFilters, type VehicleFilterState } from './VehicleFilters';

interface VehicleBrowserProps {
  vehicles: Vehicle[];
  /** Pre-selected brand, e.g. from a `?brand=` query parameter. */
  initialBrand?: string;
}

/** Apply the free-text search term across the listing's searchable fields. */
function matchesSearch(vehicle: Vehicle, term: string): boolean {
  if (term.length === 0) {
    return true;
  }
  const haystack =
    `${vehicle.title} ${vehicle.brand} ${vehicle.model} ${vehicle.location} ${vehicle.bodyType}`.toLowerCase();
  return term
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}

function matchesFilters(vehicle: Vehicle, filters: VehicleFilterState): boolean {
  if (filters.brand !== 'all' && vehicle.brand !== filters.brand) {
    return false;
  }
  if (filters.fuelType !== 'all' && vehicle.fuelType !== filters.fuelType) {
    return false;
  }
  if (filters.minPrice !== null && vehicle.price < filters.minPrice) {
    return false;
  }
  if (filters.maxPrice !== null && vehicle.price > filters.maxPrice) {
    return false;
  }
  if (filters.minYear !== null && vehicle.year < filters.minYear) {
    return false;
  }
  return true;
}

function sortVehicles(vehicles: Vehicle[], sort: VehicleFilterState['sort']): Vehicle[] {
  const sorted = [...vehicles];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'year-desc':
      return sorted.sort((a, b) => b.year - a.year);
    case 'newest':
    default:
      return sorted.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  }
}

/** Searchable, filterable, sortable vehicle listing grid. */
export function VehicleBrowser({ vehicles, initialBrand }: VehicleBrowserProps): React.JSX.Element {
  const brands = useMemo(
    () => [...new Set(vehicles.map((vehicle) => vehicle.brand))].sort(),
    [vehicles],
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<VehicleFilterState>(() =>
    initialBrand && brands.includes(initialBrand)
      ? { ...DEFAULT_FILTERS, brand: initialBrand }
      : DEFAULT_FILTERS,
  );

  const results = useMemo(() => {
    const filtered = vehicles.filter(
      (vehicle) => matchesSearch(vehicle, searchTerm) && matchesFilters(vehicle, filters),
    );
    return sortVehicles(filtered, filters.sort);
  }, [vehicles, searchTerm, filters]);

  return (
    <div className="space-y-5">
      <SearchBar onSearch={setSearchTerm} />
      <VehicleFilters filters={filters} onChange={setFilters} brands={brands} />

      <p className="text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
        {results.length === 1 ? '1 vehicle found' : `${results.length} vehicles found`}
      </p>

      {results.length > 0 ? (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((vehicle) => (
            <li key={vehicle.id}>
              <VehicleCard vehicle={vehicle} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <FaceFrownIcon
            className="h-10 w-10 text-slate-300 dark:text-slate-600"
            aria-hidden="true"
          />
          <p className="font-medium text-slate-600 dark:text-slate-300">
            No vehicles match your search
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Try removing a filter or broadening your search term.
          </p>
        </div>
      )}
    </div>
  );
}
