/*
 * Small API-Football client: one request at a time, cached on the device.
 *
 * - Every response is cached in memory and in AsyncStorage with a time-to-live,
 *   so reopening the app does not spend requests (free plan: 100 a day, 10 a minute).
 * - "Your plan can't do this" answers are cached too, so we don't keep asking.
 * - Requests go to the proxy, which adds the key. The key is never in the app.
 */
import { load, save } from '../storage';
import { AF_CONFIG } from './config';

export type AfEnvelope<T> = {
  errors: unknown[] | Record<string, string>;
  results: number;
  paging?: { current: number; total: number };
  response: T;
};

export class AfError extends Error {
  constructor(
    message: string,
    /** plan: the subscription doesn't cover it. limit: daily quota used up. rate: per-minute limit. */
    public kind: 'plan' | 'limit' | 'rate' | 'http' | 'other',
  ) {
    super(message);
  }
}

type Entry<T> = { at: number; ttl: number; data?: T; blocked?: string };

const memory = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();
const CACHE_PREFIX = 'af1:';

/** What the last upstream response said about the quotas (null when unknown, e.g. served from the proxy cache). */
export const quota = { dayRemaining: null as number | null, minuteRemaining: null as number | null };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function errorOf(env: AfEnvelope<unknown>): AfError | null {
  const e = env.errors;
  if (!e || (Array.isArray(e) && e.length === 0)) return null;
  const obj = (Array.isArray(e) ? Object.assign({}, ...e) : e) as Record<string, string>;
  const keys = Object.keys(obj);
  if (!keys.length) return null;
  const msg = keys.map((k) => `${k}: ${obj[k]}`).join('; ');
  if (obj.plan) return new AfError(obj.plan, 'plan');
  if (obj.requests) return new AfError(obj.requests, 'limit');
  if (obj.rateLimit) return new AfError(obj.rateLimit, 'rate');
  return new AfError(msg, 'other');
}

/* Requests run one after another so we can respect the per-minute limit. */
let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(job: () => Promise<T>): Promise<T> {
  const run = queue.then(job, job);
  queue = run.catch(() => undefined);
  return run;
}

async function fetchUpstream<T>(path: string, retry = true): Promise<AfEnvelope<T>> {
  if (quota.minuteRemaining === 0) {
    await wait(61_000);
    quota.minuteRemaining = null;
  }
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (AF_CONFIG.supabaseAnonKey) {
    headers.apikey = AF_CONFIG.supabaseAnonKey;
    headers.Authorization = `Bearer ${AF_CONFIG.supabaseAnonKey}`;
  }
  const res = await fetch(`${AF_CONFIG.proxyUrl}/${path}`, { headers });
  const day = res.headers.get('x-ratelimit-requests-remaining');
  const minute = res.headers.get('x-ratelimit-remaining');
  if (day != null && day !== '') quota.dayRemaining = Number(day);
  if (minute != null && minute !== '') quota.minuteRemaining = Number(minute);
  if (!res.ok) throw new AfError(`Football data request failed (${res.status})`, 'http');
  const env = (await res.json()) as AfEnvelope<T>;
  const err = errorOf(env);
  if (err?.kind === 'rate' && retry) {
    await wait(61_000);
    return fetchUpstream<T>(path, false);
  }
  if (err) throw err;
  return env;
}

export type GetOptions<R, T> = {
  /** Seconds to keep the result. May depend on the data (e.g. finished matches keep longer). */
  ttl: number | ((data: T) => number);
  /** Trim the raw response to what the app needs before it's cached. */
  map: (response: R) => T;
  /** Skip the cache and ask again. */
  force?: boolean;
};

/**
 * GET an API-Football path such as "fixtures?date=2026-11-26", cached.
 * Throws AfError. A 'plan' error is remembered for 12 hours.
 */
export async function afGet<R, T>(path: string, opts: GetOptions<R, T>): Promise<T> {
  const key = CACHE_PREFIX + path;
  const now = Date.now();
  let hit = memory.get(key) as Entry<T> | undefined;
  if (!hit) {
    hit = await load<Entry<T>>(key);
    if (hit) memory.set(key, hit);
  }
  const stale = hit?.data;
  if (!opts.force) {
    if (hit && now - hit.at < hit.ttl * 1000) {
      if (hit.blocked) throw new AfError(hit.blocked, 'plan');
      return hit.data as T;
    }
  }
  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const job = enqueue(async () => {
    try {
      const env = await fetchUpstream<R>(path);
      const data = opts.map(env.response);
      const ttl = typeof opts.ttl === 'function' ? opts.ttl(data) : opts.ttl;
      const entry: Entry<T> = { at: Date.now(), ttl, data };
      memory.set(key, entry);
      void save(key, entry);
      return data;
    } catch (e) {
      if (e instanceof AfError && e.kind === 'plan') {
        const entry: Entry<T> = { at: Date.now(), ttl: 12 * 3600, blocked: e.message };
        memory.set(key, entry);
        void save(key, entry);
        throw e;
      }
      /* Offline or over the limit: an old answer beats no answer. */
      if (stale !== undefined) return stale;
      throw e;
    } finally {
      inflight.delete(key);
    }
  });
  inflight.set(key, job);
  return job;
}

/** Read a cached value without making a request (stale values included). */
export async function afPeek<T>(path: string): Promise<T | undefined> {
  const key = CACHE_PREFIX + path;
  const hit = (memory.get(key) as Entry<T> | undefined) ?? (await load<Entry<T>>(key));
  return hit?.data;
}

/** Time-to-live for a day of fixtures: past days rarely change, today changes as games are played. */
export function fixturesTtl(dayOffset: number) {
  if (dayOffset < 0) return 24 * 3600;
  if (dayOffset === 0) return 20 * 60;
  return 3 * 3600;
}
