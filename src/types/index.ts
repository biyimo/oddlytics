/*
 * Domain types. These are the shapes the UI reads. A real backend only has to
 * return data in these shapes (see src/services/api.ts).
 */

export type CompId = string;
export type TeamId = string;

export type Competition = {
  id: CompId;
  name: string;
  country: string;
  /** Used to group the Competitions screen, e.g. "Nigeria", "Africa", "Europe". */
  region: string;
  /** League tables vs cup competitions (cups show each team's league table instead). */
  kind: 'league' | 'cup';
  /** Whether expected goals (xG) data exists for this competition. */
  xg: boolean;
  /** Whether lineups data exists for this competition. */
  lineups: boolean;
  /** Teams taking part this season. */
  teamIds: TeamId[];
};

export type FormResult = 'W' | 'D' | 'L';

export type Team = {
  id: TeamId;
  name: string;
  short: string;
  /** Crest background colour until real crest images are wired in. */
  color: string;
  /** True when the crest colour is light and needs dark text. */
  dark?: boolean;
  /** Optional crest image URL from the data provider. */
  crestUrl?: string;
  /** Last five results, oldest first. */
  form: FormResult[];
};

/** HS / AS = home / away team scores; HS2 / AS2 = scores 2 or more. */
export type Market = '1X2' | 'DC' | 'OU15' | 'OU25' | 'OU35' | 'BTTS' | 'HS' | 'AS' | 'HS2' | 'AS2';
export type MarketGroup = 'Result' | 'Double chance' | 'Goals' | 'BTTS' | 'Team goals';
export type MatchStatus = 'upcoming' | 'live' | 'finished';

export type Pick = { market: Market; outcome: string; p: number };

export type Match = {
  id: string;
  comp: CompId;
  /** Days from today (0 = today, -1 = yesterday). A real API sends a date; see utils/dates. */
  day: number;
  /** Local kick-off time, "HH:mm". */
  time: string;
  status: MatchStatus;
  minute?: number;
  score?: [number, number];
  home: TeamId;
  away: TeamId;
  /** Home / draw / away probabilities, summing to 100. */
  x: [number, number, number];
  btts: number;
  o25: number;
  pick: Pick;
  reason: string;
  /** Minutes since the estimate was last refreshed. */
  updated: number;
  featured?: boolean;
  premium?: boolean;
  /** Optional decimal price for the pick. When missing a sample price is derived. */
  odds?: number;
  /** How many of five outside prediction sources agree with the pick (needs licensed data). */
  consensus?: number;
};

export type StandingRow = {
  id: TeamId;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  pts: number;
  form: FormResult[];
};

export type User = { name: string; email: string };

export type Filters = {
  status: 'all' | MatchStatus;
  groups: MarketGroup[];
  minP: number;
  comps: CompId[];
  sort: 'league' | 'time' | 'probability';
};

export type SheetName = 'filters' | 'calendar' | 'glossary' | 'menu';
export type InfoPage = 'how' | 'responsible' | 'privacy' | 'help';
export type CompTab = 'Predictions' | 'Standings' | 'Season stats';
