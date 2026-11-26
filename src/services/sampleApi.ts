/* Sample implementation of OddlyticsApi. Responds after a short delay like a network call. */
import type { StandingRow } from '../types';
import { LEAGUE_TEAMS, SAMPLE_COMPETITIONS, SAMPLE_TEAMS } from '../data/sample/catalog';
import { SAMPLE_MATCHES } from '../data/sample/matches';
import { hash, seeded } from '../utils/random';
import type { OddlyticsApi } from './api';

const delay = <T>(v: T, ms = 250) => new Promise<T>((r) => setTimeout(() => r(v), ms));
const formOf = (id: string) => SAMPLE_TEAMS.find((t) => t.id === id)?.form ?? [];

/* Sample "consensus": how many of five outside prediction sources agree with our pick. */
function sampleConsensus(id: string, p: number) {
  const base = p >= 70 ? 4 : p >= 60 ? 3 : 2;
  return Math.min(5, base + (hash(id + 'c') % 2));
}

function sampleStandings(comp: string): StandingRow[] {
  const isCup = SAMPLE_COMPETITIONS.find((c) => c.id === comp)?.kind === 'cup';
  const played = isCup ? 6 : 13;
  return (LEAGUE_TEAMS[comp] ?? [])
    .map((id) => {
      const w = Math.min(played, seeded(comp + id + 'w', 1, played * 0.75));
      const d = Math.min(played - w, seeded(comp + id + 'd', 0, played * 0.35));
      const l = played - w - d;
      const gf = Math.round(w * 2 + d * 1.1 + seeded(comp + id + 'gf', 0, 6));
      const ga = Math.round(l * 1.8 + d * 1 + seeded(comp + id + 'ga', 0, 5));
      return { id, p: played, w, d, l, gf, ga, pts: w * 3 + d, form: formOf(id) };
    })
    .sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);
}

export const sampleApi: OddlyticsApi = {
  getCompetitions: () => delay(SAMPLE_COMPETITIONS),
  getTeams: () => delay(SAMPLE_TEAMS),
  getMatches: (fromDay, toDay) =>
    delay(
      SAMPLE_MATCHES.filter((m) => m.day >= fromDay && m.day <= toDay).map((m) => ({
        ...m,
        consensus: sampleConsensus(m.id, m.pick.p),
      })),
    ),
  getStandings: (comp) => delay(sampleStandings(comp), 50),
};
