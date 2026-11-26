#!/usr/bin/env node
/*
 * Oddlytics dev proxy for API-Football. No dependencies: `npm run proxy`.
 *
 * The app calls this server; this server adds the API key and forwards the
 * request to v3.football.api-sports.io. The key stays on your computer and is
 * never bundled into the app.
 *
 * - Reads APIFOOTBALL_KEY from .env (NOT an EXPO_PUBLIC_ variable, so Expo never ships it).
 * - Only forwards the endpoints the app uses.
 * - Caches answers in memory and in server/.cache/cache.json, so restarts and
 *   several phones share one set of requests (free plan: 100 a day).
 *
 * Point the app at it with EXPO_PUBLIC_FOOTBALL_PROXY_URL=http://<this computer's LAN IP>:8787
 * (Expo Go on a phone can't reach "localhost" on your computer).
 */
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

function readEnv(file) {
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return out;
}

const env = { ...readEnv(join(root, '.env')), ...process.env };
const KEY = env.APIFOOTBALL_KEY;
const PORT = Number(env.PROXY_PORT || 8787);
const UPSTREAM = env.APIFOOTBALL_UPSTREAM || 'https://v3.football.api-sports.io';
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

if (!KEY) {
  console.error('APIFOOTBALL_KEY is missing. Add it to .env (see .env.example).');
  process.exit(1);
}

/* ---------- cache ---------- */
const cacheDir = join(here, '.cache');
const cacheFile = join(cacheDir, 'cache.json');
let cache = {};
try {
  cache = JSON.parse(readFileSync(cacheFile, 'utf8'));
} catch {
  cache = {};
}
let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const now = Date.now();
    for (const [k, v] of Object.entries(cache)) if (now - v.at > v.ttl * 1000) delete cache[k];
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(cacheFile, JSON.stringify(cache));
  }, 1000);
}

/* Seconds to keep an answer. Keep in step with supabase/functions/football/index.ts. */
function ttlFor(path, params, body) {
  const errs = body?.errors;
  const hasErrors = errs && (Array.isArray(errs) ? errs.length : Object.keys(errs).length);
  if (hasErrors) return errs.plan ? 12 * 3600 : 0;
  if (path === 'fixtures' && params.get('date')) {
    const today = new Date().toISOString().slice(0, 10);
    const d = params.get('date');
    return d < today ? 24 * 3600 : d === today ? 20 * 60 : 3 * 3600;
  }
  if (path === 'fixtures' && params.get('id')) {
    const st = body?.response?.[0]?.fixture?.status?.short;
    if (['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(st)) return 7 * 86400;
    if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'].includes(st)) return 120;
    return 15 * 60;
  }
  if (path === 'fixtures' && params.get('live')) return 60;
  return { predictions: 12 * 3600, odds: 3 * 3600, standings: 6 * 3600, leagues: 7 * 86400, teams: 86400, status: 0 }[path] ?? 600;
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'accept, authorization, apikey, content-type',
  'Access-Control-Expose-Headers': 'x-ratelimit-requests-remaining, x-ratelimit-remaining, x-cache',
};

let used = 0;
const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return res.writeHead(204, cors).end();
  if (req.method !== 'GET') return res.writeHead(405, cors).end();
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname.replace(/^\/+|\/+$/g, '');
  if (!ALLOWED.has(path)) {
    res.writeHead(404, { ...cors, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ errors: { proxy: `Not allowed: /${path}` } }));
  }
  url.searchParams.sort();
  const key = `${path}?${url.searchParams}`;
  const hit = cache[key];
  if (hit && Date.now() - hit.at < hit.ttl * 1000) {
    res.writeHead(200, { ...cors, 'Content-Type': 'application/json', 'x-cache': 'HIT' });
    return res.end(hit.body);
  }
  try {
    const up = await fetch(`${UPSTREAM}/${key}`, { headers: { 'x-apisports-key': KEY } });
    const body = await up.text();
    used++;
    const day = up.headers.get('x-ratelimit-requests-remaining');
    const minute = up.headers.get('x-ratelimit-remaining');
    console.log(
      `${new Date().toLocaleTimeString()}  upstream /${key}  ->  ${up.status}  (left today: ${day ?? '?'}, this minute: ${minute ?? '?'})`,
    );
    let parsed = null;
    try {
      parsed = JSON.parse(body);
    } catch {
      /* not JSON */
    }
    const ttl = up.ok && parsed ? ttlFor(path, url.searchParams, parsed) : 0;
    if (ttl > 0) {
      cache[key] = { at: Date.now(), ttl, body };
      persist();
    }
    const headers = { ...cors, 'Content-Type': 'application/json', 'x-cache': 'MISS' };
    if (day != null) headers['x-ratelimit-requests-remaining'] = day;
    if (minute != null) headers['x-ratelimit-remaining'] = minute;
    res.writeHead(up.status, headers);
    res.end(body);
  } catch (e) {
    /* Upstream down: serve the old answer if we have one. */
    if (hit) {
      res.writeHead(200, { ...cors, 'Content-Type': 'application/json', 'x-cache': 'STALE' });
      return res.end(hit.body);
    }
    res.writeHead(502, { ...cors, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ errors: { proxy: String(e?.message ?? e) } }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i.address);
  console.log(`API-Football proxy on port ${PORT}. Set in .env:`);
  for (const ip of ips.length ? ips : ['localhost']) console.log(`  EXPO_PUBLIC_FOOTBALL_PROXY_URL=http://${ip}:${PORT}`);
  console.log('(use http://localhost:' + PORT + ' for the web build on this computer)');
});
process.on('SIGINT', () => {
  console.log(`\nUpstream requests this run: ${used}`);
  process.exit(0);
});
