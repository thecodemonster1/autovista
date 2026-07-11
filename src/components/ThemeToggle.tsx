'use client';

import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

import { useTheme } from './ThemeProvider';

/** Sun/moon button that switches between light and dark themes. */
export function ThemeToggle(): React.JSX.Element {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="rounded-full border border-slate-200 p-2 text-slate-600 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}
