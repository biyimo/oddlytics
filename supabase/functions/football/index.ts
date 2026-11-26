/*
 * Supabase Edge Function: API-Football proxy with a shared cache.
 *
 * The app calls https://<project-ref>.supabase.co/functions/v1/football/<endpoint>?<query>
 * and this function adds the key and forwards to v3.football.api-sports.io.
 * Answers are cached in the api_football_cache table, so every user of the app
 * shares one set of upstream requests (the free plan allows 100 a day).
 *
 * Setup (once):
 *   supabase secrets set APIFOOTBALL_KEY=<your key>
 *   supabase db push                      # creates api_football_cache (supabase/migrations)
 *   supabase functions deploy football
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

const UPSTREAM = 'https://v3.football.api-sports.io';
const KEY = Deno.env.get('APIFOOTBALL_KEY') ?? '';
const ALLOWED = new Set([
  'status',
  'fixtures',
  'predictions',
  'odds',
  'standings',
  'leagues',
  'teams',
  'fixtures/headtohead',
  'fixtures/lineups',
  'fixtures/events',
  'fixtures/statistics',
]);

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'accept, authorization, apikey, content-type, x-client-info',
  'Access-Control-Expose-Headers': 'x-ratelimit-requests-remaining, x-ratelimit-remaining, x-cache',
};

type Envelope = { errors?: unknown; response?: { fixture?: { status?: { short?: string } } }[] };

/* Seconds to keep an answer. Keep in step with server/dev-proxy.mjs. */
function ttlFor(path: string, params: URLSearchParams, body: Envelope): number {
  const errs = body?.errors as Record<string, string> | unknown[] | undefined;
  const hasErrors = errs && (Array.isArray(errs) ? errs.length : Object.keys(errs).length);
  if (hasErrors) return !Array.isArray(errs) && errs.plan ? 12 * 3600 : 0;
  if (path === 'fixtures' && params.get('date')) {
    const today = new Date().toISOString().slice(0, 10);
    const d = params.get('date')!;
    return d < today ? 24 * 3600 : d === today ? 20 * 60 : 3 * 3600;
  }
  if (path === 'fixtures' && params.get('id')) {
    const st = body?.response?.[0]?.fixture?.status?.short ?? '';
    if (['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(st)) return 7 * 86400;
    if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'].includes(st)) return 120;
    return 15 * 60;
  }
  if (path === 'fixtures' && params.get('live')) return 60;
  const table: Record<string, number> = {
    predictions: 12 * 3600,
    odds: 3 * 3600,
    standings: 6 * 3600,
    leagues: 7 * 86400,
    teams: 86400,
    status: 0,
  };
  return table[path] ?? 600;
}

const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json', ...extra },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'GET') return json(405, { errors: { proxy: 'GET only' } });
  if (!KEY) return json(500, { errors: { proxy: 'APIFOOTBALL_KEY secret is not set' } });

  const url = new URL(req.url);
  /* Path arrives as /football/<endpoint> (or /functions/v1/football/<endpoint> locally). */
  const path = url.pathname.replace(/^.*?\/football\/?/, '').replace(/\/+$/, '');
  if (!ALLOWED.has(path)) return json(404, { errors: { proxy: `Not allowed: /${path}` } });
  url.searchParams.sort();
  const key = `${path}?${url.searchParams}`;

  const { data: hit } = await db.from('api_football_cache').select('body, expires_at').eq('key', key).maybeSingle();
  if (hit && new Date(hit.expires_at).getTime() > Date.now()) return json(200, hit.body, { 'x-cache': 'HIT' });

  try {
    const up = await fetch(`${UPSTREAM}/${key}`, { headers: { 'x-apisports-key': KEY } });
    const text = await up.text();
    let parsed: Envelope | null = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
    const ttl = up.ok && parsed ? ttlFor(path, url.searchParams, parsed) : 0;
    if (ttl > 0) {
      await db.from('api_football_cache').upsert({ key, body: text, expires_at: new Date(Date.now() + ttl * 1000).toISOString() });
    }
    const extra: Record<string, string> = { 'x-cache': 'MISS' };
    const day = up.headers.get('x-ratelimit-requests-remaining');
    const minute = up.headers.get('x-ratelimit-remaining');
    if (day) extra['x-ratelimit-requests-remaining'] = day;
    if (minute) extra['x-ratelimit-remaining'] = minute;
    return json(up.status, text, extra);
  } catch (e) {
    if (hit) return json(200, hit.body, { 'x-cache': 'STALE' });
    return json(502, { errors: { proxy: String((e as Error)?.message ?? e) } });
  }
});
