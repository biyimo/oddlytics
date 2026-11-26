/*
 * The one seam between the UI and your backend.
 *
 * The app ships with `sampleApi` (generated sample data). To connect a real
 * backend, set EXPO_PUBLIC_API_URL in a .env file and make your server return
 * the shapes in src/types (see httpApi.ts for the endpoints), or write your own
 * implementation of OddlyticsApi and return it from getApi().
 */
import type { CompId, Competition, Match, StandingRow, Team } from '../types';
import { createHttpApi } from './httpApi';
import { sampleApi } from './sampleApi';

export interface OddlyticsApi {
  /** Competitions in display order. */
  getCompetitions(): Promise<Competition[]>;
  getTeams(): Promise<Team[]>;
  /** Fixtures with predictions for a window of days around today (e.g. -3..+3). */
  getMatches(fromDay: number, toDay: number): Promise<Match[]>;
  getStandings(compId: CompId): Promise<StandingRow[]>;
}

let instance: OddlyticsApi | null = null;

export function getApi(): OddlyticsApi {
  if (!instance) {
    const url = process.env.EXPO_PUBLIC_API_URL;
    instance = url ? createHttpApi(url) : sampleApi;
  }
  return instance;
}

export const isSampleData = () => !process.env.EXPO_PUBLIC_API_URL;
