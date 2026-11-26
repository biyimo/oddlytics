/* Bet Builder logic, kept free of UI so it can be unit tested or moved server-side. */
import type { BuilderSettings } from '../../state/AppProvider';
import type { Match } from '../../types';
import { oddsFor } from '../../utils/markets';

/** Games that fit the settings, strongest estimate first. */
export function builderPool(matches: Match[], b: BuilderSettings, locked: (m: Match) => boolean) {
  return matches
    .filter(
      (m) =>
        (b.day === 'both' ? m.day === 0 || m.day === 1 : m.day === (b.day === 'today' ? 0 : 1)) &&
        m.status !== 'finished' &&
        !locked(m) &&
        (b.type === 'All' || (b.type === 'Featured' ? m.featured : m.status === 'live')) &&
        m.estimate !== 'pending' &&
        m.pick.p >= b.minP &&
        oddsFor(m) >= b.minOdd &&
        oddsFor(m) <= b.maxOdd,
    )
    .sort((a, b2) => b2.pick.p - a.pick.p);
}

/**
 * Greedy slip: for each slot, pick the game whose price is closest to the price
 * still needed to reach the target, with a small bonus for higher probability.
 */
export function buildSlip(pool: Match[], count: number, target: number): Match[] {
  const candidates = pool.slice(0, 30);
  const chosen: Match[] = [];
  let product = 1;
  for (let i = 0; i < count && chosen.length < candidates.length; i++) {
    const need = Math.pow(target / product, 1 / (count - i));
    let best: Match | null = null;
    let bestScore = Infinity;
    for (const m of candidates) {
      if (chosen.includes(m)) continue;
      const score = Math.abs(Math.log(oddsFor(m)) - Math.log(need)) - ((m.pick.p - 50) / 50) * 0.35;
      if (score < bestScore) {
        bestScore = score;
        best = m;
      }
    }
    if (!best) break;
    chosen.push(best);
    product *= oddsFor(best);
  }
  return chosen;
}
