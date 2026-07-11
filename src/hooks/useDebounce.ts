'use client';

import { useEffect, useState } from 'react';

/**
 * Return a value that only updates after it has been stable for `delayMs`.
 * Useful for throttling expensive work (filtering, network calls) behind
 * fast-changing inputs such as search boxes.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
