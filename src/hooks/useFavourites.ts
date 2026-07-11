'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'autovista:favourites';
/** Custom event used to keep every mounted hook instance in sync. */
const FAVOURITES_EVENT = 'autovista:favourites-changed';

/** Read and sanitise the favourites list from localStorage. */
function readFavourites(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

/**
 * Favourite (bookmarked) vehicle ids, persisted in localStorage.
 *
 * All mounted instances stay in sync via a custom window event, and other
 * browser tabs are covered by the native `storage` event. `isReady` is false
 * until after hydration so server and first client render always match.
 */
export function useFavourites(): {
  favourites: string[];
  isReady: boolean;
  isFavourite: (id: string) => boolean;
  toggleFavourite: (id: string) => void;
} {
  const [favourites, setFavourites] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const sync = (): void => setFavourites(readFavourites());
    sync();
    setIsReady(true);
    window.addEventListener(FAVOURITES_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(FAVOURITES_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggleFavourite = useCallback((id: string): void => {
    const current = readFavourites();
    const next = current.includes(id)
      ? current.filter((favouriteId) => favouriteId !== id)
      : [...current, id];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage may be unavailable (private browsing quota); state still updates below.
    }
    window.dispatchEvent(new Event(FAVOURITES_EVENT));
  }, []);

  const isFavourite = useCallback((id: string): boolean => favourites.includes(id), [favourites]);

  return { favourites, isReady, isFavourite, toggleFavourite };
}
