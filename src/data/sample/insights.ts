/*
 * SAMPLE statistics shown on match, team and league pages. These are seeded
 * placeholders. When your data provider supplies season stats, head-to-head and
 * xG, replace these functions (or extend OddlyticsApi) and keep the return shapes.
 */
import type { Match, StandingRow } from '../../types';
import { hash, seeded } from '../../utils/random';

/** [label, home value, away value, unit?] */
export function matchStatRows(m: Match): [string, number, number, string?][] {
  return [
    ['Goals scored / match', seeded(m.home + 'g', 0.9, 2.4, 1), seeded(m.away + 'g', 0.8, 2.1, 1)],
    ['Goals conceded / match', seeded(m.home + 'c', 0.5, 1.6, 1), seeded(m.away + 'c', 0.6, 1.8, 1)],
    ['Shots / match', seeded(m.home + 's', 9, 18, 1), seeded(m.away + 's', 8, 16, 1)],
    ['Shots on target / match', seeded(m.home + 't', 3, 7, 1), seeded(m.away + 't', 2.5, 6, 1)],
    ['Corners / match', seeded(m.home + 'k', 3.5, 7.5, 1), seeded(m.away + 'k', 3, 7, 1)],
    ['Possession', seeded(m.home + 'p', 42, 62), seeded(m.away + 'p', 40, 58), '%'],
  ];
}

export function matchXg(m: Match): [number, number] {
  return [seeded(m.home + 'x', 1.1, 2.2, 2), seeded(m.away + 'x', 0.9, 2, 2)];
}

export function expectedGoalsTotal(m: Match) {
  return seeded(m.id + 'xg', 2.1, 3.1, 1);
}

/** Head to head over the last six meetings: [home wins, draws, away wins]. */
export function headToHead(m: Match): [number, number, number] {
  const h = 2 + (hash(m.id) % 2);
  const d = 1 + (hash(m.id + 'd') % 2);
  return [h, d, 6 - h - d];
}

/** Whether a recent game was at home (H) or away (A). */
export function formVenue(teamId: string, i: number) {
  return hash(teamId + i) % 2 ? 'H' : 'A';
}

export function teamSeasonStats(id: string, row: StandingRow): [string, string][] {
  return [
    ['Played', `${row.p}`],
    ['Won · Drawn · Lost', `${row.w} · ${row.d} · ${row.l}`],
    ['Goals for · against', `${row.gf} · ${row.ga}`],
    ['Goals per game', (row.gf / row.p).toFixed(2)],
    ['Clean sheets', `${seeded(id + 'cs', 1, Math.max(2, row.p / 2))}`],
    ['Average possession', `${seeded(id + 'p', 41, 63)}%`],
    ['Shots per game', `${seeded(id + 's', 8, 18, 1)}`],
    ['Both teams scored', `${seeded(id + 'bt', 30, 70)}% of games`],
    ['Over 2.5 goals', `${seeded(id + 'o', 30, 70)}% of games`],
  ];
}

export function compSeasonStats(c: string) {
  return {
    homeWins: seeded(c + 'hw', 40, 50),
    rows: [
      ['Draws', `${seeded(c + 'dr', 22, 31)}%`],
      ['Away wins', `${seeded(c + 'aw', 24, 33)}%`],
      ['Both teams scored', `${seeded(c + 'bt', 42, 58)}%`],
      ['Over 2.5 goals', `${seeded(c + 'o', 40, 60)}%`],
      ['Clean sheets per team', `${seeded(c + 'cs', 2, 5, 1)}`],
    ] as [string, string][],
  };
}
