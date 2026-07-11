/**
 * Stylised vehicle artwork used in place of photography.
 *
 * Renders a brand-tinted gradient with a vector car silhouette, keeping the
 * bundle free of image assets while giving each brand a distinct identity.
 */

interface VehicleArtProps {
  brand: string;
  /** Accessible description, e.g. the listing title. */
  label: string;
  className?: string;
}

const BRAND_GRADIENTS: Record<string, string> = {
  Toyota: 'from-rose-500 via-rose-400 to-orange-300',
  Honda: 'from-sky-500 via-sky-400 to-cyan-300',
  Suzuki: 'from-blue-600 via-blue-500 to-indigo-400',
  Nissan: 'from-slate-600 via-slate-500 to-slate-400',
  Daihatsu: 'from-emerald-500 via-emerald-400 to-teal-300',
  'Mercedes Benz': 'from-zinc-700 via-zinc-600 to-zinc-400',
  BMW: 'from-indigo-600 via-indigo-500 to-blue-400',
  BYD: 'from-teal-500 via-teal-400 to-emerald-300',
  Kia: 'from-red-600 via-red-500 to-rose-400',
  Audi: 'from-neutral-700 via-neutral-600 to-neutral-400',
};

const DEFAULT_GRADIENT = 'from-brand-600 via-brand-500 to-violet-400';

/** Decorative card artwork for a vehicle listing. */
export function VehicleArt({ brand, label, className = '' }: VehicleArtProps): React.JSX.Element {
  const gradient = BRAND_GRADIENTS[brand] ?? DEFAULT_GRADIENT;

  return (
    <div
      role="img"
      aria-label={label}
      className={`relative flex items-end justify-center overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
    >
      <span className="absolute left-4 top-3 text-xs font-semibold uppercase tracking-widest text-white/70">
        {brand}
      </span>
      <svg
        viewBox="0 0 240 110"
        aria-hidden="true"
        className="w-4/5 max-w-xs translate-y-2 drop-shadow-lg"
      >
        {/* Car body */}
        <path
          d="M18 82 C20 68 30 61 48 58 L70 54 C82 40 100 32 122 32 L148 34 C166 36 180 44 190 55 L208 59 C218 62 224 69 224 78 L224 84 C224 88 221 90 217 90 L206 90 A18 18 0 0 0 170 90 L106 90 A18 18 0 0 0 70 90 L24 90 C20 90 17 87 18 82 Z"
          fill="rgba(255,255,255,0.9)"
        />
        {/* Windows */}
        <path d="M84 54 L74 55 C82 44 96 38 112 37 L112 54 Z" fill="rgba(30,41,59,0.55)" />
        <path d="M120 54 L120 37 L146 39 C158 41 168 47 176 55 Z" fill="rgba(30,41,59,0.55)" />
        {/* Wheels */}
        <circle cx="88" cy="90" r="13" fill="#1e293b" />
        <circle cx="88" cy="90" r="5.5" fill="#cbd5e1" />
        <circle cx="188" cy="90" r="13" fill="#1e293b" />
        <circle cx="188" cy="90" r="5.5" fill="#cbd5e1" />
      </svg>
    </div>
  );
}
