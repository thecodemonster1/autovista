'use client';

import { faCarSide } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Bars3Icon, HeartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { useFavourites } from '@/hooks/useFavourites';

import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/vehicles', label: 'Browse' },
  { href: '/estimate', label: 'Price estimate' },
] as const;

/** Sticky site header with navigation, favourites badge and theme toggle. */
export function Header(): React.JSX.Element {
  const pathname = usePathname();
  const { favourites, isReady } = useFavourites();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClasses = (href: string): string => {
    const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return isActive
      ? 'text-brand-600 dark:text-brand-400 font-semibold'
      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="AutoVista home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <FontAwesomeIcon icon={faCarSide} className="h-4 w-4" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Auto<span className="text-brand-600 dark:text-brand-400">Vista</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${linkClasses(link.href)}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/favourites"
            className={`relative flex items-center gap-1.5 transition-colors ${linkClasses('/favourites')}`}
          >
            <HeartIcon className="h-5 w-5" />
            Favourites
            {isReady && favourites.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-semibold text-white">
                {favourites.length}
              </span>
            )}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="rounded-full border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 md:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {menuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="border-t border-slate-200 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-slate-950"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {[...NAV_LINKS, { href: '/favourites', label: 'Favourites' } as const].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${linkClasses(link.href)}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
