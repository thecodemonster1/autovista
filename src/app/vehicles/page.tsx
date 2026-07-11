import type { Metadata } from 'next';

import { VehicleBrowser } from '@/components/VehicleBrowser';
import { getAllVehicles } from '@/lib/vehicles';

export const metadata: Metadata = {
  title: 'Browse vehicles',
  description: 'Search, filter and compare vehicles for sale across Sri Lanka.',
};

interface VehiclesPageProps {
  searchParams?: {
    brand?: string;
  };
}

/** Vehicle listing page. Reads `?brand=` server-side to pre-filter the grid. */
export default function VehiclesPage({ searchParams }: VehiclesPageProps): React.JSX.Element {
  const vehicles = getAllVehicles();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Browse vehicles</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Every listing includes an AI price estimate on its detail page.
      </p>
      <div className="mt-6">
        <VehicleBrowser vehicles={vehicles} initialBrand={searchParams?.brand} />
      </div>
    </div>
  );
}
