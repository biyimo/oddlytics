/* Market names, settlement and price helpers. Pure functions, no sample data. */
import type { Market, MarketGroup, Match } from '../types';

type Pick<T, K extends keyof T> = { [P in K]: T[P] };

export const MARKET_GROUP: Record<Market, MarketGroup> = {
  '1X2': 'Result',
  DC: 'Double chance',
  OU15: 'Goals',
  OU25: 'Goals',
  OU35: 'Goals',
  BTTS: 'BTTS',
  HS: 'Team goals',
  AS: 'Team goals',
  HS2: 'Team goals',
  AS2: 'Team goals',
};
export const MARKET_NAME: Record<Market, string> = {
  '1X2': 'Match result',
  DC: 'Double chance',
  OU15: 'Total goals 1.5',
  OU25: 'Total goals 2.5',
  OU35: 'Total goals 3.5',
  BTTS: 'Both teams to score',
  HS: 'Home team to score',
  AS: 'Away team to score',
  HS2: 'Home team 2+ goals',
  AS2: 'Away team 2+ goals',
};

/**
 * Short betting code for a pick, as used on bet slips (see GLOSSARY):
 * 1, X, 2, 1X, X2, 12, BTTS, No BTTS, O1.5, O2.5, U2.5, U3.5, HS, AS, HS2+, AS2+.
 */
export function tipCode(market: Market, outcome: string): string {
  switch (market) {
    case '1X2':
      return outcome === 'home' ? '1' : outcome === 'away' ? '2' : 'X';
    case 'DC':
      return outcome === '1X' ? '1X' : outcome === 'X2' ? 'X2' : '12';
    case 'BTTS':
      return outcome === 'yes' ? 'BTTS' : 'No BTTS';
    case 'HS':
      return 'HS';
    case 'AS':
      return 'AS';
    case 'HS2':
      return 'HS2+';
    case 'AS2':
      return 'AS2+';
    default: {
      const line = market === 'OU15' ? '1.5' : market === 'OU25' ? '2.5' : '3.5';
      return `${outcome === 'over' ? 'O' : 'U'}${line}`;
    }
  }
}

export const pickCode = (m: Match) => tipCode(m.pick.market, m.pick.outcome);

/** Team-goals probabilities derived from the match model: [HS, AS, HS2+, AS2+]. */
export function teamGoalProbs(m: Pick<Match, 'x' | 'o25'>): [number, number, number, number] {
  const clamp = (v: number, lo: number, hi: number) => Math.round(Math.min(hi, Math.max(lo, v)));
  const goals = (m.o25 - 50) * 0.35;
  const hs = clamp(48 + m.x[0] * 0.55 + goals, 35, 92);
  const as = clamp(40 + m.x[2] * 0.6 + goals, 25, 88);
  return [hs, as, clamp((hs - 30) * 0.75, 8, 75), clamp((as - 30) * 0.7, 5, 70)];
}

/** Decimal price for a pick. Uses the provider's price when present, else a sample price from our probability with a typical margin. */
export function oddsFor(m: Match) {
  if (m.odds) return m.odds;
  return Math.max(1.05, Math.round((100 / m.pick.p) * 0.94 * 100) / 100);
}

/** Highest sample price a pick with this probability could have. */
export function maxOddAt(p: number) {
  return Math.max(1.05, Math.round((100 / p) * 0.94 * 100) / 100);
}

export function pickText(m: Match, homeName: string, awayName: string) {
  const { market, outcome } = m.pick;
  const H = homeName;
  const A = awayName;
  if (market === '1X2') return outcome === 'home' ? `${H} win` : outcome === 'away' ? `${A} win` : 'Draw';
  if (market === 'DC') return outcome === '1X' ? `${H} or draw` : outcome === 'X2' ? `${A} or draw` : 'Either team wins';
  if (market === 'BTTS') return outcome === 'yes' ? 'Both teams score' : 'Not both teams score';
  if (market === 'HS') return `${H} to score`;
  if (market === 'AS') return `${A} to score`;
  if (market === 'HS2') return `${H} to score 2+`;
  if (market === 'AS2') return `${A} to score 2+`;
  const line = market === 'OU15' ? '1.5' : market === 'OU25' ? '2.5' : '3.5';
  return `${outcome === 'over' ? 'Over' : 'Under'} ${line} goals`;
}

export function settle(m: Match): 'won' | 'lost' | null {
  if (m.status !== 'finished' || !m.score) return null;
  const [h, a] = m.score;
  const { market, outcome } = m.pick;
  let ok = false;
  if (market === '1X2') ok = outcome === 'home' ? h > a : outcome === 'away' ? a > h : h === a;
  if (market === 'DC') ok = outcome === '1X' ? h >= a : outcome === 'X2' ? a >= h : h !== a;
  if (market === 'BTTS') ok = outcome === 'yes' ? h > 0 && a > 0 : !(h > 0 && a > 0);
  if (market === 'HS') ok = h >= 1;
  if (market === 'AS') ok = a >= 1;
  if (market === 'HS2') ok = h >= 2;
  if (market === 'AS2') ok = a >= 2;
  if (market.startsWith('OU')) {
    const line = market === 'OU15' ? 1.5 : market === 'OU25' ? 2.5 : 3.5;
    ok = outcome === 'over' ? h + a > line : h + a < line;
  }
  return ok ? 'won' : 'lost';
}

export const GLOSSARY: { title: string; rows: [string, string][] }[] = [
  {
    title: 'Match result (1X2)',
    rows: [
      ['1', 'Home team wins'],
      ['X', 'Draw'],
      ['2', 'Away team wins'],
    ],
  },
  {
    title: 'Double chance',
    rows: [
      ['1X', 'Home team wins or draw'],
      ['X2', 'Away team wins or draw'],
      ['12', 'Either team wins'],
    ],
  },
  {
    title: 'Both teams to score',
    rows: [
      ['BTTS', 'Both teams score at least once'],
      ['No BTTS', 'At least one team does not score'],
    ],
  },
  {
    title: 'Total goals',
    rows: [
      ['O1.5', '2 or more goals'],
      ['O2.5', '3 or more goals'],
      ['U2.5', '2 goals or fewer'],
      ['U3.5', '3 goals or fewer'],
    ],
  },
  {
    title: 'Team goals',
    rows: [
      ['HS', 'Home team scores'],
      ['AS', 'Away team scores'],
      ['HS2+', 'Home team will score 2 or more goals'],
      ['AS2+', 'Away team will score 2 or more goals'],
    ],
  },
];
