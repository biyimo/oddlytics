/*
 * API-Football response shapes (only the fields we use) and the mapping onto
 * the app's own types in src/types. Raw responses are trimmed before caching.
 */
import type {
  Competition,
  FormResult,
  RecentGame,
  Lineup,
  LineupPlayer,
  Match,
  MatchEvent,
  MatchStatus,
  StandingRow,
  StatRow,
  Team,
} from '../../types';
import { dayOffsetFromDate } from '../../utils/dates';
import { tipCode } from '../../utils/markets';
import { hash } from '../../utils/random';
import { candidates, choosePick, goalModel, implied, lambdas, normalise, type GoalModel } from './model';

/* ---------- raw shapes ---------- */

type RawTeamRef = { id: number; name: string; logo?: string };
type RawLeagueRef = {
  id: number;
  name: string;
  country: string;
  logo?: string;
  flag?: string | null;
  season: number;
  round?: string;
  standings?: boolean;
};

export type RawFixture = {
  fixture: { id: number; date: string; timestamp: number; status: { short: string; elapsed: number | null; extra?: number | null } };
  league: RawLeagueRef;
  teams: { home: RawTeamRef; away: RawTeamRef };
  goals: { home: number | null; away: number | null };
  events?: RawEvent[];
  lineups?: RawLineup[];
  statistics?: { team: RawTeamRef; statistics: { type: string; value: number | string | null }[] }[];
};

type RawEvent = {
  time: { elapsed: number; extra: number | null };
  team: RawTeamRef;
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
};

type RawPlayer = { player: { name: string; number: number | null; pos: string | null } };
type RawLineup = {
  team: RawTeamRef;
  formation: string | null;
  coach: { name: string | null } | null;
  startXI: RawPlayer[];
  substitutes: RawPlayer[];
};

type Split = { home: number | string | null; away: number | string | null; total: number | string | null };
type RawTeamLeagueStats = {
  form: string | null;
  fixtures: { played: Split };
  goals: { for: { total: Split; average: Split }; against: { total: Split; average: Split } };
  clean_sheet: Split;
  failed_to_score: Split;
};

export type RawPrediction = {
  predictions: { advice: string | null; under_over?: string | null; percent: { home: string; draw: string; away: string } };
  comparison: Record<string, { home: string; away: string }>;
  teams: { home: RawTeamRef & { league: RawTeamLeagueStats }; away: RawTeamRef & { league: RawTeamLeagueStats } };
  h2h: RawFixture[];
};

export type RawStanding = {
  league: {
    id: number;
    season: number;
    standings: {
      rank: number;
      team: RawTeamRef;
      points: number;
      form: string | null;
      all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
    }[][];
  };
};

export type RawOdds = {
  bookmakers: { id: number; name: string; bets: { id: number; name: string; values: { value: string; odd: string }[] }[] }[];
};

/* ---------- trimmed shapes we cache ---------- */

export type MiniFixture = {
  id: number;
  ts: number;
  st: string;
  el: number | null;
  lg: { id: number; name: string; country: string; logo?: string; season: number; standings?: boolean };
  h: RawTeamRef;
  a: RawTeamRef;
  g: [number, number] | null;
};

export type TeamSeason = {
  form: FormResult[];
  /** Venue of each of the last five games is unknown from this endpoint, so it's left out. */
  played: number;
  playedHome?: number;
  playedAway?: number;
  gfHome?: number;
  gaHome?: number;
  gfAway?: number;
  gaAway?: number;
  gfAvg?: number;
  gaAvg?: number;
  cleanSheets?: number;
  failedToScore?: number;
};

export type MiniPrediction = {
  at: number;
  percent: [number, number, number] | null;
  advice?: string;
  /** API-Football's goals call, e.g. "+2.5" or "-3.5". */
  underOver?: string;
  comparison: Record<string, [number, number]>;
  home: TeamSeason;
  away: TeamSeason;
  h2h: { homeId: number; hg: number; ag: number; year: number; date?: string }[];
};

/* ---------- helpers ---------- */

const num = (v: unknown): number | undefined => {
  if (v == null || v === '') return undefined;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace('%', ''));
  return Number.isFinite(n) ? n : undefined;
};

