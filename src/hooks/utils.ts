/** Tiny classnames helper — filters falsy values and joins with spaces. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

/** Format points with thousands separators, e.g. "24,850". */
export function formatPoints(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

/** Format an illustrative Thai baht amount, e.g. "฿3,106". */
export function formatThb(value: number): string {
  return `฿${Math.round(value).toLocaleString('en-US')}`;
}

/** Days until an ISO date relative to the demo "today" (2 Nov 2026). */
export function daysUntil(iso: string, today = '2026-11-02'): number {
  const a = new Date(`${iso}T00:00:00Z`).getTime();
  const b = new Date(`${today}T00:00:00Z`).getTime();
  return Math.round((a - b) / 86_400_000);
}

/** "15 Dec" style short date. */
export function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}
