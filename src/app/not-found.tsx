import Link from 'next/link';

/** Site-wide 404 page. */
export default function NotFound(): React.JSX.Element {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-28 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
        404
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">This page has driven off</h1>
      <p className="mt-3 max-w-md text-sm text-slate-500 dark:text-slate-400">
        The page you are looking for doesn&apos;t exist or the listing may have been sold.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-700"
      >
        Back to the showroom
      </Link>
    </div>
  );
}
