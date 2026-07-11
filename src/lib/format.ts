/** Formatting helpers shared across the UI. */

const numberFormatter = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });

/**
 * Format a rupee amount in full, e.g. `Rs 12,500,000`.
 */
export function formatLKR(value: number): string {
  return `Rs ${numberFormatter.format(Math.round(value))}`;
}

/**
 * Format a rupee amount compactly for tight layouts, e.g. `Rs 12.5M`.
 */
export function formatLKRCompact(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `Rs ${millions.toFixed(millions >= 10 ? 1 : 2)}M`;
  }
  return formatLKR(value);
}

/**
 * Format a mileage reading, e.g. `68,000 km`.
 */
export function formatMileage(km: number): string {
  return `${numberFormatter.format(km)} km`;
}

/**
 * Format an engine specification. Electric vehicles store the motor rating in
 * the same field, so the unit switches accordingly.
 */
export function formatEngine(engineCc: number, fuelType: string): string {
  if (fuelType === 'Electric') {
    return `${numberFormatter.format(engineCc)} kW motor`;
  }
  return `${numberFormatter.format(engineCc)} cc`;
}

/**
 * Format an ISO date as a friendly UK-style date, e.g. `4 July 2026`.
 */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}
