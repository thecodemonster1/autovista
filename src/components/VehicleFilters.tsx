'use client';

import { AdjustmentsHorizontalIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

import { modelMetadata } from '@/lib/encoders';
import { formatLKRCompact } from '@/lib/format';

/** Sort orders for the listing grid. */
export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'year-desc';

/** Filter selections applied to the vehicle listing grid. */
export interface VehicleFilterState {
  /** Brand name, or `'all'`. */
  brand: string;
  /** Fuel type, or `'all'`. */
  fuelType: string;
  minPrice: number | null;
  maxPrice: number | null;
  minYear: number | null;
  sort: SortOption;
}

/** Neutral filter state (everything visible, newest first). */
export const DEFAULT_FILTERS: VehicleFilterState = {
  brand: 'all',
  fuelType: 'all',
  minPrice: null,
  maxPrice: null,
  minYear: null,
  sort: 'newest',
};

const PRICE_STEPS = [
  2_500_000, 5_000_000, 7_500_000, 10_000_000, 15_000_000, 20_000_000, 30_000_000, 50_000_000,
];

const YEAR_STEPS = [2000, 2005, 2010, 2015, 2018, 2020, 2022, 2024];

interface VehicleFiltersProps {
  filters: VehicleFilterState;
  onChange: (filters: VehicleFilterState) => void;
  /** Brands offered in the brand dropdown. */
  brands: string[];
}

const selectClasses =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-colors duration-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

/** Filter and sort controls for the vehicle listing page. */
export function VehicleFilters({
  filters,
  onChange,
  brands,
}: VehicleFiltersProps): React.JSX.Element {
  const update = (patch: Partial<VehicleFilterState>): void => onChange({ ...filters, ...patch });
  const parseNullableNumber = (value: string): number | null =>
    value === '' ? null : Number(value);

  return (
    <section
      aria-label="Filters"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <AdjustmentsHorizontalIcon className="h-4 w-4" aria-hidden="true" />
          Refine results
        </h2>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
        >
          <ArrowUturnLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
          Brand
          <select
            value={filters.brand}
            onChange={(event) => update({ brand: event.target.value })}
            className={`mt-1 ${selectClasses}`}
          >
            <option value="all">All brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
          Fuel type
          <select
            value={filters.fuelType}
            onChange={(event) => update({ fuelType: event.target.value })}
            className={`mt-1 ${selectClasses}`}
          >
            <option value="all">All fuels</option>
            {modelMetadata.categories.fuelType.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
          Min price
          <select
            value={filters.minPrice ?? ''}
            onChange={(event) => update({ minPrice: parseNullableNumber(event.target.value) })}
            className={`mt-1 ${selectClasses}`}
          >
            <option value="">No minimum</option>
            {PRICE_STEPS.map((price) => (
              <option key={price} value={price}>
                {formatLKRCompact(price)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
          Max price
          <select
            value={filters.maxPrice ?? ''}
            onChange={(event) => update({ maxPrice: parseNullableNumber(event.target.value) })}
            className={`mt-1 ${selectClasses}`}
          >
            <option value="">No maximum</option>
            {PRICE_STEPS.map((price) => (
              <option key={price} value={price}>
                {formatLKRCompact(price)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
          Year from
          <select
            value={filters.minYear ?? ''}
            onChange={(event) => update({ minYear: parseNullableNumber(event.target.value) })}
            className={`mt-1 ${selectClasses}`}
          >
            <option value="">Any year</option>
            {YEAR_STEPS.map((year) => (
              <option key={year} value={year}>
                {year} or newer
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
          Sort by
          <select
            value={filters.sort}
            onChange={(event) => update({ sort: event.target.value as SortOption })}
            className={`mt-1 ${selectClasses}`}
          >
            <option value="newest">Newest listings</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="year-desc">Year: newest first</option>
          </select>
        </label>
      </div>
    </section>
  );
}
