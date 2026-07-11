import { faFacebook, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faCarSide } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

const SOCIAL_LINKS = [
  { icon: faFacebook, label: 'AutoVista on Facebook', href: 'https://facebook.com' },
  { icon: faInstagram, label: 'AutoVista on Instagram', href: 'https://instagram.com' },
  { icon: faYoutube, label: 'AutoVista on YouTube', href: 'https://youtube.com' },
] as const;

/** Site footer with brand blurb, quick links and social icons. */
export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-slate-200 bg-white transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <FontAwesomeIcon icon={faCarSide} className="h-3.5 w-3.5" />
            </span>
            <span className="font-bold">
              Auto<span className="text-brand-600 dark:text-brand-400">Vista</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-500 dark:text-slate-400">
            Sri Lanka&apos;s smarter vehicle marketplace. Every listing comes with an AI price
            estimate trained on thousands of real advertisements.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Explore
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              { href: '/vehicles', label: 'Browse vehicles' },
              { href: '/estimate', label: 'Get a price estimate' },
              { href: '/favourites', label: 'Your favourites' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Follow us
          </h2>
          <div className="mt-3 flex gap-3">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand-400 dark:hover:text-brand-400"
              >
                <FontAwesomeIcon icon={social.icon} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
        © {new Date().getFullYear()} AutoVista. Prices are AI estimates and not formal valuations.
      </div>
    </footer>
  );
}
