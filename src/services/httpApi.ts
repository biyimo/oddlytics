/*
 * REST implementation of OddlyticsApi. Expected endpoints (JSON):
 *
 *   GET {base}/competitions                 -> Competition[]
 *   GET {base}/teams                        -> Team[]
 *   GET {base}/matches?fromDay=-3&toDay=3   -> Match[]
 *   GET {base}/competitions/{id}/standings  -> StandingRow[]
 *
 * Adjust paths, auth headers and mapping here to fit your provider.
 */
import type { OddlyticsApi } from './api';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Request failed (${res.status}) for ${url}`);
  return (await res.json()) as T;
}

export function createHttpApi(baseUrl: string): OddlyticsApi {
  const base = baseUrl.replace(/\/$/, '');
  return {
    getCompetitions: () => getJson(`${base}/competitions`),
    getTeams: () => getJson(`${base}/teams`),
    getMatches: (fromDay, toDay) => getJson(`${base}/matches?fromDay=${fromDay}&toDay=${toDay}`),
    getStandings: (compId) => getJson(`${base}/competitions/${encodeURIComponent(compId)}/standings`),
  };
}
