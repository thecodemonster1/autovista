'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useRef, useState } from 'react';

interface CarouselProps {
  children: React.ReactNode;
  /** Accessible label for the scroll region. */
  ariaLabel: string;
}

/**
 * Horizontally scrolling, snap-aligned carousel with previous/next controls.
 * Items are the direct children; give each a fixed width and `snap-start`.
 */
export function Carousel({ children, ariaLabel }: CarouselProps): React.JSX.Element {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback((): void => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    setCanScrollLeft(track.scrollLeft > 8);
    setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [updateScrollState]);

  const scrollByPage = (direction: 1 | -1): void => {
    const track = trackRef.current;
    track?.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: 'smooth' });
  };

  const controlClasses =
    'flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-brand-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-400 dark:hover:text-brand-400';

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={updateScrollState}
        role="region"
        aria-label={ariaLabel}
        className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
      >
        {children}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          disabled={!canScrollLeft}
          aria-label="Scroll to previous vehicles"
          className={controlClasses}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          disabled={!canScrollRight}
          aria-label="Scroll to next vehicles"
          className={controlClasses}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
