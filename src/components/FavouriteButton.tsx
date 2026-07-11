'use client';

import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import { useFavourites } from '@/hooks/useFavourites';

interface FavouriteButtonProps {
  vehicleId: string;
  /** Accessible name of the vehicle, e.g. its title. */
  vehicleTitle: string;
  className?: string;
}

/** Heart toggle that bookmarks a vehicle into localStorage favourites. */
export function FavouriteButton({
  vehicleId,
  vehicleTitle,
  className = '',
}: FavouriteButtonProps): React.JSX.Element {
  const { isFavourite, toggleFavourite, isReady } = useFavourites();
  const active = isReady && isFavourite(vehicleId);

  return (
    <button
      type="button"
      onClick={() => toggleFavourite(vehicleId)}
      aria-pressed={active}
      aria-label={
        active ? `Remove ${vehicleTitle} from favourites` : `Add ${vehicleTitle} to favourites`
      }
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform hover:scale-110 dark:bg-slate-900/90 ${className}`}
    >
      {active ? (
        <HeartSolidIcon className="h-5 w-5 text-rose-500" />
      ) : (
        <HeartOutlineIcon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
      )}
    </button>
  );
}
