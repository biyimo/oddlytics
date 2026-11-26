/*
 * OddlyticsApi backed by API-Football (v3.football.api-sports.io), via a proxy.
 *
 * Request budget per device per day on the free plan (100/day, 10/minute):
 *   fixtures   1 per day shown (3 on free: yesterday, today, tomorrow), cached 20 min to 24 h
 *   standings  1 per league, cached 6 h (the free plan blocks the current season; we stop asking)
 *   predictions 1 per match, cached 12 h; up to EXPO_PUBLIC_FOOTBALL_PREFETCH_PREDICTIONS
 *              are loaded in the background, the rest when a match is opened
 *   match page 1 for events/lineups/stats (skipped until about 90 min before kick-off),
 *              1 for odds (upcoming only, cached 3 h)
 * The proxy caches the same way, so many users share one set of requests.
 */
import type { Competition, Match, MatchDetail, StandingRow, Team } from '../../types';
import { dateFor } from '../../utils/dates';
import { load, save } from '../storage';
import type { MatchUpdate, OddlyticsApi } from '../api';
import { AfError, afGet, afPeek, fixturesTtl, quota } from './client';
import { AF_CONFIG } from './config';
import {
  competitionOf,
  eventsOf,
  expectedGoalsOf,
  h2hOf,
  lineupsOf,
  matchOf,
  matchStatsOf,
  miniFixture,
  miniPrediction,
  oddsOf,
  seasonStatsOf,
  standingsOf,
  statusOf,
  teamOf,
  type MiniFixture,
  type MiniPrediction,
  type RawFixture,
  type RawOdds,
  type RawPrediction,
  type RawStanding,
} from './mappers';

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function deviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

const predPath = (id: string | number) => `predictions?fixture=${id}`;

type Odds = { odds: Record<string, number>; bookmaker?: string };
type Bundle = { fixtures: MiniFixture[]; preds: Record<string, MiniPrediction | null>; odds: Record<string, Odds | undefined> };

/* Days with no usable answer (plan limit, offline with no cache) are simply empty. */
async function loadDay(offset: number, tz: string): Promise<MiniFixture[]> {
  try {
    return await afGet<RawFixture[], MiniFixture[]>(`fixtures?date=${ymd(dateFor(offset))}&timezone=${encodeURIComponent(tz)}`, {
      ttl: fixturesTtl(offset),
      map: (r) => r.map(miniFixture),
    });
  } catch (e) {
    if (offset === 0 && !(e instanceof AfError && e.kind === 'plan')) throw e;
    return [];
  }
}

const STANDINGS_BLOCK = 'af1:planblock:standings';

