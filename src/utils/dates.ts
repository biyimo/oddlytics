/*
 * Date helpers. Matches carry `day` = days from today. When a real API returns
 * ISO kick-off times, convert them with dayOffsetFromDate() and format the time
 * on the device so it shows in the user's own time zone.
 */
export function dateFor(offset: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}
export function dayLabel(offset: number) {
  if (offset === 0) return 'Today';
  if (offset === -1) return 'Yesterday';
  if (offset === 1) return 'Tomorrow';
  return dateFor(offset).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
export function shortDay(offset: number) {
  if (offset === 0) return 'Today';
  if (offset === -1) return 'Yest.';
  if (offset === 1) return 'Tom.';
  return dateFor(offset).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
}
export function longDate(offset: number) {
  return dateFor(offset).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}
export function ago(min: number) {
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  return `${Math.round(min / 60)} h ago`;
}

export function railLabel(offset: number) {
  if (offset === 0) return 'Today';
  if (offset === -1) return 'Yest.';
  if (offset === 1) return 'Tom.';
  return dateFor(offset).toLocaleDateString('en-GB', { weekday: 'short' });
}

export function ordinal(n: number) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  const suffix = n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th';
  return `${n}${suffix}`;
}

/** Whole days between today (local midnight) and the given date. */
export function dayOffsetFromDate(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - dateFor(0).getTime()) / 86400000);
}