const pad = (n: number) => String(n).padStart(2, '0');

const CREST_COLOURS = [
  '#7B2FF7',
  '#C8102E',
  '#004D98',
  '#006A4E',
  '#E07B00',
  '#1D428A',
  '#8B0000',
  '#00843D',
  '#6CABDD',
  '#EF0107',
  '#132257',
  '#DA291C',
];

/** Three-letter code from a club name, skipping filler words like FC or AC. */
export function shortName(name: string) {
  const skip = new Set([
    'fc',
    'cf',
    'ac',
    'afc',
    'sc',
    'cd',
    'fk',
    'sk',
    'club',
    'de',
    'the',
    'real',
    'as',
    'ss',
    'us',
    'rc',
    'sv',
    'vfb',
    'vfl',
    '1.',
  ]);
  const words = name.split(/[\s-]+/).filter((w) => w && !skip.has(w.toLowerCase()));
  const w = words[0] ?? name;
  return (
    w
      .replace(/[^A-Za-zÀ-ÿ]/g, '')
      .slice(0, 3)
      .toUpperCase() || name.slice(0, 3).toUpperCase()
  );
}

export function formOf(raw: string | null | undefined): FormResult[] {
  return (raw ?? '')
    .toUpperCase()
    .split('')
    .filter((c): c is FormResult => c === 'W' || c === 'D' || c === 'L')
    .slice(-5);
}

