'use client';

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
  /** Called with the trimmed search term after the debounce interval. */
  onSearch: (term: string) => void;
  placeholder?: string;
  initialValue?: string;
  /** Debounce interval in milliseconds. */
  delayMs?: number;
}

/** Debounced search input with a clear button. */
export function SearchBar({
  onSearch,
  placeholder = 'Search by make, model or location…',
  initialValue = '',
  delayMs = 300,
}: SearchBarProps): React.JSX.Element {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, delayMs);

  // Keep the latest callback in a ref so the emit effect does not re-fire
  // when a parent re-renders with a new function identity.
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  const lastEmitted = useRef(initialValue);
  useEffect(() => {
    const term = debouncedValue.trim();
    if (term !== lastEmitted.current) {
      lastEmitted.current = term;
      onSearchRef.current(term);
    }
  }, [debouncedValue]);

  return (
    <div className="relative">
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        role="searchbox"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label="Search vehicles"
        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm shadow-sm outline-none transition-colors duration-300 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => setValue('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
