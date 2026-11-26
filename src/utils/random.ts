/* Deterministic pseudo-random helpers used by the sample data. */
export function hash(s: string) {
  let x = 7;
  for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0;
  return x;
}
export function seeded(s: string, min: number, max: number, dp = 0) {
  const v = min + ((hash(s) % 1000) / 1000) * (max - min);
  return Number(v.toFixed(dp));
}
