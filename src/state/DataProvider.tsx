/*
 * Loads competitions, teams, fixtures and tables through the API layer and
 * exposes simple synchronous lookups to every screen.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getApi } from '../services/api';
import type { CompId, Competition, Match, StandingRow, Team, TeamId } from '../types';
import { pickText as pickTextFor } from '../utils/markets';

/** Days either side of today that the app loads. */
export const DAY_WINDOW = { from: -3, to: 3 };

type Status = 'loading' | 'ready' | 'error';

type DataContextValue = {
  status: Status;
  error?: string;
  refreshing: boolean;
  refresh: () => Promise<void>;
  reload: () => void;
  compOrder: CompId[];
  matches: Match[];
  teamIds: TeamId[];
  team: (id: TeamId) => Team;
  comp: (id: CompId) => Competition;
  match: (id: string) => Match | undefined;
  standings: (id: CompId) => StandingRow[];
  /** The domestic league a team plays in (falls back to its first competition). */
  teamComp: (id: TeamId) => CompId;
  pickText: (m: Match) => string;
  consensus: (m: Match) => number;
};

const DataContext = createContext<DataContextValue | null>(null);

const UNKNOWN_COMP: Competition = {
  id: '?',
  name: 'Unknown competition',
  country: '',
  region: 'Other',
  kind: 'league',
  xg: false,
  lineups: false,
  teamIds: [],
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);
  const [comps, setComps] = useState<Competition[]>([]);
  const [teams, setTeams] = useState<Record<TeamId, Team>>({});
  const [matches, setMatches] = useState<Match[]>([]);
  const [tables, setTables] = useState<Record<CompId, StandingRow[]>>({});
  const [attempt, setAttempt] = useState(0);

  const fetchAll = useCallback(async () => {
    const api = getApi();
    const [c, t, m] = await Promise.all([api.getCompetitions(), api.getTeams(), api.getMatches(DAY_WINDOW.from, DAY_WINDOW.to)]);
    const standings = await Promise.all(c.map((x) => api.getStandings(x.id).catch(() => [] as StandingRow[])));
    setComps(c);
    setTeams(Object.fromEntries(t.map((x) => [x.id, x])));
    setMatches([...m].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time)));
    setTables(Object.fromEntries(c.map((x, i) => [x.id, standings[i]])));
  }, []);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    fetchAll()
      .then(() => alive && setStatus('ready'))
      .catch((e: unknown) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : String(e));
        setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [fetchAll, attempt]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAll();
    } catch {
      /* keep the data we already have */
    } finally {
      setRefreshing(false);
    }
  }, [fetchAll]);

  const value = useMemo<DataContextValue>(() => {
    const compMap = Object.fromEntries(comps.map((c) => [c.id, c]));
    const team = (id: TeamId): Team => teams[id] ?? { id, name: id, short: id.slice(0, 3).toUpperCase(), color: '#3A3C44', form: [] };
    const comp = (id: CompId) => compMap[id] ?? { ...UNKNOWN_COMP, id };
    const teamComp = (id: TeamId) =>
      comps.find((c) => c.kind === 'league' && c.teamIds.includes(id))?.id ??
      comps.find((c) => c.teamIds.includes(id))?.id ??
      comps[0]?.id ??
      '';
    return {
      status,
      error,
      refreshing,
      refresh,
      reload: () => setAttempt((n) => n + 1),
      compOrder: comps.map((c) => c.id),
      matches,
      teamIds: Object.keys(teams),
      team,
      comp,
      match: (id) => matches.find((m) => m.id === id),
      standings: (id) => tables[id] ?? [],
      teamComp,
      pickText: (m) => pickTextFor(m, team(m.home).name, team(m.away).name),
      consensus: (m) => m.consensus ?? 0,
    };
  }, [status, error, refreshing, refresh, comps, teams, matches, tables]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
