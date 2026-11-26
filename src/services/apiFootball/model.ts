/*
 * Turns API-Football predictions into the probabilities the app shows.
 *
 * API-Football gives home/draw/away percentages and an "advice" line. It does not
 * give goal-market probabilities, so those come from a simple Poisson model on
 * each team's season scoring averages (home team at home, away team away).
 */
import type { Market, Pick } from '../../types';

const round = (v: number) => Math.round(v);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function poisson(k: number, l: number) {
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return (Math.exp(-l) * l ** k) / f;
}

export type GoalModel = {
  x: [number, number, number];
  o15: number;
  o25: number;
  o35: number;
  btts: number;
  hs: number;
  as: number;
  hs2: number;
  as2: number;
  expected: number;
};

/** Market probabilities (0-100) from expected goals for each side. */
export function goalModel(lh: number, la: number): GoalModel {
  const N = 10;
  let h = 0,
    d = 0,
    a = 0,
    o15 = 0,
    o25 = 0,
    o35 = 0,
    btts = 0;
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      const p = poisson(i, lh) * poisson(j, la);
      if (i > j) h += p;
      else if (i === j) d += p;
      else a += p;
      if (i + j > 1) o15 += p;
      if (i + j > 2) o25 += p;
      if (i + j > 3) o35 += p;
      if (i > 0 && j > 0) btts += p;
    }
  }
  const hs = 1 - poisson(0, lh);
  const as = 1 - poisson(0, la);
  return {
    x: normalise([h * 100, d * 100, a * 100]),
    o15: round(o15 * 100),
    o25: round(o25 * 100),
    o35: round(o35 * 100),
    btts: round(btts * 100),
    hs: round(hs * 100),
    as: round(as * 100),
    hs2: round((hs - poisson(1, lh)) * 100),
    as2: round((as - poisson(1, la)) * 100),
    expected: Math.round((lh + la) * 10) / 10,
  };
}

/** Whole-number percentages that add up to exactly 100. */
export function normalise(v: [number, number, number]): [number, number, number] {
  const sum = v[0] + v[1] + v[2] || 1;
  const r = v.map((x) => Math.round((x / sum) * 100)) as [number, number, number];
  r[1] += 100 - (r[0] + r[1] + r[2]);
  return r;
}

/** Expected goals for each side from season averages, with sensible fallbacks. */
export function lambdas(homeFor?: number, homeAgainst?: number, awayFor?: number, awayAgainst?: number): [number, number] {
  const avg = (a?: number, b?: number, fb = 1.3) => {
    const xs = [a, b].filter((v): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0);
    return xs.length ? xs.reduce((s, v) => s + v, 0) / xs.length : fb;
  };
  return [clamp(avg(homeFor, awayAgainst, 1.45), 0.3, 4), clamp(avg(awayFor, homeAgainst, 1.15), 0.2, 4)];
}

type Candidate = Pick & { code: string };

export function candidates(x: [number, number, number], g: GoalModel): Candidate[] {
  const c = (market: Market, outcome: string, p: number, code: string): Candidate => ({ market, outcome, p: round(clamp(p, 1, 99)), code });
  return [
    c('1X2', 'home', x[0], '1'),
    c('1X2', 'draw', x[1], 'X'),
    c('1X2', 'away', x[2], '2'),
    c('DC', '1X', x[0] + x[1], '1X'),
    c('DC', 'X2', x[1] + x[2], 'X2'),
    c('DC', '12', x[0] + x[2], '12'),
    c('OU15', 'over', g.o15, 'O1.5'),
    c('OU25', 'over', g.o25, 'O2.5'),
    c('OU25', 'under', 100 - g.o25, 'U2.5'),
    c('OU35', 'under', 100 - g.o35, 'U3.5'),
    c('BTTS', 'yes', g.btts, 'BTTS'),
    c('BTTS', 'no', 100 - g.btts, 'No BTTS'),
    c('HS', 'yes', g.hs, 'HS'),
    c('AS', 'yes', g.as, 'AS'),
    c('HS2', 'yes', g.hs2, 'HS2+'),
    c('AS2', 'yes', g.as2, 'AS2+'),
  ];
}

/**
 * Picks the published tip. The provider's advice wins when we can read it and it
 * has a fair chance (55%+); otherwise the likeliest market under 88% (above that
 * the price is too short to be useful).
 */
export function choosePick(all: Candidate[], advice: string | undefined, homeName: string, awayName: string): Pick {
  const fromAdvice = adviceCode(advice, homeName, awayName);
  const a = fromAdvice ? all.find((c) => c.code === fromAdvice) : undefined;
  if (a && a.p >= 55) return { market: a.market, outcome: a.outcome, p: a.p };
  const best = all.filter((c) => c.p <= 88).sort((x, y) => y.p - x.p)[0] ?? all[3];
  return { market: best.market, outcome: best.outcome, p: best.p };
}

/** Reads API-Football advice such as "Double chance : draw or Arsenal" or "Winner : Arsenal". */
export function adviceCode(advice: string | undefined, homeName: string, awayName: string): string | undefined {
  if (!advice) return undefined;
  const t = advice.toLowerCase();
  const names = t.split(':').slice(1).join(':');
  const hasHome = names.includes(homeName.toLowerCase());
  const hasAway = names.includes(awayName.toLowerCase());
  if (t.includes('double chance')) {
    if (hasHome && hasAway) return '12';
    if (hasHome) return '1X';
    if (hasAway) return 'X2';
    return undefined;
  }
  if (t.includes('winner')) {
    if (hasHome && !hasAway) return '1';
    if (hasAway && !hasHome) return '2';
  }
  return undefined;
}
