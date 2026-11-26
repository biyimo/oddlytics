import { useMemo } from 'react';
import { useApp } from '../../state/AppProvider';
import { useData } from '../../state/DataProvider';
import type { Filters, Match } from '../../types';
import { MARKET_GROUP } from '../../utils/markets';

export const applyFilters = (f: Filters, src: Match[]) =>
  src.filter(
    (m) =>
      (f.status === 'all' || m.status === f.status) &&
      (!f.groups.length || f.groups.includes(MARKET_GROUP[m.pick.market])) &&
      (f.minP === 0 || m.pick.p >= f.minP) &&
      (!f.comps.length || f.comps.includes(m.comp)),
  );

/** Matches for the selected date, or across all dates when searching. Before filters. */
export function useExploreBase() {
  const { query, day, liveOnly } = useApp();
  const { matches, team, comp } = useData();
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    return matches
      .filter((m) => {
        if (q) {
          const hay = `${team(m.home).name} ${team(m.away).name} ${comp(m.comp).name} ${comp(m.comp).country}`.toLowerCase();
          return hay.includes(q);
        }
        return m.day === day;
      })
      .filter((m) => !liveOnly || m.status === 'live');
  }, [query, day, liveOnly, matches, team, comp]);
}

export function useExploreList() {
  const { filters } = useApp();
  const base = useExploreBase();
  return useMemo(() => {
    const list = applyFilters(filters, base);
    if (filters.sort === 'time') return [...list].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
    if (filters.sort === 'probability') return [...list].sort((a, b) => b.pick.p - a.pick.p);
    return list;
  }, [base, filters]);
}
