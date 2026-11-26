/*
 * API-Football settings, read from EXPO_PUBLIC_* variables in .env.
 *
 * The app never holds the API-Football key. It calls a proxy (the dev proxy in
 * server/dev-proxy.mjs, or the Supabase Edge Function in supabase/functions/football)
 * that adds the key on the server and caches responses for every user.
 */

/* Expo only inlines EXPO_PUBLIC_* when written out in full as process.env.NAME, so no dynamic lookups here. */
const clean = (v: string | undefined) => (v ?? '').trim();

/**
 * Default competitions, in display order: NPFL, CAF Champions League, CAF Confederation Cup, Premier League,
 * Championship, LaLiga, Serie A, Bundesliga, Ligue 1, Eredivisie, Primeira Liga, Champions League,
 * Europa League, Conference League.
 */
const DEFAULT_LEAGUES = [399, 12, 20, 39, 40, 140, 135, 78, 61, 88, 94, 2, 3, 848];

function parseLeagues(raw: string): number[] | 'all' {
  if (raw.toLowerCase() === 'all') return 'all';
  const ids = raw
    .split(',')
    .map((x) => parseInt(x.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  return ids.length ? ids : DEFAULT_LEAGUES;
}

const int = (raw: string, fallback: number) => {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export const AF_CONFIG = {
  /** Base URL of the proxy, e.g. http://192.168.1.20:8787 or https://<ref>.supabase.co/functions/v1/football */
  proxyUrl: clean(process.env.EXPO_PUBLIC_FOOTBALL_PROXY_URL).replace(/\/$/, ''),
  /** Supabase anon (public) key, only needed when the proxy is a Supabase Edge Function. Safe to ship. */
  supabaseAnonKey: clean(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  /** League ids in display order, or 'all' for every league API-Football returns. */
  leagues: parseLeagues(clean(process.env.EXPO_PUBLIC_FOOTBALL_LEAGUES)),
  /** Days either side of today to load. The free plan only allows yesterday, today and tomorrow (1). */
  dayRange: Math.min(7, int(clean(process.env.EXPO_PUBLIC_FOOTBALL_DAY_RANGE), 1)),
  /** Most predictions to prefetch per load for the match lists. Each one is a request (free plan: 100/day). */
  prefetchPredictions: int(clean(process.env.EXPO_PUBLIC_FOOTBALL_PREFETCH_PREDICTIONS), 20),
};

export const isApiFootballConfigured = () => AF_CONFIG.proxyUrl.length > 0;