export function createApiFootballApi(): OddlyticsApi {
  const leagueOrder = AF_CONFIG.leagues === 'all' ? [] : AF_CONFIG.leagues;
  const wanted = (leagueId: number) => AF_CONFIG.leagues === 'all' || AF_CONFIG.leagues.includes(leagueId);

  let bundle: { at: number; p: Promise<Bundle> } | null = null;

  function getBundle(): Promise<Bundle> {
    if (bundle && Date.now() - bundle.at < 30_000) return bundle.p;
    const p = (async () => {
      const tz = deviceTimeZone();
      const offsets: number[] = [];
      for (let d = -AF_CONFIG.dayRange; d <= AF_CONFIG.dayRange; d++) offsets.push(d);
      const days = await Promise.all(offsets.map((d) => loadDay(d, tz)));
      const seen = new Set<number>();
      const fixtures = days.flat().filter((f) => wanted(f.lg.id) && !seen.has(f.id) && seen.add(f.id));
      const preds: Record<string, MiniPrediction | null> = {};
      const odds: Record<string, Odds | undefined> = {};
      /* Only what's already cached: no requests here. */
      await Promise.all(
        fixtures.map(async (f) => {
          preds[f.id] = (await afPeek<MiniPrediction | null>(predPath(f.id))) ?? null;
          odds[f.id] = await afPeek<Odds>(`odds?fixture=${f.id}`);
        }),
      );
      return { fixtures, preds, odds };
    })();
    bundle = { at: Date.now(), p };
    p.catch(() => (bundle = null));
    return p;
  }

  const leagueRank = (id: number) => {
    const i = leagueOrder.indexOf(id);
    return i === -1 ? 999 : i;
  };

  function toMatches(b: Bundle): Match[] {
    const list = b.fixtures.map((f) => matchOf(f, b.preds[f.id], b.odds[f.id]?.odds)).filter((m): m is Match => m !== null);
    /* Featured: the five likeliest real picks of each day. */
    const byDay = new Map<number, Match[]>();
    for (const m of list) if (m.estimate !== 'pending') byDay.set(m.day, [...(byDay.get(m.day) ?? []), m]);
    for (const day of byDay.values()) for (const m of [...day].sort((a, c) => c.pick.p - a.pick.p).slice(0, 5)) m.featured = true;
    return list;
  }

  function seasonOf(b: Bundle, compId: string) {
    return b.fixtures.find((f) => String(f.lg.id) === compId)?.lg.season;
  }

  let standingsChain: Promise<unknown> = Promise.resolve();

  async function standings(compId: string): Promise<StandingRow[]> {
    const b = await getBundle();
    const season = seasonOf(b, compId);
    if (!season) return [];
    const block = await load<{ season: number; at: number }>(STANDINGS_BLOCK);
    if (block && Date.now() - block.at < 12 * 3600_000 && season >= block.season) return [];
    try {
      return await afGet<RawStanding[], StandingRow[]>(`standings?league=${compId}&season=${season}`, { ttl: 6 * 3600, map: standingsOf });
    } catch (e) {
      if (e instanceof AfError && e.kind === 'plan')
        await save(STANDINGS_BLOCK, { season: Math.min(season, block?.season ?? season), at: Date.now() });
      return [];
    }
  }

  async function prediction(id: string | number) {
    return afGet<RawPrediction[], MiniPrediction | null>(predPath(id), { ttl: 12 * 3600, map: miniPrediction });
  }

  return {
    async getCompetitions(): Promise<Competition[]> {
      const b = await getBundle();
      const teams = new Map<number, Set<string>>();
      const first = new Map<number, MiniFixture>();
      for (const f of b.fixtures) {
        if (!first.has(f.lg.id)) first.set(f.lg.id, f);
        const set = teams.get(f.lg.id) ?? new Set<string>();
        set.add(String(f.h.id)).add(String(f.a.id));
        teams.set(f.lg.id, set);
      }
      return [...first.values()]
        .sort(
          (a, c) =>
            leagueRank(a.lg.id) - leagueRank(c.lg.id) || a.lg.country.localeCompare(c.lg.country) || a.lg.name.localeCompare(c.lg.name),
        )
        .map((f) => competitionOf(f, [...(teams.get(f.lg.id) ?? [])]));
    },

    async getTeams(): Promise<Team[]> {
      const b = await getBundle();
      const out = new Map<string, Team>();
      for (const f of b.fixtures) {
        const p = b.preds[f.id];
        out.set(String(f.h.id), teamOf(f.h, p?.home.form ?? out.get(String(f.h.id))?.form));
        out.set(String(f.a.id), teamOf(f.a, p?.away.form ?? out.get(String(f.a.id))?.form));
      }
      return [...out.values()];
    },

    async getMatches(fromDay, toDay) {
      const b = await getBundle();
      return toMatches(b).filter((m) => m.day >= fromDay && m.day <= toDay);
    },

    getStandings(compId): Promise<StandingRow[]> {
      /* One at a time, so a "your plan can't" answer stops the rest from being asked. */
      const run = standingsChain.then(() => standings(compId));
      standingsChain = run.catch(() => undefined);
      return run;
    },

    async getMatchDetail(id): Promise<MatchUpdate & { detail: MatchDetail }> {
      const b = await getBundle();
      let mini = b.fixtures.find((f) => String(f.id) === id);
      const soon = !mini || statusOf(mini.st) !== 'upcoming' || mini.ts * 1000 - Date.now() < 90 * 60_000;

      const [raw, pred] = await Promise.all([
        soon
          ? afGet<RawFixture[], RawFixture | null>(`fixtures?id=${id}`, {
              ttl: (f) => {
                const st = f ? statusOf(f.fixture.status.short) : 'upcoming';
                return st === 'finished' ? 7 * 86400 : st === 'live' ? 120 : 15 * 60;
              },
              /* Drop per-player ratings: big and unused. */
              map: (r) => (r[0] ? ({ ...r[0], players: undefined } as RawFixture) : null),
            }).catch(() => null)
          : Promise.resolve(null),
        prediction(id).catch(() => b.preds[id] ?? null),
      ]);
      if (raw) mini = miniFixture(raw);
      if (pred !== undefined) b.preds[id] = pred;

      const isUpcoming = mini ? statusOf(mini.st) === 'upcoming' : false;
      const priced = isUpcoming
        ? await afGet<RawOdds[], Odds>(`odds?fixture=${id}`, { ttl: 3 * 3600, map: oddsOf }).catch(() => undefined)
        : undefined;

      if (priced) b.odds[id] = priced;
      const match = mini ? matchOf(mini, pred, priced?.odds ?? b.odds[id]?.odds) : null;
      const stats = raw ? matchStatsOf(raw) : undefined;
      const detail: MatchDetail = {
        source: 'api-football',
        matchStats: stats?.rows.length ? stats.rows : undefined,
        xg: stats?.xg,
        seasonStats: pred ? seasonStatsOf(pred) : undefined,
        expectedGoals: pred ? expectedGoalsOf(pred) : undefined,
        events: raw ? eventsOf(raw) : undefined,
        lineups: raw ? lineupsOf(raw) : undefined,
        h2h: pred && mini ? h2hOf(pred, mini.h.id) : undefined,
        advice: pred?.advice,
        odds: priced?.odds,
        bookmaker: priced?.bookmaker,
      };
      const teams = mini ? [teamOf(mini.h, pred?.home.form), teamOf(mini.a, pred?.away.form)] : [];
      return { match: match ?? undefined, teams, detail };
    },

    async enrichMatches(matches, onUpdate) {
      const b = await getBundle();
      const todo = matches
        .filter((m) => m.estimate === 'pending')
        .sort(
          (a, c) =>
            Number(a.status === 'finished') - Number(c.status === 'finished') ||
            Math.abs(a.day) - Math.abs(c.day) ||
            leagueRank(Number(a.comp)) - leagueRank(Number(c.comp)) ||
            a.time.localeCompare(c.time),
        )
        .slice(0, AF_CONFIG.prefetchPredictions);
      for (const m of todo) {
        /* Keep some of the daily quota for match pages. */
        if (quota.dayRemaining != null && quota.dayRemaining < 15) return;
        const f = b.fixtures.find((x) => String(x.id) === m.id);
        if (!f) continue;
        try {
          const p = await prediction(m.id);
          b.preds[m.id] = p;
          const match = matchOf(f, p, b.odds[m.id]?.odds);
          if (match) onUpdate({ match, teams: [teamOf(f.h, p?.home.form), teamOf(f.a, p?.away.form)] });
        } catch (e) {
          if (e instanceof AfError && (e.kind === 'limit' || e.kind === 'plan')) return;
        }
      }
    },
  };
}
