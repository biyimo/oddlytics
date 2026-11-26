/*
 * The one seam between the UI and your backend.
 *
 * Which data the app uses, from .env:
 *   EXPO_PUBLIC_API_URL             your own backend returning the shapes in src/types (httpApi.ts)
 *   EXPO_PUBLIC_FOOTBALL_PROXY_URL  API-Football through a proxy that holds the key (apiFootball/)
 *   neither                         built-in sample data (sampleApi.ts)
 * If the real source can't be reached on first load, the app falls back to sample data.
 */
import type { CompId, Competition, Match, MatchDetail, StandingRow, Team } from '../types';
import { createApiFootballApi } from './apiFootball';
import { isApiFootballConfigured } from './apiFootball/config';
import { createHttpApi } from './httpApi';
import { sampleApi } from './sampleApi';

/** A fresher version of one match (and its two teams), e.g. once its prediction has loaded. */
export type MatchUpdate = { match?: Match; teams?: Team[] };

export interface OddlyticsApi {
  /** Competitions in display order. */
  getCompetitions(): Promise<Competition[]>;
  getTeams(): Promise<Team[]>;
  /** Fixtures with predictions for a window of days around today (e.g. -3..+3). */
  getMatches(fromDay: number, toDay: number): Promise<Match[]>;
  getStandings(compId: CompId): Promise<StandingRow[]>;
  /** Optional: events, lineups, stats, head to head and prices for the match page. */
  getMatchDetail?(id: string): Promise<MatchUpdate & { detail: MatchDetail }>;
  /** Optional: load missing predictions in the background, reporting each match as it arrives. */
  enrichMatches?(matches: Match[], onUpdate: (u: MatchUpdate) => void): Promise<void>;
}

export type DataSource = 'api-football' | 'http' | 'sample';

let instance: OddlyticsApi | null = null;
let source: DataSource = 'sample';
let fellBack = false;

function configured(): { api: OddlyticsApi; source: DataSource } {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (url) return { api: createHttpApi(url), source: 'http' };
  if (isApiFootballConfigured()) return { api: createApiFootballApi(), source: 'api-football' };
  return { api: sampleApi, source: 'sample' };
}

export function getApi(): OddlyticsApi {
  if (!instance) {
    const c = configured();
    instance = c.api;
    source = c.source;
  }
  return instance;
}

/** Switch to the sample data, e.g. when the real source is unreachable on first load. */
export function switchToSampleData() {
  instance = sampleApi;
  if (source !== 'sample') fellBack = true;
  source = 'sample';
}

export const dataSource = () => (getApi(), source);
export const isSampleData = () => dataSource() === 'sample';
/** True when a real source is configured but the app is showing sample data because it failed. */
export const isFallback = () => fellBack;
