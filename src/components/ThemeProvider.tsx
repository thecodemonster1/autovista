'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/** Supported colour themes. */
export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'autovista:theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Provides the current theme and a toggle to the component tree.
 *
 * The `dark` class is applied to `<html>` before hydration by an inline
 * script in the root layout (avoiding a flash of the wrong theme); this
 * provider reads that initial state after mount and persists changes to
 * localStorage.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback((): void => {
    setTheme((previous) => {
      const next: Theme = previous === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Persisting the preference is best-effort.
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Access the current theme. Must be used within a `ThemeProvider`. */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