export function statusOf(short: string): MatchStatus | 'skip' {
  if (['NS', 'TBD'].includes(short)) return 'upcoming';
  if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'].includes(short)) return 'live';
  if (['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(short)) return 'finished';
  return 'skip'; // PST, CANC, ABD: postponed, cancelled, abandoned
}

/* ---------- region grouping for the Competitions screen ---------- */

const AFRICA =
  'Algeria Angola Benin Botswana Burkina-Faso Burundi Cameroon Congo Congo-DR Egypt Ethiopia Gabon Gambia Ghana Guinea Ivory-Coast Kenya Lesotho Liberia Libya Madagascar Malawi Mali Mauritania Morocco Mozambique Namibia Niger Rwanda Senegal Sierra-Leone Somalia South-Africa Sudan Tanzania Togo Tunisia Uganda Zambia Zimbabwe Africa'.split(
    ' ',
  );
const EUROPE =
  'England Scotland Wales Northern-Ireland Ireland Spain Italy Germany France Portugal Netherlands Belgium Switzerland Austria Denmark Sweden Norway Finland Iceland Poland Czech-Republic Slovakia Hungary Romania Bulgaria Serbia Croatia Slovenia Bosnia Greece Turkey Ukraine Russia Belarus Cyprus Israel Scotland Albania Kosovo Montenegro North-Macedonia Moldova Lithuania Latvia Estonia Luxembourg Malta Georgia Armenia Azerbaijan Kazakhstan Europe'.split(
    ' ',
  );
const AMERICAS =
  'Argentina Brazil Chile Colombia Ecuador Paraguay Peru Uruguay Venezuela Bolivia Mexico USA Canada Costa-Rica Honduras Guatemala El-Salvador Panama Jamaica'.split(
    ' ',
  );

export function regionOf(country: string) {
  const c = country.replace(/\s+/g, '-');
  if (c === 'Nigeria') return 'Nigeria';
  if (AFRICA.includes(c)) return 'Africa';
  if (EUROPE.includes(c)) return 'Europe';
  if (AMERICAS.includes(c)) return 'Americas';
  if (c === 'World') return 'International';
  return 'Asia & Oceania';
}

const CUP_WORDS =
  /cup|copa|coupe|pokal|coppa|taça|beker|trophy|shield|super ?cup|champions league|europa|conference|libertadores|sudamericana|confederation|qualification|friendlies|world/i;

/* ---------- mapping ---------- */

export function miniFixture(f: RawFixture): MiniFixture {
  const { league: l } = f;
  return {
    id: f.fixture.id,
    ts: f.fixture.timestamp,
    st: f.fixture.status.short,
    el: f.fixture.status.elapsed,
    lg: { id: l.id, name: l.name, country: l.country, logo: l.logo, season: l.season, standings: l.standings },
    h: { id: f.teams.home.id, name: f.teams.home.name, logo: f.teams.home.logo },
    a: { id: f.teams.away.id, name: f.teams.away.name, logo: f.teams.away.logo },
    g: f.goals.home == null || f.goals.away == null ? null : [f.goals.home, f.goals.away],
  };
}

export function competitionOf(f: MiniFixture, teamIds: string[]): Competition {
  const cup = CUP_WORDS.test(f.lg.name) || f.lg.country === 'World';
  return {
    id: String(f.lg.id),
    name: f.lg.name,
    country: f.lg.country,
    region: regionOf(f.lg.country),
    kind: cup ? 'cup' : 'league',
    /* Coverage is known per match once its stats load; the match page hides what's missing. */
    xg: true,
    lineups: true,
    teamIds,
  };
}

export function teamOf(t: RawTeamRef, form: FormResult[] = []): Team {
  return {
    id: String(t.id),
    name: t.name,
    short: shortName(t.name),
    color: CREST_COLOURS[hash(String(t.id)) % CREST_COLOURS.length],
    crestUrl: t.logo,
    form,
  };
}

function season(s: RawTeamLeagueStats | undefined): TeamSeason {
  const played = num(s?.fixtures?.played?.total) ?? 0;
  return {
    form: formOf(s?.form),
    played,
    playedHome: num(s?.fixtures?.played?.home),
    playedAway: num(s?.fixtures?.played?.away),
    gfHome: num(s?.goals?.for?.average?.home),
    gaHome: num(s?.goals?.against?.average?.home),
    gfAway: num(s?.goals?.for?.average?.away),
    gaAway: num(s?.goals?.against?.average?.away),
    gfAvg: num(s?.goals?.for?.average?.total),
    gaAvg: num(s?.goals?.against?.average?.total),
    cleanSheets: num(s?.clean_sheet?.total),
    failedToScore: num(s?.failed_to_score?.total),
  };
}

export function miniPrediction(list: RawPrediction[]): MiniPrediction | null {
  const r = list[0];
  if (!r) return null;
  const pc = r.predictions?.percent;
  const p = pc ? [num(pc.home), num(pc.draw), num(pc.away)] : [];
  const comparison: Record<string, [number, number]> = {};
  for (const [k, v] of Object.entries(r.comparison ?? {})) comparison[k] = [num(v.home) ?? 50, num(v.away) ?? 50];
  return {
    at: Date.now(),
    percent: p.length === 3 && p.every((v) => v != null) ? normalise(p as [number, number, number]) : null,
    advice: r.predictions?.advice && !/no predictions/i.test(r.predictions.advice) ? r.predictions.advice : undefined,
    underOver: r.predictions?.under_over ?? undefined,
    comparison,
    home: season(r.teams?.home?.league),
    away: season(r.teams?.away?.league),
    h2h: (r.h2h ?? [])
      .filter((g) => g.goals.home != null && g.goals.away != null)
      .slice(0, 10)
      .map((g) => ({
        homeId: g.teams.home.id,
        hg: g.goals.home!,
        ag: g.goals.away!,
        year: new Date(g.fixture.date).getFullYear(),
        date: g.fixture.date.slice(0, 10),
      })),
  };
}

/*
 * Early in a season a team's averages rest on a handful of games (5 goals a game after
 * 4 matches is not a real scoring rate), so each average is pulled toward a typical
 * league value, weighted as if it were PRIOR_GAMES extra games at that value.
 */
const PRIOR_GAMES = 5;
const shrink = (avg: number | undefined, n: number | undefined, prior: number) =>
  avg == null ? undefined : (avg * (n ?? 0) + prior * PRIOR_GAMES) / ((n ?? 0) + PRIOR_GAMES);

/** Expected goals for each side, from venue-specific averages where possible. */
export function teamLambdas(p: MiniPrediction): [number, number] {
  const h = p.home;
  const a = p.away;
  const hn = h.gfHome != null ? h.playedHome : h.played;
  const an = a.gfAway != null ? a.playedAway : a.played;
  return lambdas(
    shrink(h.gfHome ?? h.gfAvg, hn, 1.45),
    shrink(h.gaHome ?? h.gaAvg, hn, 1.15),
    shrink(a.gfAway ?? a.gfAvg, an, 1.15),
    shrink(a.gaAway ?? a.gaAvg, an, 1.45),
  );
}

/** A pending match: real fixture, neutral numbers until its prediction loads. */
const PENDING_X: [number, number, number] = [45, 27, 28];

/** Mix the model with bookmaker prices where we have them (half each): prices carry news the averages don't. */
function withOdds(g: GoalModel, x: [number, number, number], odds?: Record<string, number>): { g: GoalModel; x: [number, number, number] } {
  if (!odds) return { g, x };
  const mix = (model: number, market?: number) => (market == null ? model : Math.round((model + market) / 2));
  const out = { ...g };
  out.o25 = mix(g.o25, implied(odds['O2.5'], odds['U2.5']));
  out.btts = mix(g.btts, implied(odds['BTTS'], odds['No BTTS']));
  out.o15 = mix(g.o15, implied(odds['O1.5']));
  const u35 = implied(odds['U3.5']);
  out.o35 = mix(g.o35, u35 == null ? undefined : 100 - u35);
  out.hs = mix(g.hs, implied(odds['HS']));
  out.as = mix(g.as, implied(odds['AS']));
  out.hs2 = mix(g.hs2, implied(odds['HS2+']));
  out.as2 = mix(g.as2, implied(odds['AS2+']));
  const [h, d, a] = [odds['1'], odds['X'], odds['2']];
  const nx =
    h && d && a ? normalise([0, 1, 2].map((i) => (x[i] + normalise([100 / h, 100 / d, 100 / a])[i]) / 2) as [number, number, number]) : x;
  return { g: out, x: nx };
}

export function matchOf(f: MiniFixture, pred: MiniPrediction | null | undefined, odds?: Record<string, number>): Match | null {
  const status = statusOf(f.st);
  if (status === 'skip') return null;
  const kickoff = new Date(f.ts * 1000);
  const [lh, la] = pred ? teamLambdas(pred) : lambdas();
  const model = goalModel(lh, la);
  /* API-Football's percentages come in coarse steps (often 45/45/10), so blend them with the goals model. */
  const baseX: [number, number, number] = !pred
    ? PENDING_X
    : pred.percent
      ? normalise([0, 1, 2].map((i) => (pred.percent![i] + model.x[i]) / 2) as [number, number, number])
      : model.x;
  const { g, x } = withOdds(model, baseX, odds);
  const pick = choosePick(candidates(x, g), pred?.advice, f.h.name, f.a.name, pred?.underOver);
  const id = String(f.id);
  return {
    id,
    comp: String(f.lg.id),
    day: dayOffsetFromDate(kickoff),
    time: `${pad(kickoff.getHours())}:${pad(kickoff.getMinutes())}`,
    status,
    minute: status === 'live' ? (f.el ?? undefined) : undefined,
    score: f.g ?? undefined,
    home: String(f.h.id),
    away: String(f.a.id),
    x,
    btts: g.btts,
    o25: g.o25,
    goals: pred ? { o15: g.o15, o35: g.o35, hs: g.hs, as: g.as, hs2: g.hs2, as2: g.as2 } : undefined,
    odds: odds?.[tipCode(pick.market, pick.outcome)],
    pick,
    reason: pred ? reasonOf(pred, f, g.expected) : 'The full prediction for this match is still loading. Open the match to load it now.',
    updated: pred ? Math.max(0, Math.round((Date.now() - pred.at) / 60000)) : 0,
    /* Placeholder business rule: about one match in four is a Plus insight. */
    premium: pred ? hash(id) % 4 === 0 : false,
    estimate: pred ? 'model' : 'pending',
  };
}

function reasonOf(p: MiniPrediction, f: MiniFixture, expected: number) {
  const parts: string[] = [];
  if (p.advice) parts.push(`API-Football's model says: ${p.advice.replace(/\s*:\s*/, ': ')}.`);
  const c = p.comparison;
  const side = (k: string, label: string) => {
    const v = c[k];
    if (!v) return;
    const [h, a] = [Math.round(v[0]), Math.round(v[1])];
    if (h === a) parts.push(`${label} is even.`);
    else parts.push(`${label} favours ${h > a ? f.h.name : f.a.name} (${h}% v ${a}%).`);
  };
  side('form', 'Recent form');
  side('att', 'Attack');
  side('def', 'Defence');
  parts.push(`We expect about ${expected} goals in total.`);
  return parts.join(' ');
}

/* ---------- match page extras ---------- */

const STAT_LABELS: [string, string, string?][] = [
  ['Ball Possession', 'Possession', '%'],
  ['Total Shots', 'Shots'],
  ['Shots on Goal', 'Shots on target'],
  ['Corner Kicks', 'Corners'],
  ['Fouls', 'Fouls'],
  ['Yellow Cards', 'Yellow cards'],
  ['Offsides', 'Offsides'],
  ['Goalkeeper Saves', 'Saves'],
  ['Passes %', 'Pass accuracy', '%'],
];

export function matchStatsOf(f: RawFixture): { rows: StatRow[]; xg?: [number, number] } | undefined {
  const [h, a] = f.statistics ?? [];
  if (!h || !a) return undefined;
  const val = (side: typeof h, type: string) => num(side.statistics.find((s) => s.type === type)?.value) ?? 0;
  const rows: StatRow[] = STAT_LABELS.filter(([t]) => h.statistics.some((s) => s.type === t)).map(([t, label, unit]) => [
    label,
    val(h, t),
    val(a, t),
    unit,
  ]);
  const hx = num(h.statistics.find((s) => s.type === 'expected_goals')?.value);
  const ax = num(a.statistics.find((s) => s.type === 'expected_goals')?.value);
  return { rows, xg: hx != null && ax != null ? [hx, ax] : undefined };
}

/** Expected total goals for a match from both teams' season averages. */
export function expectedGoalsOf(p: MiniPrediction) {
  const [lh, la] = teamLambdas(p);
  return Math.round((lh + la) * 10) / 10;
}

export function seasonStatsOf(p: MiniPrediction): StatRow[] {
  const rows: StatRow[] = [];
  const add = (label: string, h?: number, a?: number) => {
    if (h != null && a != null) rows.push([label, Math.round(h * 10) / 10, Math.round(a * 10) / 10]);
  };
  add('Goals scored / match', p.home.gfAvg, p.away.gfAvg);
  add('Goals conceded / match', p.home.gaAvg, p.away.gaAvg);
  add('Scored / match (home v away)', p.home.gfHome, p.away.gfAway);
  add('Clean sheets', p.home.cleanSheets, p.away.cleanSheets);
  add('Failed to score', p.home.failedToScore, p.away.failedToScore);
  return rows;
}

export function eventsOf(f: RawFixture): MatchEvent[] {
  return (f.events ?? []).map((e) => {
    const t = e.type.toLowerCase();
    return {
      minute: e.time.elapsed,
      extra: e.time.extra ?? undefined,
      team: String(e.team.id),
      kind: t === 'goal' ? 'goal' : t === 'card' ? 'card' : t === 'subst' ? 'subst' : t === 'var' ? 'var' : 'other',
      detail: e.detail,
      player: e.player.name ?? '',
      assist: e.assist.name ?? undefined,
    };
  });
}

const player = (p: RawPlayer): LineupPlayer => ({
  name: p.player.name,
  number: p.player.number ?? undefined,
  pos: p.player.pos ?? undefined,
});

export function lineupsOf(f: RawFixture): Lineup[] {
  return (f.lineups ?? []).map((l) => ({
    team: String(l.team.id),
    formation: l.formation ?? undefined,
    coach: l.coach?.name ?? undefined,
    startXI: l.startXI.map(player),
    subs: l.substitutes.map(player),
  }));
}

/** Head to head from the home team's side. */
export function h2hOf(p: MiniPrediction, homeId: number) {
  const games = p.h2h;
  if (!games.length) return undefined;
  let home = 0,
    draws = 0,
    away = 0;
  for (const g of games) {
    const homeGoals = g.homeId === homeId ? g.hg : g.ag;
    const awayGoals = g.homeId === homeId ? g.ag : g.hg;
    if (homeGoals > awayGoals) home++;
    else if (homeGoals === awayGoals) draws++;
    else away++;
  }
  const years = games.map((g) => g.year);
  return { home, draws, away, games: games.length, fromYear: Math.min(...years), toYear: Math.max(...years) };
}

/**
 * Decimal prices keyed by our tip codes. Each price is the median across every
 * bookmaker API-Football lists for the match, so one outlier book can't skew it.
 */
export function oddsOf(list: RawOdds[]): { odds: Record<string, number>; bookmaker?: string } {
  const MAP: [string, string, string][] = [
    ['Match Winner', 'Home', '1'],
    ['Match Winner', 'Draw', 'X'],
    ['Match Winner', 'Away', '2'],
    ['Double Chance', 'Home/Draw', '1X'],
    ['Double Chance', 'Draw/Away', 'X2'],
    ['Double Chance', 'Home/Away', '12'],
    ['Goals Over/Under', 'Over 1.5', 'O1.5'],
    ['Goals Over/Under', 'Over 2.5', 'O2.5'],
    ['Goals Over/Under', 'Under 2.5', 'U2.5'],
    ['Goals Over/Under', 'Under 3.5', 'U3.5'],
    ['Both Teams Score', 'Yes', 'BTTS'],
    ['Both Teams Score', 'No', 'No BTTS'],
    ['Total - Home', 'Over 0.5', 'HS'],
    ['Total - Home', 'Over 1.5', 'HS2+'],
    ['Total - Away', 'Over 0.5', 'AS'],
    ['Total - Away', 'Over 1.5', 'AS2+'],
  ];
  const all: Record<string, number[]> = {};
  const books = list[0]?.bookmakers ?? [];
  for (const book of books) {
    for (const [bet, value, code] of MAP) {
      const o = num(book.bets.find((b) => b.name === bet)?.values.find((v) => v.value === value)?.odd);
      if (o && o > 1) (all[code] ??= []).push(o);
    }
  }
  const odds: Record<string, number> = {};
  for (const [code, prices] of Object.entries(all)) {
    const sorted = [...prices].sort((a, b) => a - b);
    const mid = sorted.length >> 1;
    const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    odds[code] = Math.round(median * 100) / 100;
  }
  const n = books.length;
  return { odds, bookmaker: n ? (n === 1 ? books[0].name : `median of ${n} bookmakers`) : undefined };
}

export function standingsOf(list: RawStanding[]): StandingRow[] {
  const groups = list[0]?.league?.standings ?? [];
  /* Cups with groups return several tables; the app shows one, so use the first. */
  const rows = groups[0] ?? [];
  return rows.map((r) => ({
    id: String(r.team.id),
    p: r.all.played,
    w: r.all.win,
    d: r.all.draw,
    l: r.all.lose,
    gf: r.all.goals.for,
    ga: r.all.goals.against,
    pts: r.points,
    /* Standings form lists the latest game first; the app wants oldest first. */
    form: formOf((r.form ?? '').split('').reverse().join('')),
  }));
}

/** A team's recent finished games, newest first, from its own side. */
export function recentOf(list: RawFixture[], teamId: number): RecentGame[] {
  return list
    .filter((f) => statusOf(f.fixture.status.short) === 'finished' && f.goals.home != null && f.goals.away != null)
    .sort((a, b) => b.fixture.timestamp - a.fixture.timestamp)
    .slice(0, 5)
    .map((f) => {
      const home = f.teams.home.id === teamId;
      const gf = home ? f.goals.home! : f.goals.away!;
      const ga = home ? f.goals.away! : f.goals.home!;
      const opp = home ? f.teams.away : f.teams.home;
      return {
        date: f.fixture.date.slice(0, 10),
        opponent: opp.name,
        opponentId: String(opp.id),
        home,
        gf,
        ga,
        result: gf > ga ? 'W' : gf === ga ? 'D' : 'L',
        comp: f.league.name,
      };
    });
}
