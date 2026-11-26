import React, { useEffect, useMemo, useRef, useState } from 'react';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Animated,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */

const C = {
  bg: '#000000',
  surface: '#1A1B20',
  elevated: '#23252C',
  raised: '#2D2F37',
  line: '#30323A',
  lineSoft: '#24262C',
  text: '#F5F5F7',
  soft: '#D1D2D8',
  muted: '#A7A9B1',
  faint: '#7D7F88',
  accent: '#8B7CFF',
  accentSoft: '#29243F',
  accentLine: '#5E52B8',
  live: '#FF6B5E',
  liveSoft: '#3A1D1B',
  won: '#4BE09A',
  wonSoft: '#123C2B',
  lost: '#F08A80',
  lostSoft: '#3A1E1C',
  amber: '#F1C879',
};

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

/* ------------------------------------------------------------------ */
/* Sample data                                                         */
/* ------------------------------------------------------------------ */

type CompId = 'npfl' | 'epl' | 'laliga' | 'seriea' | 'bundesliga' | 'ligue1' | 'ucl' | 'cafcl';
const COMPS: Record<CompId, { name: string; country: string; region: string; xg: boolean; lineups: boolean }> = {
  npfl: { name: 'NPFL', country: 'Nigeria', region: 'Nigeria', xg: false, lineups: false },
  cafcl: { name: 'CAF Champions League', country: 'Africa', region: 'Africa', xg: false, lineups: true },
  epl: { name: 'Premier League', country: 'England', region: 'Europe', xg: true, lineups: true },
  laliga: { name: 'LaLiga', country: 'Spain', region: 'Europe', xg: true, lineups: true },
  seriea: { name: 'Serie A', country: 'Italy', region: 'Europe', xg: true, lineups: true },
  bundesliga: { name: 'Bundesliga', country: 'Germany', region: 'Europe', xg: true, lineups: true },
  ligue1: { name: 'Ligue 1', country: 'France', region: 'Europe', xg: true, lineups: true },
  ucl: { name: 'Champions League', country: 'Europe', region: 'Europe', xg: true, lineups: true },
};
const COMP_ORDER: CompId[] = ['npfl', 'cafcl', 'epl', 'laliga', 'seriea', 'bundesliga', 'ligue1', 'ucl'];

const TEAMS: Record<string, { name: string; short: string; color: string; dark?: boolean }> = {
  enyimba: { name: 'Enyimba', short: 'ENY', color: '#1E7A3A' },
  rivers: { name: 'Rivers United', short: 'RIV', color: '#1F4FA8' },
  remo: { name: 'Remo Stars', short: 'REM', color: '#0E7C86' },
  kano: { name: 'Kano Pillars', short: 'KAN', color: '#C9A227', dark: true },
  rangers: { name: 'Enugu Rangers', short: 'RAN', color: '#C93434' },
  abia: { name: 'Abia Warriors', short: 'ABI', color: '#E87722', dark: true },
  shooting: { name: 'Shooting Stars', short: '3SC', color: '#2B6CB0' },
  plateau: { name: 'Plateau United', short: 'PLU', color: '#6B3FA0' },
  arsenal: { name: 'Arsenal', short: 'ARS', color: '#DB0007' },
  newcastle: { name: 'Newcastle', short: 'NEW', color: '#4A4A4A' },
  mancity: { name: 'Manchester City', short: 'MCI', color: '#6CABDD', dark: true },
  liverpool: { name: 'Liverpool', short: 'LIV', color: '#C8102E' },
  chelsea: { name: 'Chelsea', short: 'CHE', color: '#034694' },
  brighton: { name: 'Brighton', short: 'BHA', color: '#0057B8' },
  realmadrid: { name: 'Real Madrid', short: 'RMA', color: '#FEBE10', dark: true },
  barcelona: { name: 'Barcelona', short: 'BAR', color: '#A50044' },
  atletico: { name: 'Atlético Madrid', short: 'ATM', color: '#CB3524' },
  sevilla: { name: 'Sevilla', short: 'SEV', color: '#B5121B' },
  inter: { name: 'Inter', short: 'INT', color: '#0068A8' },
  milan: { name: 'AC Milan', short: 'MIL', color: '#D3010C' },
  juventus: { name: 'Juventus', short: 'JUV', color: '#6E6E6E' },
  napoli: { name: 'Napoli', short: 'NAP', color: '#12A0D7', dark: true },
  bayern: { name: 'Bayern Munich', short: 'FCB', color: '#DC052D' },
  psg: { name: 'Paris SG', short: 'PSG', color: '#004170' },
  alahly: { name: 'Al Ahly', short: 'AHL', color: '#C8102E' },
  esttunis: { name: 'ES Tunis', short: 'EST', color: '#E2B007', dark: true },
  wydad: { name: 'Wydad AC', short: 'WAC', color: '#B71C1C' },
  sundowns: { name: 'Mamelodi Sundowns', short: 'SUN', color: '#F6C700', dark: true },
  kwara: { name: 'Kwara United', short: 'KWU', color: '#1565C0' },
  lobi: { name: 'Lobi Stars', short: 'LOB', color: '#2E7D32' },
  sunshine: { name: 'Sunshine Stars', short: 'SSS', color: '#F9A825', dark: true },
  tornadoes: { name: 'Niger Tornadoes', short: 'NTO', color: '#AD1457' },
  bendel: { name: 'Bendel Insurance', short: 'BIN', color: '#283593' },
  heartland: { name: 'Heartland', short: 'HEA', color: '#B71C1C' },
  ikorodu: { name: 'Ikorodu City', short: 'IKC', color: '#00838F' },
  katsina: { name: 'Katsina United', short: 'KAT', color: '#558B2F' },
  tottenham: { name: 'Tottenham', short: 'TOT', color: '#132257' },
  manutd: { name: 'Manchester United', short: 'MUN', color: '#DA291C' },
  villa: { name: 'Aston Villa', short: 'AVL', color: '#670E36' },
  westham: { name: 'West Ham', short: 'WHU', color: '#7A263A' },
  everton: { name: 'Everton', short: 'EVE', color: '#003399' },
  fulham: { name: 'Fulham', short: 'FUL', color: '#E0E0E0', dark: true },
  forest: { name: 'Nottingham Forest', short: 'NFO', color: '#DD0000' },
  bournemouth: { name: 'Bournemouth', short: 'BOU', color: '#B50E12' },
  villarreal: { name: 'Villarreal', short: 'VIL', color: '#FFE667', dark: true },
  sociedad: { name: 'Real Sociedad', short: 'RSO', color: '#0067B1' },
  betis: { name: 'Real Betis', short: 'BET', color: '#0BB363' },
  valencia: { name: 'Valencia', short: 'VAL', color: '#EE3524' },
  athletic: { name: 'Athletic Club', short: 'ATH', color: '#C8102E' },
  girona: { name: 'Girona', short: 'GIR', color: '#CD2534' },
  roma: { name: 'Roma', short: 'ROM', color: '#8E1F2F' },
  lazio: { name: 'Lazio', short: 'LAZ', color: '#87D8F7', dark: true },
  atalanta: { name: 'Atalanta', short: 'ATA', color: '#1E71B8' },
  fiorentina: { name: 'Fiorentina', short: 'FIO', color: '#592C82' },
  bologna: { name: 'Bologna', short: 'BOL', color: '#1A2F48' },
  torino: { name: 'Torino', short: 'TOR', color: '#881F19' },
  leverkusen: { name: 'Leverkusen', short: 'B04', color: '#E32221' },
  dortmund: { name: 'Dortmund', short: 'BVB', color: '#FDE100', dark: true },
  leipzig: { name: 'RB Leipzig', short: 'RBL', color: '#DD0741' },
  stuttgart: { name: 'Stuttgart', short: 'VFB', color: '#E32219' },
  frankfurt: { name: 'Frankfurt', short: 'SGE', color: '#2B2B2B' },
  freiburg: { name: 'Freiburg', short: 'SCF', color: '#C4161C' },
  wolfsburg: { name: 'Wolfsburg', short: 'WOB', color: '#65B32E' },
  gladbach: { name: 'Gladbach', short: 'BMG', color: '#3C3C3C' },
  marseille: { name: 'Marseille', short: 'OM', color: '#2FAEE0', dark: true },
  monaco: { name: 'Monaco', short: 'ASM', color: '#E7192F' },
  lille: { name: 'Lille', short: 'LIL', color: '#24216A' },
  lyon: { name: 'Lyon', short: 'OL', color: '#1D3E8F' },
  nice: { name: 'Nice', short: 'NIC', color: '#C8102E' },
  lens: { name: 'Lens', short: 'RCL', color: '#FFD700', dark: true },
  rennes: { name: 'Rennes', short: 'REN', color: '#E13327' },
  nantes: { name: 'Nantes', short: 'FCN', color: '#FCD405', dark: true },
  benfica: { name: 'Benfica', short: 'SLB', color: '#E83030' },
  porto: { name: 'Porto', short: 'FCP', color: '#00428C' },
  simba: { name: 'Simba SC', short: 'SIM', color: '#D32F2F' },
  mazembe: { name: 'TP Mazembe', short: 'TPM', color: '#212121' },
  raja: { name: 'Raja Casablanca', short: 'RCA', color: '#00A651' },
  petro: { name: 'Petro de Luanda', short: 'PET', color: '#0D47A1' },
};

type Market = '1X2' | 'DC' | 'OU15' | 'OU25' | 'OU35' | 'BTTS';
type MarketGroup = 'Result' | 'Double chance' | 'Goals' | 'BTTS';
const MARKET_GROUP: Record<Market, MarketGroup> = {
  '1X2': 'Result',
  DC: 'Double chance',
  OU15: 'Goals',
  OU25: 'Goals',
  OU35: 'Goals',
  BTTS: 'BTTS',
};
const MARKET_NAME: Record<Market, string> = {
  '1X2': 'Match result',
  DC: 'Double chance',
  OU15: 'Total goals 1.5',
  OU25: 'Total goals 2.5',
  OU35: 'Total goals 3.5',
  BTTS: 'Both teams to score',
};

type Status = 'upcoming' | 'live' | 'finished';
type Match = {
  id: string;
  comp: CompId;
  day: number; // days from today
  time: string;
  status: Status;
  minute?: number;
  score?: [number, number];
  home: string;
  away: string;
  x: [number, number, number]; // home / draw / away, sums to 100
  btts: number;
  o25: number;
  o15?: number;
  o35?: number;
  pick: { market: Market; outcome: string; p: number };
  reason: string;
  updated: number; // minutes ago
  featured?: boolean;
  premium?: boolean;
};

const BASE_MATCHES: Match[] = [
  // Today
  { id: 'm1', comp: 'npfl', day: 0, time: '16:00', status: 'upcoming', home: 'enyimba', away: 'rivers', x: [48, 28, 24], btts: 44, o25: 41, pick: { market: '1X2', outcome: 'home', p: 48 }, reason: 'Enyimba have scored in 9 of their last 10 home games, while Rivers United have won once away this season.', updated: 22, featured: true },
  { id: 'm2', comp: 'npfl', day: 0, time: '15:00', status: 'live', minute: 62, score: [1, 0], home: 'rangers', away: 'abia', x: [61, 26, 13], btts: 38, o25: 35, pick: { market: '1X2', outcome: 'home', p: 61 }, reason: 'Rangers concede few at home and Abia have the lowest away shot count in the sample.', updated: 3 },
  { id: 'm3', comp: 'epl', day: 0, time: '18:30', status: 'upcoming', home: 'arsenal', away: 'newcastle', x: [54, 24, 22], btts: 52, o25: 55, pick: { market: '1X2', outcome: 'home', p: 54 }, reason: 'Arsenal create the most chances at home in the league; Newcastle are missing two first-choice defenders.', updated: 18, featured: true },
  { id: 'm4', comp: 'epl', day: 0, time: '21:00', status: 'upcoming', home: 'liverpool', away: 'chelsea', x: [47, 25, 28], btts: 64, o25: 63, pick: { market: 'OU25', outcome: 'over', p: 63 }, reason: 'Both sides average more than 1.7 expected goals per match across their last eight.', updated: 31, premium: true },
  { id: 'm5', comp: 'seriea', day: 0, time: '20:45', status: 'upcoming', home: 'inter', away: 'napoli', x: [42, 30, 28], btts: 58, o25: 52, pick: { market: 'BTTS', outcome: 'yes', p: 58 }, reason: 'Each side has scored in all of its last six league games.', updated: 40, premium: true },
  { id: 'm6', comp: 'cafcl', day: 0, time: '17:00', status: 'upcoming', home: 'alahly', away: 'esttunis', x: [51, 31, 18], btts: 33, o25: 26, pick: { market: 'OU35', outcome: 'under', p: 74 }, reason: 'Seven of the last eight meetings had three goals or fewer.', updated: 41 },
  { id: 'm7', comp: 'laliga', day: 0, time: '19:00', status: 'live', minute: 34, score: [2, 0], home: 'realmadrid', away: 'sevilla', x: [70, 18, 12], btts: 41, o25: 61, pick: { market: '1X2', outcome: 'home', p: 70 }, reason: 'Real Madrid have won 11 of their last 12 home league games.', updated: 1 },
  // Tomorrow
  { id: 'm8', comp: 'npfl', day: 1, time: '16:00', status: 'upcoming', home: 'remo', away: 'kano', x: [52, 27, 21], btts: 49, o25: 44, pick: { market: 'OU15', outcome: 'over', p: 66 }, reason: 'Remo Stars games average 2.6 goals at home this season.', updated: 35, featured: true },
  { id: 'm9', comp: 'laliga', day: 1, time: '21:00', status: 'upcoming', home: 'barcelona', away: 'atletico', x: [49, 25, 26], btts: 61, o25: 57, pick: { market: 'BTTS', outcome: 'yes', p: 61 }, reason: 'Both teams have scored in four of the last five meetings.', updated: 50 },
  { id: 'm10', comp: 'epl', day: 1, time: '16:00', status: 'upcoming', home: 'mancity', away: 'brighton', x: [68, 18, 14], btts: 50, o25: 64, pick: { market: '1X2', outcome: 'home', p: 68 }, reason: 'City hold the highest home expected-goal difference in the league.', updated: 27, premium: true },
  { id: 'm11', comp: 'ucl', day: 1, time: '21:00', status: 'upcoming', home: 'bayern', away: 'psg', x: [45, 24, 31], btts: 66, o25: 67, pick: { market: 'OU25', outcome: 'over', p: 67 }, reason: 'Both clubs rank top three in the competition for shots per match.', updated: 44, featured: true },
  // In two and three days
  { id: 'm12', comp: 'npfl', day: 2, time: '16:00', status: 'upcoming', home: 'shooting', away: 'plateau', x: [44, 32, 24], btts: 42, o25: 37, pick: { market: 'DC', outcome: '1X', p: 76 }, reason: 'Shooting Stars have lost once at home in their last 14.', updated: 60, featured: true },
  { id: 'm13', comp: 'seriea', day: 2, time: '20:45', status: 'upcoming', home: 'milan', away: 'juventus', x: [38, 32, 30], btts: 47, o25: 43, pick: { market: 'OU25', outcome: 'under', p: 57 }, reason: 'Five of the last six meetings finished with two goals or fewer.', updated: 58 },
  { id: 'm14', comp: 'cafcl', day: 2, time: '15:00', status: 'upcoming', home: 'sundowns', away: 'wydad', x: [50, 30, 20], btts: 40, o25: 39, pick: { market: '1X2', outcome: 'home', p: 50 }, reason: 'Sundowns are unbeaten at home in the group stage across two seasons.', updated: 63, premium: true },
  { id: 'm15', comp: 'epl', day: 3, time: '17:30', status: 'upcoming', home: 'chelsea', away: 'arsenal', x: [36, 27, 37], btts: 60, o25: 54, pick: { market: 'BTTS', outcome: 'yes', p: 60 }, reason: 'Both sides have scored in five of their last six meetings.', updated: 70, featured: true },
  // Settled
  { id: 'm16', comp: 'npfl', day: -1, time: '16:00', status: 'finished', score: [2, 0], home: 'enyimba', away: 'plateau', x: [58, 25, 17], btts: 39, o25: 40, pick: { market: '1X2', outcome: 'home', p: 58 }, reason: 'Enyimba were unbeaten in nine home games before kick-off.', updated: 0, featured: true },
  { id: 'm17', comp: 'epl', day: -1, time: '17:30', status: 'finished', score: [1, 1], home: 'mancity', away: 'arsenal', x: [52, 25, 23], btts: 55, o25: 54, pick: { market: '1X2', outcome: 'home', p: 52 }, reason: 'City had won six straight home games before this match.', updated: 0 },
  { id: 'm18', comp: 'seriea', day: -1, time: '20:45', status: 'finished', score: [0, 2], home: 'juventus', away: 'inter', x: [33, 31, 36], btts: 45, o25: 45, pick: { market: 'OU25', outcome: 'under', p: 55 }, reason: 'Recent meetings between the two had been low scoring.', updated: 0 },
  { id: 'm19', comp: 'cafcl', day: -2, time: '17:00', status: 'finished', score: [0, 1], home: 'alahly', away: 'wydad', x: [49, 31, 20], btts: 36, o25: 36, pick: { market: 'OU25', outcome: 'under', p: 64 }, reason: 'Both defences ranked top two in the group.', updated: 0, featured: true },
  { id: 'm20', comp: 'npfl', day: -2, time: '16:00', status: 'finished', score: [2, 1], home: 'shooting', away: 'kano', x: [46, 30, 24], btts: 61, o25: 48, pick: { market: 'BTTS', outcome: 'yes', p: 61 }, reason: 'Kano had scored in each of their last five away games.', updated: 0 },
  { id: 'm21', comp: 'epl', day: -3, time: '16:00', status: 'finished', score: [3, 2], home: 'newcastle', away: 'brighton', x: [45, 28, 27], btts: 53, o25: 43, pick: { market: 'OU25', outcome: 'under', p: 57 }, reason: 'Both teams had kept clean sheets in three of their last five.', updated: 0 },
  { id: 'm22', comp: 'npfl', day: -3, time: '16:00', status: 'finished', score: [0, 0], home: 'rivers', away: 'plateau', x: [55, 27, 18], btts: 40, o25: 34, pick: { market: '1X2', outcome: 'home', p: 55 }, reason: 'Rivers United had won four straight at home.', updated: 0, featured: true },
  { id: 'm23', comp: 'laliga', day: -3, time: '21:00', status: 'finished', score: [2, 1], home: 'atletico', away: 'sevilla', x: [57, 25, 18], btts: 48, o25: 45, pick: { market: 'DC', outcome: '1X', p: 77 }, reason: 'Atlético had lost one home league game all season.', updated: 0 },
];

const team = (id: string) => TEAMS[id];

/* Extra sample fixtures so every day has a full card across leagues. */
const LEAGUE_TEAMS: Record<CompId, string[]> = {
  npfl: ['enyimba', 'rivers', 'remo', 'kano', 'rangers', 'abia', 'shooting', 'plateau', 'kwara', 'lobi', 'sunshine', 'tornadoes', 'bendel', 'heartland', 'ikorodu', 'katsina'],
  cafcl: ['alahly', 'esttunis', 'wydad', 'sundowns', 'simba', 'mazembe', 'raja', 'petro'],
  epl: ['arsenal', 'newcastle', 'mancity', 'liverpool', 'chelsea', 'brighton', 'tottenham', 'manutd', 'villa', 'westham', 'everton', 'fulham', 'forest', 'bournemouth'],
  laliga: ['realmadrid', 'barcelona', 'atletico', 'sevilla', 'villarreal', 'sociedad', 'betis', 'valencia', 'athletic', 'girona'],
  seriea: ['inter', 'milan', 'juventus', 'napoli', 'roma', 'lazio', 'atalanta', 'fiorentina', 'bologna', 'torino'],
  bundesliga: ['bayern', 'leverkusen', 'dortmund', 'leipzig', 'stuttgart', 'frankfurt', 'freiburg', 'wolfsburg', 'gladbach'],
  ligue1: ['psg', 'marseille', 'monaco', 'lille', 'lyon', 'nice', 'lens', 'rennes', 'nantes'],
  ucl: ['bayern', 'psg', 'realmadrid', 'barcelona', 'arsenal', 'inter', 'benfica', 'porto', 'dortmund', 'liverpool'],
};
const PER_DAY: Record<CompId, number> = { npfl: 5, cafcl: 2, epl: 5, laliga: 4, seriea: 4, bundesliga: 4, ligue1: 3, ucl: 3 };
const TIMES = ['13:30', '15:00', '16:00', '17:30', '18:30', '19:00', '20:00', '20:45', '21:00'];
const REASONS = [
  'Home side has the stronger scoring record over the last eight league games.',
  'Both teams create plenty of chances, and their recent games have been open.',
  'The away side has struggled for goals on the road this season.',
  'Recent meetings have been tight, with few goals and a high draw rate.',
  'The home defence has conceded the fewest shots on target in the league at home.',
];

function generateMatches(): Match[] {
  const out: Match[] = [];
  for (let day = -3; day <= 3; day++) {
    const busy = new Set(BASE_MATCHES.filter((m) => m.day === day).flatMap((m) => [m.home, m.away]));
    const recentPair = (x: string, y: string) =>
      [...BASE_MATCHES, ...out].some((m) => Math.abs(m.day - day) <= 3 && ((m.home === x && m.away === y) || (m.home === y && m.away === x)));
    for (const comp of COMP_ORDER) {
      // Champions League and CAF only play midweek-style days in this sample
      if ((comp === 'ucl' || comp === 'cafcl') && Math.abs(day) % 2 === 1 && day !== 1) continue;
      const pool = LEAGUE_TEAMS[comp].filter((t) => !busy.has(t));
      const shift = (day + 3) * 3;
      const rotated = pool.map((_, i) => pool[(i + shift) % pool.length]);
      const n = Math.min(PER_DAY[comp], Math.floor(rotated.length / 2));
      const pairs: [string, string][] = [];
      for (const x of rotated) {
        if (pairs.length >= n) break;
        if (busy.has(x)) continue;
        const y = rotated.find((t) => t !== x && !busy.has(t) && !recentPair(x, t));
        if (!y) continue;
        busy.add(x);
        busy.add(y);
        pairs.push(hash(x + y + day) % 2 ? [x, y] : [y, x]);
      }
      for (let i = 0; i < pairs.length; i++) {
        const [home, away] = pairs[i];
        busy.add(home);
        busy.add(away);
        const key = `${comp}${day}${home}${away}`;
        const strong = hash(key + 'strong') % 4 === 0;
        const h = strong ? seeded(key + 'h', 64, 76) : seeded(key + 'h', 26, 62);
        const d = strong ? seeded(key + 'd', 13, 19) : seeded(key + 'd', 20, 32);
        const a = 100 - h - d;
        const o25 = seeded(key + 'o', 32, 70);
        const btts = seeded(key + 'b', 34, 68);
        const p15 = Math.min(94, o25 + 18 + (hash(key + 'x15') % 9));
        const p35 = Math.max(6, o25 - 22 - (hash(key + 'x35') % 7));
        let pick: Match['pick'];
        const mk = hash(key + 'mk') % 10;
        let g15 = p15;
        let g35 = p35;
        if (strong) {
          if (mk < 4) pick = { market: 'DC', outcome: '1X', p: Math.min(90, h + d) };
          else if (mk < 8) {
            g15 = seeded(key + 'o15', 80, 89);
            pick = { market: 'OU15', outcome: 'over', p: g15 };
          } else {
            g35 = seeded(key + 'u35', 11, 20);
            pick = { market: 'OU35', outcome: 'under', p: 100 - g35 };
          }
        } else if (mk <= 1 && (h >= 50 || a >= 45)) pick = h >= a ? { market: '1X2', outcome: 'home', p: h } : { market: '1X2', outcome: 'away', p: a };
        else if (mk <= 2) pick = { market: 'DC', outcome: h >= a ? '1X' : 'X2', p: h >= a ? h + d : a + d };
        else if (mk <= 4) pick = { market: 'OU15', outcome: 'over', p: p15 };
        else if (mk === 5) pick = o25 >= 50 ? { market: 'OU25', outcome: 'over', p: o25 } : { market: 'OU25', outcome: 'under', p: 100 - o25 };
        else if (mk === 6) pick = { market: 'OU35', outcome: 'under', p: 100 - p35 };
        else if (mk === 7) pick = btts >= 50 ? { market: 'BTTS', outcome: 'yes', p: btts } : { market: 'BTTS', outcome: 'no', p: 100 - btts };
        else if (h >= 52) pick = { market: '1X2', outcome: 'home', p: h };
        else if (o25 >= 58) pick = { market: 'OU25', outcome: 'over', p: o25 };
        else pick = { market: 'DC', outcome: h >= a ? '1X' : 'X2', p: h >= a ? h + d : a + d };
        const time = TIMES[hash(key) % TIMES.length];
        const finished = day < 0;
        const live = day === 0 && i === 0 && (comp === 'epl' || comp === 'bundesliga');
        out.push({
          id: `g-${key}`,
          comp,
          day,
          time,
          status: finished ? 'finished' : live ? 'live' : 'upcoming',
          minute: live ? seeded(key + 'min', 12, 80) : undefined,
          score: finished || live ? [hash(key + 's1') % 4, hash(key + 's2') % 3] : undefined,
          home,
          away,
          x: [h, d, a],
          btts,
          o25,
          o15: g15,
          o35: g35,
          pick,
          reason: REASONS[hash(key + 'r') % REASONS.length],
          updated: finished ? 0 : seeded(key + 'u', 5, 90),
          premium: !finished && hash(key + 'p') % 4 === 0,
        });
      }
    }
  }
  return out;
}

const MATCHES: Match[] = [...BASE_MATCHES, ...generateMatches()].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));

/* Sample decimal odds derived from our probability with a typical bookmaker margin. */
function oddsFor(m: Match) {
  return Math.max(1.05, Math.round((100 / m.pick.p) * 0.94 * 100) / 100);
}

function teamComp(id: string): CompId {
  return (COMP_ORDER.filter((c) => c !== 'ucl' && c !== 'cafcl').find((c) => LEAGUE_TEAMS[c].includes(id)) ??
    COMP_ORDER.find((c) => LEAGUE_TEAMS[c].includes(id)) ??
    'npfl') as CompId;
}

type Row = { id: string; p: number; w: number; d: number; l: number; gf: number; ga: number; pts: number; form: ('W' | 'D' | 'L')[] };
function standings(comp: CompId): Row[] {
  const played = comp === 'ucl' || comp === 'cafcl' ? 6 : 13;
  return LEAGUE_TEAMS[comp]
    .map((id) => {
      const w = Math.min(played, seeded(comp + id + 'w', 1, played * 0.75));
      const d = Math.min(played - w, seeded(comp + id + 'd', 0, played * 0.35));
      const l = played - w - d;
      const gf = Math.round(w * 2 + d * 1.1 + seeded(comp + id + 'gf', 0, 6));
      const ga = Math.round(l * 1.8 + d * 1 + seeded(comp + id + 'ga', 0, 5));
      return { id, p: played, w, d, l, gf, ga, pts: w * 3 + d, form: form(id) };
    })
    .sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);
}

/* Sample "consensus": how many of five external prediction sources agree with our pick.
   Real figures would need licensed consensus data. */
function consensus(m: Match) {
  const base = m.pick.p >= 70 ? 4 : m.pick.p >= 60 ? 3 : 2;
  return Math.min(5, base + (hash(m.id + 'c') % 2));
}

function o15(m: Match) {
  return m.o15 ?? Math.min(94, m.o25 + 18 + (hash(m.id + 'o15') % 9));
}
function o35(m: Match) {
  return m.o35 ?? Math.max(6, m.o25 - 22 - (hash(m.id + 'o35') % 7));
}

function pickText(m: Match) {
  const { market, outcome } = m.pick;
  const H = team(m.home).name;
  const A = team(m.away).name;
  if (market === '1X2') return outcome === 'home' ? `${H} win` : outcome === 'away' ? `${A} win` : 'Draw';
  if (market === 'DC') return outcome === '1X' ? `${H} or draw` : outcome === 'X2' ? `${A} or draw` : 'Either team wins';
  if (market === 'BTTS') return outcome === 'yes' ? 'Both teams score' : 'Not both teams score';
  const line = market === 'OU15' ? '1.5' : market === 'OU25' ? '2.5' : '3.5';
  return `${outcome === 'over' ? 'Over' : 'Under'} ${line} goals`;
}

function settle(m: Match): 'won' | 'lost' | null {
  if (m.status !== 'finished' || !m.score) return null;
  const [h, a] = m.score;
  const { market, outcome } = m.pick;
  let ok = false;
  if (market === '1X2') ok = outcome === 'home' ? h > a : outcome === 'away' ? a > h : h === a;
  if (market === 'DC') ok = outcome === '1X' ? h >= a : outcome === 'X2' ? a >= h : h !== a;
  if (market === 'BTTS') ok = outcome === 'yes' ? h > 0 && a > 0 : !(h > 0 && a > 0);
  if (market.startsWith('OU')) {
    const line = market === 'OU15' ? 1.5 : market === 'OU25' ? 2.5 : 3.5;
    ok = outcome === 'over' ? h + a > line : h + a < line;
  }
  return ok ? 'won' : 'lost';
}

function hash(s: string) {
  let x = 7;
  for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0;
  return x;
}
function seeded(s: string, min: number, max: number, dp = 0) {
  const v = min + ((hash(s) % 1000) / 1000) * (max - min);
  return Number(v.toFixed(dp));
}
function form(teamId: string) {
  return Array.from({ length: 5 }, (_, i) => {
    const r = hash(teamId + i) % 10;
    return r < 5 ? 'W' : r < 7 ? 'D' : 'L';
  }) as ('W' | 'D' | 'L')[];
}

function dateFor(offset: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}
function dayLabel(offset: number) {
  if (offset === 0) return 'Today';
  if (offset === -1) return 'Yesterday';
  if (offset === 1) return 'Tomorrow';
  return dateFor(offset).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
function shortDay(offset: number) {
  if (offset === 0) return 'Today';
  if (offset === -1) return 'Yest.';
  if (offset === 1) return 'Tom.';
  return dateFor(offset).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
}
function longDate(offset: number) {
  return dateFor(offset).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}
function ago(min: number) {
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  return `${Math.round(min / 60)} h ago`;
}

const GLOSSARY: { title: string; rows: [string, string][] }[] = [
  { title: 'Match result (1X2)', rows: [['1', 'Home team wins'], ['X', 'Draw'], ['2', 'Away team wins']] },
  { title: 'Double chance', rows: [['1X', 'Home team wins or draw'], ['X2', 'Away team wins or draw'], ['12', 'Either team wins']] },
  { title: 'Both teams to score', rows: [['BTTS', 'Both teams score at least once'], ['No BTTS', 'At least one team does not score']] },
  { title: 'Total goals', rows: [['O1.5', '2 or more goals'], ['O2.5', '3 or more goals'], ['U2.5', '2 goals or fewer'], ['U3.5', '3 goals or fewer']] },
];

type Filters = { status: 'all' | Status; groups: MarketGroup[]; minP: number; comps: CompId[]; sort: 'league' | 'time' | 'probability' };
const DEFAULT_FILTERS: Filters = { status: 'all', groups: [], minP: 0, comps: [], sort: 'league' };

type Route =
  | { name: 'match'; id: string }
  | { name: 'record' }
  | { name: 'premium' }
  | { name: 'leagues' }
  | { name: 'team'; id: string }
  | { name: 'comp'; id: CompId }
  | { name: 'page'; page: 'how' | 'responsible' | 'privacy' | 'help' };

type Tab = 'Bankers' | 'All matches' | 'Bet Builder' | 'Favourites' | 'Account';
const NAV: { name: Tab; icon: IconName }[] = [
  { name: 'Bankers', icon: 'auto-awesome' },
  { name: 'All matches', icon: 'sports-soccer' },
  { name: 'Bet Builder', icon: 'playlist-add-check' },
  { name: 'Favourites', icon: 'favorite-border' },
  { name: 'Account', icon: 'person-outline' },
];

function readFlag(key: string) {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}
function writeFlag(key: string) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, '1');
  } catch {
    /* storage unavailable */
  }
}

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

function Icon({ name, size = 20, color = C.muted }: { name: IconName; size?: number; color?: string }) {
  return <MaterialIcons name={name} size={size} color={color} />;
}

function Crest({ id, size = 26 }: { id: string; size?: number }) {
  const t = team(id);
  return (
    <View style={[s.crest, { width: size, height: size, borderRadius: size / 2, backgroundColor: t.color }]}>
      <Text style={[s.crestText, { fontSize: size * 0.34, color: t.dark ? '#111' : '#fff' }]}>{t.short.slice(0, 3)}</Text>
    </View>
  );
}

/* Bottom sheet that slides up, and closes when dragged down by its handle. */
function DragSheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const y = useRef(new Animated.Value(600)).current;
  const h = useRef(600);
  useEffect(() => {
    Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 16 }).start();
  }, [y]);
  const close = () => Animated.timing(y, { toValue: h.current, duration: 200, useNativeDriver: true }).start(() => onClose());
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 3,
      onPanResponderMove: (_e, g) => y.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_e, g) => {
        if (g.dy > Math.min(140, h.current * 0.3) || g.vy > 0.9) close();
        else Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
      },
      onPanResponderTerminate: () => Animated.spring(y, { toValue: 0, useNativeDriver: true }).start(),
    }),
  ).current;
  const scrimOpacity = y.interpolate({ inputRange: [0, 400], outputRange: [1, 0], extrapolate: 'clamp' });
  return (
    <View style={s.overlay}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: scrimOpacity }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" style={s.scrim} onPress={close} />
      </Animated.View>
      <Animated.View style={{ transform: [{ translateY: y }], maxHeight: '90%' }} onLayout={(e) => (h.current = e.nativeEvent.layout.height)}>
        <BlurView intensity={45} tint="dark" style={[s.sheet, { flexShrink: 1 }]}>
          <View {...pan.panHandlers} accessibilityLabel="Drag down to close" style={s.grabZone}>
            <View style={s.grabber} />
          </View>
          {children}
        </BlurView>
      </Animated.View>
    </View>
  );
}

function LivePulse() {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[s.liveDot, { opacity }]} />;
}

function Chip({
  label,
  selected,
  onPress,
  icon,
  count,
  removable,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: IconName;
  count?: number;
  removable?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={removable ? `Remove filter ${label}` : label}
      onPress={onPress}
      style={[s.chip, selected && s.chipOn]}
    >
      {icon ? <Icon name={icon} size={16} color={selected ? C.accent : C.soft} /> : null}
      <Text style={[s.chipText, selected && s.chipTextOn]}>{label}</Text>
      {count ? (
        <View style={s.chipCount}>
          <Text style={s.chipCountText}>{count}</Text>
        </View>
      ) : null}
      {removable ? <Icon name="close" size={14} color={C.accent} /> : null}
    </Pressable>
  );
}

function Button({
  label,
  onPress,
  kind = 'primary',
  icon,
  disabled,
  small,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'ghost';
  icon?: IconName;
  disabled?: boolean;
  small?: boolean;
}) {
  const color = kind === 'primary' ? '#0B0820' : C.accent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        kind === 'secondary' && s.btnSecondary,
        kind === 'ghost' && s.btnGhost,
        small && s.btnSmall,
        disabled && s.btnDisabled,
        pressed && !disabled && { opacity: 0.8 },
      ]}
    >
      {icon ? <Icon name={icon} size={18} color={disabled ? C.faint : color} /> : null}
      <Text style={[s.btnText, { color: disabled ? C.faint : color }, small && { fontSize: 13 }]}>{label}</Text>
    </Pressable>
  );
}

function SectionHead({ title, action, onAction, sub }: { title: string; action?: string; onAction?: () => void; sub?: string }) {
  return (
    <View style={s.sectionHead}>
      <View style={{ flex: 1 }}>
        <Text style={s.sectionTitle}>{title}</Text>
        {sub ? <Text style={s.sectionSub}>{sub}</Text> : null}
      </View>
      {action && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={10} style={s.linkWrap}>
          <Text style={s.link}>{action}</Text>
          <Icon name="chevron-right" size={18} color={C.accent} />
        </Pressable>
      ) : null}
    </View>
  );
}

function Notice({ icon = 'info-outline', text, tone = 'neutral' }: { icon?: IconName; text: string; tone?: 'neutral' | 'caution' }) {
  return (
    <View style={s.notice}>
      <Icon name={icon} size={18} color={tone === 'caution' ? C.amber : C.muted} />
      <Text style={s.noticeText}>{text}</Text>
    </View>
  );
}

function ResultBadge({ result }: { result: 'won' | 'lost' }) {
  const won = result === 'won';
  return (
    <View style={[s.badge, { backgroundColor: won ? C.wonSoft : C.lostSoft }]}>
      <Icon name={won ? 'check-circle' : 'cancel'} size={14} color={won ? C.won : C.lost} />
      <Text style={[s.badgeText, { color: won ? C.won : C.lost }]}>{won ? 'Correct' : 'Missed'}</Text>
    </View>
  );
}

function ProbBar({ parts, labels }: { parts: number[]; labels: string[] }) {
  const colors = [C.accent, '#5D5F6B', '#B7AEFF'];
  return (
    <View>
      <View style={s.probBar}>
        {parts.map((p, i) => (
          <View key={i} style={{ width: `${p}%`, backgroundColor: colors[i], height: '100%' }} />
        ))}
      </View>
      <View style={s.probLegend}>
        {parts.map((p, i) => (
          <View key={i} style={[s.probLegendItem, i === 1 && { alignItems: 'center' }, i === 2 && { alignItems: 'flex-end' }]}>
            <Text style={s.probLegendValue}>{p}%</Text>
            <Text style={s.probLegendLabel} numberOfLines={1}>
              {labels[i]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Splash({ onDone }: { onDone: () => void }) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const done = useRef(false);
  const finish = () => {
    if (done.current) return;
    done.current = true;
    Animated.timing(fade, { toValue: 0, duration: 320, useNativeDriver: true }).start(() => onDone());
  };
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(finish, 2000);
    return () => clearTimeout(t);
  }, []);
  return (
    <Pressable accessibilityRole="image" accessibilityLabel="Oddlytics" onPress={finish} style={s.splash}>
      <Animated.View style={{ opacity: fade, transform: [{ scale }] }}>
        <Text style={s.splashLogo}>
          oddlytics<Text style={{ color: C.accent }}>.</Text>
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function Glass({ children, overlay, radius = 12, style }: { children: React.ReactNode; overlay?: React.ReactNode; radius?: number; style?: object }) {
  return (
    <View style={[{ position: 'relative', overflow: 'hidden', borderRadius: radius }, style]}>
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {children}
      </View>
      <BlurView intensity={70} tint="dark" style={[s.glassFill, { borderRadius: radius }]}>
        {overlay}
      </BlurView>
    </View>
  );
}

function NumField({
  value,
  onCommit,
  decimals = 0,
  min,
  max,
  label,
}: {
  value: number;
  onCommit: (v: number) => void;
  decimals?: number;
  min: number;
  max: number;
  label: string;
}) {
  const [text, setText] = useState(value.toFixed(decimals));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setText(value.toFixed(decimals));
  }, [value, decimals, focused]);
  const commit = () => {
    setFocused(false);
    const n = parseFloat(text.replace(',', '.'));
    if (Number.isFinite(n)) {
      const v = Math.min(max, Math.max(min, decimals ? Math.round(n * 100) / 100 : Math.round(n)));
      onCommit(v);
      setText(v.toFixed(decimals));
    } else setText(value.toFixed(decimals));
  };
  return (
    <TextInput
      value={text}
      onChangeText={setText}
      onFocus={() => setFocused(true)}
      onBlur={commit}
      onSubmitEditing={commit}
      selectTextOnFocus
      keyboardType={decimals ? 'decimal-pad' : 'number-pad'}
      returnKeyType="done"
      accessibilityLabel={`${label}. Type a value between ${min} and ${max}`}
      style={[s.numField, focused && s.numFieldOn]}
    />
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  const [tab, setTab] = useState<Tab>('Bankers');
  const [stack, setStack] = useState<Route[]>([]);
  const [day, setDay] = useState(0);
  const [bankersView, setBankersView] = useState<'picks' | 'slip'>('picks');
  const [bankersFocus, setBankersFocus] = useState<'All' | 'Following' | 'Nigeria'>('All');
  const [query, setQuery] = useState('');
  const [liveOnly, setLiveOnly] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>(['m3', 'm11']);
  const [followTeams, setFollowTeams] = useState<string[]>(['enyimba', 'arsenal']);
  const [followComps, setFollowComps] = useState<CompId[]>(['npfl', 'epl']);
  const [favSegment, setFavSegment] = useState<'Matches' | 'Teams' | 'Competitions'>('Matches');
  const [isPlus, setIsPlus] = useState(false);
  const [detailTab, setDetailTab] = useState('Overview');
  const [detailMode, setDetailMode] = useState<'Result' | 'Preview'>('Result');
  const [sheet, setSheet] = useState<null | 'filters' | 'calendar' | 'glossary' | 'menu'>(null);
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [toast, setToast] = useState<{ text: string; undo?: () => void } | null>(null);
  const [splash, setSplash] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [authReturn, setAuthReturn] = useState(false);
  const afterAuth = () => {
    if (authReturn) { setAuthReturn(false); setOnboarded(true); } else setOnboardStep(2);
  };
  const [user, setUser] = useState<null | { name: string; email: string }>(null);
  const [ageOk, setAgeOk] = useState(false);
  const [notify, setNotify] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [recordRange, setRecordRange] = useState<'30 days' | '90 days' | 'All time'>('90 days');
  const [recordTable, setRecordTable] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [plan, setPlan] = useState<'month' | 'quarter' | 'year'>('quarter');
  // Bet Builder
  const [bType, setBType] = useState<'All' | 'Featured' | 'Live'>('All');
  const [bMarket, setBMarket] = useState<'Any' | MarketGroup>('Any');
  const [bDay, setBDay] = useState<'today' | 'tomorrow' | 'both'>('today');
  const [bCount, setBCount] = useState(4);
  const [bTotal, setBTotal] = useState(10);
  const [bMinOdd, setBMinOdd] = useState(1.05);
  const [bMaxOdd, setBMaxOdd] = useState(3);
  const [bMinP, setBMinP] = useState(55);
  const [bSlip, setBSlip] = useState<string[] | null>(null);
  const [compTab, setCompTab] = useState<'Predictions' | 'Standings' | 'Season stats'>('Predictions');
  const searchRef = useRef<TextInput>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const route = stack[stack.length - 1];
  const push = (r: Route) => setStack((st) => [...st, r]);
  const pop = () => setStack((st) => st.slice(0, -1));
  const showToast = (text: string, undo?: () => void) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ text, undo });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };
  const goTab = (t: Tab) => {
    setStack([]);
    if (t === 'All matches' && t !== tab) setFilters((f) => ({ ...f, sort: 'league' }));
    setTab(t);
  };
  const openMatch = (m: Match) => {
    setDetailTab('Overview');
    setDetailMode('Result');
    push({ name: 'match', id: m.id });
  };
  const toggleSaved = (m: Match) => {
    const was = savedIds.includes(m.id);
    setSavedIds((ids) => (was ? ids.filter((i) => i !== m.id) : [...ids, m.id]));
    showToast(was ? 'Removed from Favourites' : 'Saved to Favourites', () =>
      setSavedIds((ids) => (was ? [...ids, m.id] : ids.filter((i) => i !== m.id))),
    );
  };
  const toggleTeam = (id: string) => {
    const was = followTeams.includes(id);
    setFollowTeams((ids) => (was ? ids.filter((i) => i !== id) : [...ids, id]));
    showToast(was ? `Unfollowed ${team(id).name}` : `Following ${team(id).name}`);
  };
  const toggleComp = (id: CompId) => {
    const was = followComps.includes(id);
    setFollowComps((ids) => (was ? ids.filter((i) => i !== id) : [...ids, id]));
    showToast(was ? `Unfollowed ${COMPS[id].name}` : `Following ${COMPS[id].name}`);
  };
  const locked = (m: Match) => !!m.premium && !isPlus && m.status !== 'finished';
  const openSearch = () => {
    goTab('All matches');
    setTimeout(() => searchRef.current?.focus(), 120);
  };

  /* ---------- derived lists ---------- */
  const applyFilters = (f: Filters, src: Match[]) =>
    src.filter(
      (m) =>
        (f.status === 'all' || m.status === f.status) &&
        (!f.groups.length || f.groups.includes(MARKET_GROUP[m.pick.market])) &&
        (f.minP === 0 || m.pick.p >= f.minP) &&
        (!f.comps.length || f.comps.includes(m.comp)),
    );

  const exploreBase = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MATCHES.filter((m) => {
      if (q) {
        const hay = `${team(m.home).name} ${team(m.away).name} ${COMPS[m.comp].name} ${COMPS[m.comp].country}`.toLowerCase();
        return hay.includes(q);
      }
      return m.day === day;
    }).filter((m) => !liveOnly || m.status === 'live');
  }, [query, day, liveOnly]);
  const exploreList = useMemo(() => {
    const list = applyFilters(filters, exploreBase);
    if (filters.sort === 'time') return [...list].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
    if (filters.sort === 'probability') return [...list].sort((a, b) => b.pick.p - a.pick.p);
    return list;
  }, [exploreBase, filters]);
  const draftCount = applyFilters(draft, exploreBase).length;

  const dayMatches = MATCHES.filter((m) => m.day === day);
  const bankersList = dayMatches.filter((m) =>
    bankersFocus === 'All'
      ? true
      : bankersFocus === 'Nigeria'
        ? m.comp === 'npfl'
        : followComps.includes(m.comp) || followTeams.includes(m.home) || followTeams.includes(m.away),
  );
  const topPicks = [...bankersList].filter((m) => m.pick.p >= 55).sort((a, b) => b.pick.p - a.pick.p).slice(0, 10);
  const slip = [...dayMatches]
    .filter((m) => consensus(m) >= 4 && m.pick.p >= 58)
    .sort((a, b) => consensus(b) - consensus(a) || b.pick.p - a.pick.p)
    .slice(0, 5);
  const liveNow = MATCHES.filter((m) => m.status === 'live' && m.day === 0);
  const freeCount = dayMatches.filter((m) => !m.premium).length;

  const activeFilterCount =
    (filters.status !== 'all' ? 1 : 0) + filters.groups.length + (filters.minP ? 1 : 0) + filters.comps.length;

  const builderPool = MATCHES.filter(
    (m) =>
      (bDay === 'both' ? m.day === 0 || m.day === 1 : m.day === (bDay === 'today' ? 0 : 1)) &&
      m.status !== 'finished' &&
      !locked(m) &&
      (bType === 'All' || (bType === 'Featured' ? m.featured : m.status === 'live')) &&
      (bMarket === 'Any' || MARKET_GROUP[m.pick.market] === bMarket) &&
      m.pick.p >= bMinP &&
      oddsFor(m) >= bMinOdd &&
      oddsFor(m) <= bMaxOdd,
  ).sort((a, b) => b.pick.p - a.pick.p);
  const perPickNeeded = Math.pow(bTotal, 1 / bCount);
  const generateSlip = () => {
    const pool = builderPool.slice(0, 30);
    const chosen: Match[] = [];
    let product = 1;
    for (let i = 0; i < bCount && chosen.length < pool.length; i++) {
      const remaining = bCount - i;
      const need = Math.pow(bTotal / product, 1 / remaining);
      let best: Match | null = null;
      let bestScore = Infinity;
      for (const m of pool) {
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
    setBSlip(chosen.map((m) => m.id));
    if (!chosen.length) showToast('No games fit these settings. Loosen a limit and try again.');
  };
  const clearBuilder = () => {
    setBType('All');
    setBMarket('Any');
    setBDay('today');
    setBCount(4);
    setBTotal(10);
    setBMinOdd(1.05);
    setBMaxOdd(3);
    setBMinP(55);
    setBSlip(null);
  };

  /* ---------- shared renderers ---------- */

  const renderDateRail = () => {
    const offsets = [-3, -2, -1, 0, 1, 2, 3];
    if (!offsets.includes(day)) offsets.push(day);
    return (
      <View style={s.railWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail}>
          {offsets.map((o) => {
            const on = o === day && !query;
            const has = MATCHES.some((m) => m.day === o);
            return (
              <Pressable
                key={o}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${longDate(o)}${has ? '' : ', no fixtures'}`}
                onPress={() => {
                  setQuery('');
                  setDay(o);
                }}
                style={[s.railItem, on && s.railItemOn]}
              >
                <Text style={[s.railTop, on && s.railTextOn]}>
                  {o === 0 ? 'Today' : o === -1 ? 'Yest.' : o === 1 ? 'Tom.' : dateFor(o).toLocaleDateString('en-GB', { weekday: 'short' })}
                </Text>
                <Text style={[s.railBottom, on && s.railTextOn]}>{dateFor(o).getDate()}</Text>
                <View style={[s.railDot, { opacity: has ? 1 : 0 }, on && { backgroundColor: C.accent }]} />
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable accessibilityRole="button" accessibilityLabel="Open calendar" onPress={() => setSheet('calendar')} style={s.calBtn}>
          <Icon name="calendar-month" size={22} color={C.accent} />
        </Pressable>
      </View>
    );
  };

  const renderMatchCard = (m: Match, opts: { showDay?: boolean } = {}) => {
    const isLocked = locked(m);
    const result = settle(m);
    const saved = savedIds.includes(m.id);
    const statusEl =
      m.status === 'live' ? (
        <View style={s.statusCol}>
          <View style={s.liveRow}>
            <LivePulse />
            <Text style={s.liveText}>LIVE</Text>
          </View>
          <Text style={s.liveMinute}>{m.minute}′</Text>
        </View>
      ) : m.status === 'finished' ? (
        <View style={s.statusCol}>
          <Text style={s.statusText}>FT</Text>
          {opts.showDay ? <Text style={s.statusSub}>{shortDay(m.day)}</Text> : null}
        </View>
      ) : (
        <View style={s.statusCol}>
          <Text style={s.statusText}>{m.time}</Text>
          {opts.showDay ? <Text style={s.statusSub}>{shortDay(m.day)}</Text> : null}
        </View>
      );
    return (
      <Pressable
        key={m.id}
        accessibilityRole="button"
        accessibilityLabel={`${team(m.home).name} versus ${team(m.away).name}, ${
          m.status === 'live' ? `live, ${m.score?.join(' to ')}` : m.status === 'finished' ? `full time ${m.score?.join(' to ')}` : `kick-off ${m.time}`
        }. ${isLocked ? 'Premium insight' : `${pickText(m)}, ${m.pick.p} percent`}${result ? `, prediction ${result === 'won' ? 'correct' : 'missed'}` : ''}`}
        onPress={() => openMatch(m)}
        style={({ pressed }) => [s.card, pressed && { backgroundColor: C.elevated }]}
      >
        <View style={s.cardMain}>
          {statusEl}
          <View style={s.cardTeams}>
            {[m.home, m.away].map((id, i) => (
              <View key={id} style={s.teamLine}>
                <Crest id={id} size={22} />
                <Text style={[s.teamName, result && m.score && m.score[i] < m.score[1 - i] && { color: C.muted }]} numberOfLines={1}>
                  {team(id).name}
                </Text>
                {m.score ? (
                  <Text style={[s.score, m.status === 'live' && { color: C.live }]}>{m.score[i]}</Text>
                ) : null}
              </View>
            ))}
          </View>
          <View style={s.cardProb}>
            {isLocked ? (
              <Glass overlay={<Icon name="lock" size={18} color={C.accent} />} style={s.lockProb}>
                <Text style={s.probValue}>{m.pick.p}%</Text>
                <Text style={s.probCaption}>estimate</Text>
              </Glass>
            ) : (
              <>
                <Text style={s.probValue}>{m.pick.p}%</Text>
                <Text style={s.probCaption}>estimate</Text>
              </>
            )}
          </View>
        </View>
        <View style={s.cardFoot}>
          <View style={{ flex: 1 }}>
            {isLocked ? (
              <Glass
                radius={8}
                overlay={
                  <View style={s.lockLabel}>
                    <Icon name="lock" size={14} color={C.accent} />
                    <Text style={s.lockLabelText}>Plus insight</Text>
                  </View>
                }
              >
                <Text style={[s.pickLine, { paddingVertical: 4 }]} numberOfLines={1}>
                  {pickText(m)}
                  <Text style={s.pickMarket}> · {MARKET_NAME[m.pick.market]}</Text>
                </Text>
              </Glass>
            ) : (
              <Text style={s.pickLine} numberOfLines={1}>
                {pickText(m)}
                <Text style={s.pickMarket}> · {MARKET_NAME[m.pick.market]}</Text>
              </Text>
            )}
          </View>
          {result ? <ResultBadge result={result} /> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Remove from Favourites' : 'Save to Favourites'}
            hitSlop={10}
            onPress={(e) => {
              e.stopPropagation();
              toggleSaved(m);
            }}
            style={s.heart}
          >
            <Icon name={saved ? 'favorite' : 'favorite-border'} size={20} color={saved ? C.accent : C.faint} />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  const renderGrouped = (list: Match[], showDay = false) =>
    COMP_ORDER.filter((c) => list.some((m) => m.comp === c)).map((c) => {
      const items = list.filter((m) => m.comp === c);
      const isCollapsed = collapsed.includes(c);
      return (
        <View key={c} style={s.group}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: !isCollapsed }}
            accessibilityLabel={`${COMPS[c].name}, ${items.length} matches`}
            onPress={() => setCollapsed((cs) => (isCollapsed ? cs.filter((x) => x !== c) : [...cs, c]))}
            style={s.groupHead}
          >
            <View style={s.flag}>
              <Text style={s.flagText}>{COMPS[c].country.slice(0, 3).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.groupName}>{COMPS[c].name}</Text>
              <Text style={s.groupCountry}>{COMPS[c].country}</Text>
            </View>
            {followComps.includes(c) ? <Icon name="star" size={16} color={C.accent} /> : null}
            <Text style={s.groupCount}>{items.length}</Text>
            <Icon name={isCollapsed ? 'expand-more' : 'expand-less'} size={22} color={C.muted} />
          </Pressable>
          {!isCollapsed && items.map((m) => renderMatchCard(m, { showDay }))}
        </View>
      );
    });

  const renderEmptyDay = () => (
    <View style={s.empty}>
      <Icon name="event-busy" size={34} color={C.accent} />
      <Text style={s.emptyTitle}>No fixtures on {longDate(day)}</Text>
      <Text style={s.emptyBody}>Try a nearby date. Sample data covers three days either side of today.</Text>
      <View style={s.row}>
        <Button small kind="secondary" icon="chevron-left" label={dayLabel(day - 1)} onPress={() => setDay(day - 1)} />
        <View style={{ width: 8 }} />
        <Button small kind="secondary" label="Today" onPress={() => setDay(0)} />
        <View style={{ width: 8 }} />
        <Button small kind="secondary" label={dayLabel(day + 1)} onPress={() => setDay(day + 1)} />
      </View>
    </View>
  );

  /* ---------- tabs ---------- */

  const renderFeature = (m: Match, rank: number) => {
          const result = settle(m);
          return (
            <Pressable key={m.id} accessibilityRole="button" onPress={() => openMatch(m)} style={s.feature}>
              <View style={s.featureTop}>
                <Text style={s.eyebrow}>
                  #{rank} · {COMPS[m.comp].name} · {m.status === 'finished' ? 'Full time' : m.status === 'live' ? `Live ${m.minute}′` : m.time}
                </Text>
                {result ? <ResultBadge result={result} /> : <Icon name="north-east" size={18} color={C.accent} />}
              </View>
              <View style={s.featureTeams}>
                <View style={s.featureTeam}>
                  <Crest id={m.home} size={44} />
                  <Text style={s.featureTeamName} numberOfLines={2}>
                    {team(m.home).name}
                  </Text>
                </View>
                <Text style={s.featureVs}>{m.score ? m.score.join(' – ') : 'vs'}</Text>
                <View style={s.featureTeam}>
                  <Crest id={m.away} size={44} />
                  <Text style={s.featureTeamName} numberOfLines={2}>
                    {team(m.away).name}
                  </Text>
                </View>
              </View>
              <View style={s.featurePick}>
                <View style={{ flex: 1 }}>
                  <Text style={s.featurePickLabel}>{MARKET_NAME[m.pick.market]}</Text>
                  <Text style={s.featurePickText}>{pickText(m)}</Text>
                </View>
                <Text style={s.featurePct}>{m.pick.p}%</Text>
              </View>
              <View style={s.meter}>
                <View style={[s.meterFill, { width: `${m.pick.p}%` }]} />
              </View>
              <Text style={s.featureReason}>{m.reason}</Text>
              <Text style={s.meta}>
                {m.status === 'finished' ? 'Published before kick-off · kept as originally published' : `Updated ${ago(m.updated)} · probability, not certainty`}
              </Text>
            </Pressable>
          );
  };

  const renderSlip = () => (
    <>
      <View style={s.slipHead}>
        <View style={s.row}>
          <Icon name="receipt-long" size={22} color={C.accent} />
          <Text style={[s.sectionTitle, { marginLeft: 8, flex: 1 }]}>Oddlytics Slip</Text>
          <Text style={s.meta}>{dayLabel(day)}</Text>
        </View>
        <Text style={[s.body, { marginTop: 8 }]}>
          Up to 5 picks where our model is most confident and most outside prediction sources reach the same outcome.
        </Text>
      </View>
      {slip.length === 0 ? (
        dayMatches.length === 0 ? (
          renderEmptyDay()
        ) : (
          <View style={s.empty}>
            <Icon name="receipt-long" size={32} color={C.accent} />
            <Text style={s.emptyTitle}>No slip for this date</Text>
            <Text style={s.emptyBody}>No match reached strong enough agreement. We'd rather show nothing than a weak slip.</Text>
          </View>
        )
      ) : (
        <>
          {slip.map((m, i) => {
            const isLocked = locked(m);
            const agree = consensus(m);
            const result = settle(m);
            return (
              <Pressable key={m.id} accessibilityRole="button" accessibilityLabel={`Slip pick ${i + 1}: ${team(m.home).name} versus ${team(m.away).name}. ${isLocked ? 'Plus insight' : `${pickText(m)}, ${m.pick.p} percent`}. ${agree} of 5 sources agree.`} onPress={() => openMatch(m)} style={s.slipRow}>
                <View style={s.slipNum}>
                  <Text style={s.slipNumText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.inlineComp} numberOfLines={1}>
                    {COMPS[m.comp].name} · {m.status === 'live' ? `Live ${m.minute}′` : m.status === 'finished' ? `FT ${m.score?.join('–')}` : m.time}
                  </Text>
                  <Text style={s.builderTeams} numberOfLines={1}>
                    {team(m.home).name} <Text style={{ color: C.faint }}>v</Text> {team(m.away).name}
                  </Text>
                  <Text style={s.pickLine} numberOfLines={1}>
                    {isLocked ? <Text style={{ color: C.accent }}>Plus insight · unlock to see the pick</Text> : pickText(m)}
                    <Text style={s.pickMarket}> · {MARKET_NAME[m.pick.market]}</Text>
                  </Text>
                  <View style={[s.row, { marginTop: 8, gap: 4 }]}>
                    {[0, 1, 2, 3, 4].map((k) => (
                      <View key={k} style={[s.agreeDot, k < agree && s.agreeDotOn]} />
                    ))}
                    <Text style={[s.meta, { marginLeft: 6 }]}>{agree}/5 sources agree</Text>
                    {result ? <View style={{ marginLeft: 'auto' }}><ResultBadge result={result} /></View> : null}
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                  {isLocked ? (
                    <Glass overlay={<Icon name="lock" size={18} color={C.accent} />} style={s.lockProb}>
                      <Text style={s.probValue}>{m.pick.p}%</Text>
                    </Glass>
                  ) : (
                    <Text style={s.probValue}>{m.pick.p}%</Text>
                  )}
                  <Text style={s.probCaption}>{isLocked ? 'Plus' : 'our estimate'}</Text>
                </View>
              </Pressable>
            );
          })}
        </>
      )}
      <Notice text="Agreement between sources is sample data in this prototype; the live app needs licensed data for it. Even when every source agrees, a result is never certain. We don't multiply the picks into one combined chance." />
    </>
  );

  const renderLive = () => (
    <>
      {liveNow.length && day === 0 && !query ? (
        <>
          <SectionHead title="Live now" sub={`${liveNow.length} matches in play`} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18 }} contentContainerStyle={{ paddingHorizontal: 18, gap: 10 }}>
            {liveNow.map((m) => (
              <Pressable key={m.id} accessibilityRole="button" onPress={() => openMatch(m)} style={s.liveCard}>
                <View style={s.liveRow}>
                  <LivePulse />
                  <Text style={s.liveText}>LIVE {m.minute}′</Text>
                  <Text style={s.liveComp} numberOfLines={1}>
                    {COMPS[m.comp].name}
                  </Text>
                </View>
                {[m.home, m.away].map((id, i) => (
                  <View key={id} style={[s.teamLine, { marginTop: 8 }]}>
                    <Crest id={id} size={20} />
                    <Text style={s.teamName} numberOfLines={1}>
                      {team(id).name}
                    </Text>
                    <Text style={[s.score, { color: C.text }]}>{m.score?.[i]}</Text>
                  </View>
                ))}
              </Pressable>
            ))}
          </ScrollView>
        </>
      ) : null}

    </>
  );

  const renderPicks = () => (
    <>
      {dayMatches.length === 0 ? (
        renderEmptyDay()
      ) : topPicks.length === 0 ? (
        <View style={s.empty}>
          <Icon name="star-outline" size={32} color={C.accent} />
          <Text style={s.emptyTitle}>{bankersFocus === 'Following' ? 'Nothing from your follows on this date' : 'No strong picks for this date'}</Text>
          <Text style={s.emptyBody}>{bankersFocus === 'Following' ? 'Follow teams and competitions to build this view.' : 'Every match is listed in All matches.'}</Text>
          {bankersFocus === 'Following' ? <Button small kind="secondary" label="Choose what to follow" onPress={() => { setFavSegment('Teams'); goTab('Favourites'); }} /> : null}
        </View>
      ) : (
        <>
          <SectionHead title={day === 0 ? "Today's top picks" : `Top picks · ${dayLabel(day)}`} sub="Highest model probability first" action="Track record" onAction={() => push({ name: 'record' })} />
          {topPicks.slice(0, 2).map((m, i) => renderFeature(m, i + 1))}
          {topPicks.length > 2 ? <SectionHead title="More strong picks" sub={`${topPicks.length - 2} more at 55% or higher`} /> : null}
          {topPicks.slice(2).map((m) => renderMatchCard(m, {}))}
        </>
      )}
      {!isPlus && freeCount < dayMatches.length ? (
        <Pressable accessibilityRole="button" onPress={() => push({ name: 'premium' })} style={s.freeBanner}>
          <Icon name="lock-open" size={20} color={C.accent} />
          <Text style={s.freeText}>
            <Text style={{ color: C.text, fontWeight: '700' }}>
              {freeCount} of {dayMatches.length} insights are free
            </Text>{' '}
            on this date. Fixture details stay free for every match.
          </Text>
          <Icon name="chevron-right" size={20} color={C.accent} />
        </Pressable>
      ) : null}

      {dayMatches.length ? (
        <View style={{ marginTop: 12 }}>
          <Button kind="secondary" icon="sports-soccer" label={`See all ${dayMatches.length} matches on this date`} onPress={() => goTab('All matches')} />
        </View>
      ) : null}
      <Pressable accessibilityRole="button" onPress={() => push({ name: 'record' })} style={s.recordTeaser}>
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>Open track record · sample</Text>
          <Text style={s.cardTitle}>225 of 412 top picks correct</Text>
          <Text style={s.body}>1 Aug – 24 Nov 2026 · losses and voids included</Text>
        </View>
        <Icon name="chevron-right" size={24} color={C.accent} />
      </Pressable>
      <Notice tone="caution" icon="info-outline" text="“Bankers” is a section name, not a promise. Every estimate is uncertain and no result is guaranteed." />
    </>
  );

  const renderBankers = () => (
    <>
      <View style={[s.segment, { marginTop: 8 }]}>
        {(
          [
            ['picks', "Today's Picks", 'auto-awesome'],
            ['slip', 'Oddlytics Slip', 'receipt-long'],
          ] as const
        ).map(([k, label, icon]) => (
          <Pressable key={k} accessibilityRole="tab" accessibilityState={{ selected: bankersView === k }} onPress={() => setBankersView(k)} style={[s.segItem, s.segRow, bankersView === k && s.segItemOn]}>
            <Icon name={icon} size={18} color={bankersView === k ? C.accent : C.muted} />
            <Text style={[s.segText, bankersView === k && s.segTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {bankersView === 'picks' ? renderPicks() : renderSlip()}
    </>
  );

  const renderExplore = () => (
    <>
      {renderLive()}
      {liveNow.length && day === 0 && !query ? <View style={{ height: 12 }} /> : null}
      <View style={s.search}>
        <Icon name="search" size={20} color={C.muted} />
        <TextInput
          ref={searchRef}
          value={query}
          onChangeText={setQuery}
          placeholder="Search teams, competitions, countries"
          placeholderTextColor={C.faint}
          style={s.searchInput}
          accessibilityLabel="Search teams, competitions or countries"
          returnKeyType="search"
        />
        {query ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={10}>
            <Icon name="cancel" size={20} color={C.muted} />
          </Pressable>
        ) : null}
      </View>
      <View style={s.toolbar}>
        <Chip
          label="Filters"
          icon="tune"
          count={activeFilterCount}
          selected={activeFilterCount > 0}
          onPress={() => {
            setDraft(filters);
            setSheet('filters');
          }}
        />
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: liveOnly }}
          onPress={() => setLiveOnly(!liveOnly)}
          style={[s.chip, liveOnly && { backgroundColor: C.liveSoft, borderColor: C.live }]}
        >
          {liveOnly ? <LivePulse /> : <View style={[s.liveDot, { backgroundColor: C.faint }]} />}
          <Text style={[s.chipText, liveOnly && { color: C.live }]}>Live only</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable accessibilityRole="button" accessibilityLabel="Betting terms explained" onPress={() => setSheet('glossary')} style={s.iconBtn}>
          <Icon name="help-outline" size={20} color={C.accent} />
        </Pressable>
      </View>
      {activeFilterCount ? (
        <View style={s.wrap}>
          {filters.status !== 'all' ? (
            <Chip removable selected label={filters.status[0].toUpperCase() + filters.status.slice(1)} onPress={() => setFilters({ ...filters, status: 'all' })} />
          ) : null}
          {filters.groups.map((g) => (
            <Chip key={g} removable selected label={g} onPress={() => setFilters({ ...filters, groups: filters.groups.filter((x) => x !== g) })} />
          ))}
          {filters.minP ? <Chip removable selected label={`${filters.minP}%+`} onPress={() => setFilters({ ...filters, minP: 0 })} /> : null}
          {filters.comps.map((c) => (
            <Chip key={c} removable selected label={COMPS[c].name} onPress={() => setFilters({ ...filters, comps: filters.comps.filter((x) => x !== c) })} />
          ))}
          <Pressable accessibilityRole="button" onPress={() => setFilters(DEFAULT_FILTERS)} style={s.clearAll}>
            <Text style={s.link}>Clear all</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={s.resultLine}>
        <Text style={s.resultText}>
          {exploreList.length} {exploreList.length === 1 ? 'match' : 'matches'}
          {query ? ` for “${query}” across all dates` : ` · ${longDate(day)}`}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Sorted by ${filters.sort}. Change sort.`}
          onPress={() =>
            setFilters({ ...filters, sort: filters.sort === 'league' ? 'time' : filters.sort === 'time' ? 'probability' : 'league' })
          }
          style={s.linkWrap}
        >
          <Icon name="swap-vert" size={16} color={C.accent} />
          <Text style={s.link}>{filters.sort === 'league' ? 'By competition' : filters.sort === 'time' ? 'By kick-off' : 'By estimate'}</Text>
        </Pressable>
      </View>
      {exploreList.length === 0 ? (
        !query && MATCHES.filter((m) => m.day === day).length === 0 ? (
          renderEmptyDay()
        ) : (
          <View style={s.empty}>
            <Icon name="search-off" size={34} color={C.accent} />
            <Text style={s.emptyTitle}>No matches fit these choices</Text>
            <Text style={s.emptyBody}>Remove a filter, turn off Live only, or search a different team.</Text>
            <Button
              small
              kind="secondary"
              label="Reset search and filters"
              onPress={() => {
                setQuery('');
                setLiveOnly(false);
                setFilters(DEFAULT_FILTERS);
              }}
            />
          </View>
        )
      ) : filters.sort === 'league' ? (
        <>
          {(() => {
            const comps = COMP_ORDER.filter((c) => exploreList.some((m) => m.comp === c));
            const allCollapsed = comps.every((c) => collapsed.includes(c));
            return (
              <View style={s.collapseBar}>
                <Text style={s.collapseText}>
                  {comps.length} {comps.length === 1 ? 'league' : 'leagues'}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={allCollapsed ? 'Expand all leagues' : 'Collapse all leagues'}
                  onPress={() => setCollapsed(allCollapsed ? [] : comps)}
                  style={s.collapseBtn}
                >
                  <Icon name={allCollapsed ? 'unfold-more' : 'unfold-less'} size={18} color={C.accent} />
                  <Text style={s.link}>{allCollapsed ? 'Expand all' : 'Collapse all'}</Text>
                </Pressable>
              </View>
            );
          })()}
          {renderGrouped(exploreList, !!query)}
        </>
      ) : (
        exploreList.map((m) => (
          <View key={m.id}>
            <Text style={s.inlineComp}>{COMPS[m.comp].name}</Text>
            {renderMatchCard(m, { showDay: !!query })}
          </View>
        ))
      )}
      <Pressable accessibilityRole="button" onPress={() => push({ name: 'leagues' })} style={s.recordTeaser}>
        <Icon name="public" size={24} color={C.accent} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.cardTitle}>Browse competitions</Text>
          <Text style={s.body}>Coverage grows as each data source is verified.</Text>
        </View>
        <Icon name="chevron-right" size={24} color={C.accent} />
      </Pressable>
    </>
  );

  const renderBuilder = () => {
    const r2 = (v: number) => Math.round(v * 100) / 100;
    const slipMatches = (bSlip ?? []).map((id) => MATCHES.find((m) => m.id === id)!).filter(Boolean);
    const total = slipMatches.reduce((acc, m) => acc * oddsFor(m), 1);
    const poolMax = builderPool.reduce((mx, m) => Math.max(mx, oddsFor(m)), 0);
    const capped = builderPool.length > 0 && perPickNeeded > poolMax;
    const hard = perPickNeeded > bMaxOdd || perPickNeeded < bMinOdd || capped;
    const maxOddAtP = Math.max(1.05, Math.round((100 / bMinP) * 0.94 * 100) / 100);
    const probBlocksOdds = maxOddAtP < bMinOdd;
    return (
    <>
      <Text style={s.pageTitle}>Bet Builder</Text>
      <Text style={s.lead}>Set your targets and we'll build a slip from our strongest estimates. Nothing is placed or wagered here.</Text>
      <View style={s.panel}>
        <Text style={[s.fieldLabel, { marginTop: 0 }]}>Pick games from</Text>
        <View style={s.segment}>
          {(
            [
              ['today', "Today's games", dateFor(0)],
              ['tomorrow', "Tomorrow's games", dateFor(1)],
              ['both', 'Both days', null],
            ] as const
          ).map(([k, label, d]) => (
            <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: bDay === k }} onPress={() => setBDay(k)} style={[s.segItem, s.segTall, bDay === k && s.segItemOn]}>
              <Text style={[s.segText, bDay === k && s.segTextOn]}>{label}</Text>
              <Text style={[s.segSub, bDay === k && { color: C.accent }]}>
                {d ? d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Today + tomorrow'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={s.fieldLabel}>Event type</Text>
        <View style={s.segment}>
          {(['All', 'Featured', 'Live'] as const).map((t) => (
            <Pressable key={t} accessibilityRole="button" accessibilityState={{ selected: bType === t }} onPress={() => setBType(t)} style={[s.segItem, bType === t && s.segItemOn]}>
              <Text style={[s.segText, bType === t && s.segTextOn]}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={s.fieldLabel}>Market</Text>
        <View style={s.wrap}>
          {(['Any', 'Result', 'Double chance', 'Goals', 'BTTS'] as const).map((g) => (
            <Pressable key={g} accessibilityRole="button" accessibilityState={{ selected: bMarket === g }} onPress={() => setBMarket(g)} style={[s.chip, bMarket === g && s.chipOn]}>
              <Text style={[s.chipText, bMarket === g && s.chipTextOn]}>{g === 'Goals' ? 'Over / Under goals' : g}</Text>
            </Pressable>
          ))}
        </View>
        <View style={[s.row, { justifyContent: 'space-between', marginTop: 14, marginBottom: 8 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.fieldLabel, { marginTop: 0, marginBottom: 2 }]}>Total odds</Text>
            <Text style={s.meta}>Pick one or tap the number to type your own</Text>
          </View>
          <NumField label="Total odds" value={bTotal} decimals={2} min={1.1} max={10000} onCommit={setBTotal} />
        </View>
        <View style={s.wrap}>
          {[2, 5, 10, 20, 50, 100].map((t) => (
            <Chip key={t} label={`${t} odds`} selected={bTotal === t} onPress={() => setBTotal(t)} />
          ))}
        </View>
        <View style={s.stepperRow}>
          <View style={{ flex: 1 }}>
            <Text style={[s.fieldLabel, { marginTop: 0, marginBottom: 2 }]}>Number of matches</Text>
            <Text style={s.meta}>How many games on the slip</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Decrease number of matches" onPress={() => setBCount(Math.max(1, bCount - 1))} style={s.stepBtn}>
            <Icon name="remove" size={20} color={C.accent} />
          </Pressable>
          <NumField label="Number of matches" value={bCount} min={1} max={20} onCommit={setBCount} />
          <Pressable accessibilityRole="button" accessibilityLabel="Increase number of matches" onPress={() => setBCount(Math.min(20, bCount + 1))} style={s.stepBtn}>
            <Icon name="add" size={20} color={C.accent} />
          </Pressable>
        </View>
        <View style={s.stepperRow}>
          <View style={{ flex: 1 }}>
            <Text style={[s.fieldLabel, { marginTop: 0, marginBottom: 2 }]}>Minimum odd per pick</Text>
            <Text style={s.meta}>Skip picks priced below this</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Decrease minimum odd" onPress={() => setBMinOdd(Math.max(1.01, r2(bMinOdd - 0.05)))} style={s.stepBtn}>
            <Icon name="remove" size={20} color={C.accent} />
          </Pressable>
          <NumField label="Minimum odd per pick" value={bMinOdd} decimals={2} min={1.01} max={Math.max(1.02, bMaxOdd - 0.01)} onCommit={setBMinOdd} />
          <Pressable accessibilityRole="button" accessibilityLabel="Increase minimum odd" onPress={() => setBMinOdd(Math.min(r2(bMaxOdd - 0.05), r2(bMinOdd + 0.05)))} style={s.stepBtn}>
            <Icon name="add" size={20} color={C.accent} />
          </Pressable>
        </View>
        <View style={s.stepperRow}>
          <View style={{ flex: 1 }}>
            <Text style={[s.fieldLabel, { marginTop: 0, marginBottom: 2 }]}>Maximum odd per pick</Text>
            <Text style={s.meta}>Skip picks priced above this</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Decrease maximum odd" onPress={() => setBMaxOdd(Math.max(r2(bMinOdd + 0.05), r2(bMaxOdd - 0.1)))} style={s.stepBtn}>
            <Icon name="remove" size={20} color={C.accent} />
          </Pressable>
          <NumField label="Maximum odd per pick" value={bMaxOdd} decimals={2} min={bMinOdd + 0.01} max={50} onCommit={setBMaxOdd} />
          <Pressable accessibilityRole="button" accessibilityLabel="Increase maximum odd" onPress={() => setBMaxOdd(Math.min(10, r2(bMaxOdd + 0.1)))} style={s.stepBtn}>
            <Icon name="add" size={20} color={C.accent} />
          </Pressable>
        </View>
        <View style={[s.row, { justifyContent: 'space-between', marginTop: 14, marginBottom: 8 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.fieldLabel, { marginTop: 0, marginBottom: 2 }]}>Minimum probability per game</Text>
            <Text style={s.meta}>Pick one or type your own (%)</Text>
          </View>
          <NumField label="Minimum probability percent" value={bMinP} min={1} max={95} onCommit={setBMinP} />
        </View>
        <View style={s.wrap}>
          {[50, 55, 60, 65, 70, 75, 80, 85].map((p) => (
            <Chip key={p} label={`${p}%+`} selected={bMinP === p} onPress={() => setBMinP(p)} />
          ))}
        </View>
        <View style={s.builderSummary}>
          <Icon name={hard || probBlocksOdds || !builderPool.length ? 'warning-amber' : 'info-outline'} size={18} color={hard || probBlocksOdds || !builderPool.length ? C.amber : C.muted} />
          <Text style={[s.meta, { flex: 1 }]}>
            {probBlocksOdds
              ? `At ${bMinP}%+ probability the odds are at most about ${maxOddAtP.toFixed(2)}, below your minimum odd of ${bMinOdd.toFixed(2)}. Lower the minimum odd or the probability. `
              : ''}
            {builderPool.length} games fit. To reach {Number(bTotal.toFixed(2))} odds with {bCount} {bCount === 1 ? 'pick' : 'picks'}, each needs about {perPickNeeded.toFixed(2)} odds
            {capped && perPickNeeded <= bMaxOdd
              ? `, but at ${bMinP}%+ probability the highest odd available is ${poolMax.toFixed(2)}. Lower the minimum probability or add more matches to get closer.`
              : hard
                ? ', which is outside your odds range. The slip will get as close as it can.'
                : '.'}
          </Text>
        </View>
      </View>
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Button kind="secondary" icon="filter-alt-off" label="Clear filter" onPress={clearBuilder} />
        </View>
        <View style={{ width: 10 }} />
        <View style={{ flex: 1.3 }}>
          <Button icon="auto-awesome" label="Generate slip" onPress={generateSlip} />
        </View>
      </View>

      {bSlip && slipMatches.length ? (
        <View style={[s.slipHead, { marginTop: 18 }]}>
          <View style={[s.row, { justifyContent: 'space-between' }]}>
            <View>
              <Text style={s.eyebrow}>Your generated slip</Text>
              <Text style={s.cardTitle}>
                {slipMatches.length} {slipMatches.length === 1 ? 'pick' : 'picks'}
                {slipMatches.length < bCount ? ` (only ${slipMatches.length} fit)` : ''}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.totalOdds}>{total.toFixed(2)}</Text>
              <Text style={s.meta}>total odds · target {Number(bTotal.toFixed(2))}</Text>
            </View>
          </View>
          {slipMatches.map((m, i) => (
            <Pressable key={m.id} accessibilityRole="button" onPress={() => openMatch(m)} style={s.genRow}>
              <View style={s.slipNum}>
                <Text style={s.slipNumText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.inlineComp} numberOfLines={1}>
                  {COMPS[m.comp].name} · {m.status === 'live' ? `Live ${m.minute}′` : `${dayLabel(m.day)} ${m.time}`}
                </Text>
                <Text style={s.builderTeams} numberOfLines={1}>
                  {team(m.home).name} <Text style={{ color: C.faint }}>v</Text> {team(m.away).name}
                </Text>
                <Text style={s.pickLine} numberOfLines={1}>
                  {pickText(m)} <Text style={s.pickMarket}>· {m.pick.p}% estimate</Text>
                </Text>
              </View>
              <View style={s.oddPill}>
                <Text style={s.oddText}>{oddsFor(m).toFixed(2)}</Text>
              </View>
            </Pressable>
          ))}
          <Text style={[s.meta, { marginTop: 10 }]}>
            Odds are sample prices for this prototype. Total odds is a price, not your chance of winning, and we don't show a combined probability because results can be related.
          </Text>
        </View>
      ) : bSlip ? (
        <View style={[s.empty, { marginTop: 18 }]}>
          <Icon name="search-off" size={32} color={C.accent} />
          <Text style={s.emptyTitle}>No games fit these settings</Text>
          <Text style={s.emptyBody}>Lower the minimum probability, widen the odds range or pick both days.</Text>
        </View>
      ) : null}
    </>
    );
  };

  const renderFavourites = () => {
    const savedMatches = MATCHES.filter((m) => savedIds.includes(m.id));
    return (
      <>
        <Text style={s.pageTitle}>Favourites</Text>
        <View style={s.segment}>
          {(['Matches', 'Teams', 'Competitions'] as const).map((t) => (
            <Pressable key={t} accessibilityRole="tab" accessibilityState={{ selected: favSegment === t }} onPress={() => setFavSegment(t)} style={[s.segItem, favSegment === t && s.segItemOn]}>
              <Text style={[s.segText, favSegment === t && s.segTextOn]}>{t}</Text>
            </Pressable>
          ))}
        </View>
        {favSegment === 'Matches' ? (
          savedMatches.length ? (
            <>
              <Text style={s.resultText}>{savedMatches.length} saved · kick-off reminders {reminders ? 'on' : 'off'}</Text>
              {savedMatches.map((m) => renderMatchCard(m, { showDay: true }))}
            </>
          ) : (
            <View style={s.empty}>
              <Icon name="favorite-border" size={34} color={C.accent} />
              <Text style={s.emptyTitle}>No saved matches yet</Text>
              <Text style={s.emptyBody}>Tap the heart on any match to keep it here.</Text>
              <Button small kind="secondary" label="Browse matches" onPress={() => goTab('All matches')} />
            </View>
          )
        ) : favSegment === 'Teams' ? (
          <>
            <Text style={s.resultText}>Following {followTeams.length} teams · tap a team for stats</Text>
            {Object.keys(TEAMS)
              .sort((a, b) => Number(followTeams.includes(b)) - Number(followTeams.includes(a)))
              .map((id) => {
                const next = MATCHES.filter((m) => (m.home === id || m.away === id) && m.status !== 'finished').sort((a, b) => a.day - b.day)[0];
                const on = followTeams.includes(id);
                return (
                  <View key={id} style={s.listRow}>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${team(id).name}`} onPress={() => push({ name: 'team', id })} style={s.rowLink}>
                    <Crest id={id} size={34} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={s.listTitle}>{team(id).name}</Text>
                      <Text style={s.listSub} numberOfLines={1}>
                        {next ? `Next: ${dayLabel(next.day)} ${next.time} v ${team(next.home === id ? next.away : next.home).name}` : 'No upcoming sample fixture'}
                      </Text>
                    </View>
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel={on ? `Unfollow ${team(id).name}` : `Follow ${team(id).name}`} onPress={() => toggleTeam(id)} style={[s.followBtn, on && s.followBtnOn]}>
                      <Text style={[s.followText, on && { color: C.accent }]}>{on ? 'Following' : 'Follow'}</Text>
                    </Pressable>
                  </View>
                );
              })}
          </>
        ) : (
          <>
            <Text style={s.resultText}>Followed competitions appear first on Bankers</Text>
            {COMP_ORDER.map((c) => {
              const on = followComps.includes(c);
              return (
                <View key={c} style={s.listRow}>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Open ${COMPS[c].name}`} onPress={() => { setCompTab('Predictions'); push({ name: 'comp', id: c }); }} style={s.rowLink}>
                  <View style={s.flag}>
                    <Text style={s.flagText}>{COMPS[c].country.slice(0, 3).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.listTitle}>{COMPS[c].name}</Text>
                    <Text style={s.listSub}>{COMPS[c].country} · {MATCHES.filter((m) => m.comp === c && m.status !== 'finished').length} upcoming · tap for table</Text>
                  </View>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={() => toggleComp(c)} style={[s.followBtn, on && s.followBtnOn]}>
                    <Text style={[s.followText, on && { color: C.accent }]}>{on ? 'Following' : 'Follow'}</Text>
                  </Pressable>
                </View>
              );
            })}
          </>
        )}
      </>
    );
  };

  const settingRow = (icon: IconName, title: string, sub: string, onPress?: () => void, right?: React.ReactNode) => (
    <Pressable key={title} accessibilityRole={onPress ? 'button' : undefined} disabled={!onPress} onPress={onPress} style={s.settingRow}>
      <View style={s.settingIcon}>
        <Icon name={icon} size={20} color={C.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.listTitle}>{title}</Text>
        <Text style={s.listSub}>{sub}</Text>
      </View>
      {right ?? <Icon name="chevron-right" size={22} color={C.faint} />}
    </Pressable>
  );

  const renderAccount = () => (
    <>
      <Text style={s.pageTitle}>Account</Text>
      <View style={s.profile}>
        <View style={s.avatar}>
          <Icon name="person" size={26} color={C.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{user ? user.name : 'Guest'}</Text>
          <Text style={s.body}>{user ? user.email : 'Sign in to keep favourites across devices.'}</Text>
        </View>
        {user ? (
          <Button small kind="secondary" label="Sign out" onPress={() => { setUser(null); showToast('Signed out'); }} />
        ) : (
          <Button small kind="secondary" label="Sign in" onPress={() => { setAuthMode('signin'); setAuthReturn(true); setOnboardStep(1); setOnboarded(false); }} />
        )}
      </View>
      <Pressable accessibilityRole="button" onPress={() => push({ name: 'premium' })} style={s.plusCard}>
        <View style={s.plusPill}>
          <Text style={s.plusPillText}>ODDLYTICS PLUS</Text>
        </View>
        <Text style={s.plusTitle}>{isPlus ? 'You are previewing Plus' : 'Go deeper into the game'}</Text>
        <Text style={s.body}>Every insight, all markets per match, longer history and alerts for the teams you follow.</Text>
        <View style={[s.linkWrap, { marginTop: 12 }]}>
          <Text style={s.link}>{isPlus ? 'Manage plan' : 'See plans and prices'}</Text>
          <Icon name="arrow-forward" size={16} color={C.accent} />
        </View>
      </Pressable>
      <Text style={s.groupLabel}>Preferences</Text>
      <View style={s.settings}>
        {settingRow('schedule', 'Time zone', 'Africa/Lagos (WAT) · kick-offs shown in local time', () => showToast('Time zone changes come with sign-in'))}
        {settingRow('notifications-none', 'Match alerts', notify ? 'On for followed teams' : 'Off', undefined, <Switch value={notify} onValueChange={setNotify} trackColor={{ true: C.accent, false: C.raised }} thumbColor="#fff" />)}
        {settingRow('alarm', 'Kick-off reminders', 'For saved matches, 30 min before', undefined, <Switch value={reminders} onValueChange={setReminders} trackColor={{ true: C.accent, false: C.raised }} thumbColor="#fff" />)}
        {settingRow('language', 'Language', 'English')}
      </View>
      <Text style={s.groupLabel}>Trust and safety</Text>
      <View style={s.settings}>
        {settingRow('insights', 'Track record', 'Every settled pick, including losses', () => push({ name: 'record' }))}
        {settingRow('lightbulb-outline', 'How Oddlytics works', 'Data, model versions and limits', () => push({ name: 'page', page: 'how' }))}
        {settingRow('volunteer-activism', 'Play responsibly', '18+ · tools and support', () => push({ name: 'page', page: 'responsible' }))}
        {settingRow('lock-outline', 'Privacy and data', 'What we store and your choices', () => push({ name: 'page', page: 'privacy' }))}
        {settingRow('help-outline', 'Help', 'Betting terms and FAQs', () => push({ name: 'page', page: 'help' }))}
      </View>
      <Text style={s.groupLabel}>Prototype controls</Text>
      <View style={s.settings}>
        {settingRow('workspace-premium', 'Preview as Plus member', 'Unlocks premium insights in this demo', undefined, <Switch value={isPlus} onValueChange={setIsPlus} trackColor={{ true: C.accent, false: C.raised }} thumbColor="#fff" />)}
        {settingRow('replay', 'Replay welcome', 'See the first-run screens again', () => { setOnboardStep(0); setAgeOk(false); setOnboarded(false); })}
      </View>
      <Text style={s.foot}>Oddlytics gives football information and probability estimates. It does not take bets. 18+ only. Availability depends on local rules. Version 0.2 prototype · sample data.</Text>
    </>
  );

  /* ---------- pushed screens ---------- */

  const renderDetail = (m: Match) => {
    const isLocked = locked(m);
    const result = settle(m);
    const comp = COMPS[m.comp];
    const H = team(m.home);
    const A = team(m.away);
    const showResult = m.status === 'finished' && detailMode === 'Result';
    const tabs = ['Overview', 'Predictions', 'Stats', 'Standings', 'Form & H2H', 'Lineups'];
    const statRows: [string, number, number, string?][] = [
      ['Goals scored / match', seeded(m.home + 'g', 0.9, 2.4, 1), seeded(m.away + 'g', 0.8, 2.1, 1)],
      ['Goals conceded / match', seeded(m.home + 'c', 0.5, 1.6, 1), seeded(m.away + 'c', 0.6, 1.8, 1)],
      ['Shots / match', seeded(m.home + 's', 9, 18, 1), seeded(m.away + 's', 8, 16, 1)],
      ['Shots on target / match', seeded(m.home + 't', 3, 7, 1), seeded(m.away + 't', 2.5, 6, 1)],
      ['Corners / match', seeded(m.home + 'k', 3.5, 7.5, 1), seeded(m.away + 'k', 3, 7, 1)],
      ['Possession', seeded(m.home + 'p', 42, 62), seeded(m.away + 'p', 40, 58), '%'],
    ];
    return (
      <>
        <View style={s.detailMeta}>
          <Text style={s.eyebrow}>{comp.name} · 2026/27</Text>
          <Text style={s.meta}>
            {longDate(m.day)} · {m.time} WAT
          </Text>
        </View>
        <View style={s.matchup}>
          <Pressable accessibilityRole="button" accessibilityLabel={`${H.name}. ${followTeams.includes(m.home) ? 'Following' : 'Follow'}`} onPress={() => toggleTeam(m.home)} style={s.matchupTeam}>
            <Crest id={m.home} size={56} />
            <Text style={s.matchupName}>{H.name}</Text>
            <Text style={s.matchupFollow}>{followTeams.includes(m.home) ? '★ Following' : '☆ Follow'}</Text>
          </Pressable>
          <View style={s.matchupCenter}>
            {m.score ? (
              <Text style={[s.bigScore, m.status === 'live' && { color: C.live }]}>
                {m.score[0]} – {m.score[1]}
              </Text>
            ) : (
              <Text style={s.bigTime}>{m.time}</Text>
            )}
            {m.status === 'live' ? (
              <View style={s.liveRow}>
                <LivePulse />
                <Text style={s.liveText}>LIVE {m.minute}′</Text>
              </View>
            ) : (
              <Text style={s.meta}>{m.status === 'finished' ? 'Full time' : dayLabel(m.day)}</Text>
            )}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={`${A.name}. ${followTeams.includes(m.away) ? 'Following' : 'Follow'}`} onPress={() => toggleTeam(m.away)} style={s.matchupTeam}>
            <Crest id={m.away} size={56} />
            <Text style={s.matchupName}>{A.name}</Text>
            <Text style={s.matchupFollow}>{followTeams.includes(m.away) ? '★ Following' : '☆ Follow'}</Text>
          </Pressable>
        </View>

        {m.status === 'finished' ? (
          <View style={[s.segment, { marginBottom: 12 }]}>
            {(['Result', 'Preview'] as const).map((t) => (
              <Pressable key={t} accessibilityRole="button" accessibilityState={{ selected: detailMode === t }} onPress={() => setDetailMode(t)} style={[s.segItem, detailMode === t && s.segItemOn]}>
                <Text style={[s.segText, detailMode === t && s.segTextOn]}>{t === 'Result' ? 'Result & settlement' : 'Pre-match preview'}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {(() => {
          const est = (
          <View style={s.estimate}>
            {showResult && result ? (
              <View style={[s.settleBox, { borderColor: result === 'won' ? C.won : C.lost }]}>
                <ResultBadge result={result} />
                <Text style={s.settleText}>
                  Final score {m.score?.join('–')}. The pick “{pickText(m)}” is {result === 'won' ? 'settled as correct' : 'settled as missed'} under our {MARKET_NAME[m.pick.market].toLowerCase()} rules.
                </Text>
              </View>
            ) : null}
            <Text style={s.eyebrow}>{showResult ? 'Prediction as published' : 'Oddlytics estimate'}</Text>
            <Text style={s.estimatePick}>{pickText(m)}</Text>
            <View style={s.estimateRow}>
              <Text style={s.estimatePct}>{m.pick.p}%</Text>
              <Text style={s.estimateNote}>
                chance in our model.{'\n'}Probability, not certainty.
              </Text>
            </View>
            <Text style={s.fieldLabel}>Match result</Text>
            <ProbBar parts={m.x} labels={[H.short, 'Draw', A.short]} />
            <View style={s.metaGrid}>
              <Text style={s.meta}>Market: {MARKET_NAME[m.pick.market]}</Text>
              <Text style={s.meta}>Model: baseline-0.1</Text>
              <Text style={s.meta}>Published: {dayLabel(m.day - 1)} 09:00</Text>
              <Text style={s.meta}>{m.status === 'finished' ? 'Locked at kick-off' : `Updated ${ago(m.updated)}`}</Text>
            </View>
          </View>
          );
          return isLocked ? (
            <Glass
              radius={18}
              style={{ marginBottom: 12 }}
              overlay={
                <View style={s.lockOverlay}>
                  <View style={s.lockIcon}>
                    <Icon name="lock" size={24} color={C.accent} />
                  </View>
                  <Text style={[s.cardTitle, { textAlign: 'center' }]}>This insight is part of Plus</Text>
                  <Text style={[s.body, { textAlign: 'center' }]}>Unlock the pick, its probability and the reasoning. Stats and form below stay free.</Text>
                  <Button small label="See plans" onPress={() => push({ name: 'premium' })} />
                </View>
              }
            >
              {est}
            </Glass>
          ) : (
            est
          );
        })()}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll} contentContainerStyle={s.tabs}>
          {tabs.map((t) => (
            <Pressable key={t} accessibilityRole="tab" accessibilityState={{ selected: detailTab === t }} onPress={() => setDetailTab(t)} style={[s.tab, detailTab === t && s.tabOn]}>
              <Text style={[s.tabText, detailTab === t && s.tabTextOn]}>{t}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {detailTab === 'Overview' ? (
          <>
            <View style={s.panel}>
              <Text style={s.eyebrow}>Why this estimate</Text>
              <Text style={s.body}>{isLocked ? 'Unlock Plus to read the reasoning for this pick.' : m.reason}</Text>
              <View style={s.evidence}>
                {[
                  [`${H.name} form`, form(m.home).join(' ')],
                  [`${A.name} form`, form(m.away).join(' ')],
                  ['Goals expected', `${seeded(m.id + 'xg', 2.1, 3.1, 1)} in total`],
                ].map(([k, v]) => (
                  <View key={k} style={s.evidenceRow}>
                    <Text style={s.listSub}>{k}</Text>
                    <Text style={s.evidenceValue}>{v}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Button kind="secondary" icon={savedIds.includes(m.id) ? 'favorite' : 'favorite-border'} label={savedIds.includes(m.id) ? 'Saved' : 'Save'} onPress={() => toggleSaved(m)} />
              </View>
              <View style={{ width: 10 }} />
              <View style={{ flex: 1 }}>
                <Button kind="secondary" icon="star-outline" label="League page" onPress={() => { setCompTab('Predictions'); push({ name: 'comp', id: m.comp }); }} />
              </View>
            </View>
          </>
        ) : null}

        {detailTab === 'Predictions' ? (
          (() => {
            const panel = (
            <View style={s.panel}>
              {[
                ['Match result', [[`${H.short} win`, m.x[0]], ['Draw', m.x[1]], [`${A.short} win`, m.x[2]]]],
                ['Double chance', [[`${H.short} or draw`, m.x[0] + m.x[1]], [`${A.short} or draw`, m.x[1] + m.x[2]]]],
                ['Total goals 1.5', [['Over 1.5', o15(m)], ['Under 1.5', 100 - o15(m)]]],
                ['Total goals 2.5', [['Over 2.5', m.o25], ['Under 2.5', 100 - m.o25]]],
                ['Total goals 3.5', [['Over 3.5', o35(m)], ['Under 3.5', 100 - o35(m)]]],
                ['Both teams to score', [['Yes', m.btts], ['No', 100 - m.btts]]],
              ].map(([title, rows]) => (
                <View key={title as string} style={s.marketBlock}>
                  <Text style={s.fieldLabel}>{title as string}</Text>
                  {(rows as [string, number][]).map(([label, p]) => (
                    <View key={label} style={s.marketRow}>
                      <Text style={s.marketLabel}>{label}</Text>
                      <View style={s.marketTrack}>
                        <View style={[s.marketFill, { width: `${p}%` }]} />
                      </View>
                      <Text style={s.marketPct}>{p}%</Text>
                    </View>
                  ))}
                </View>
              ))}
              <Text style={s.meta}>Within each market the outcomes add up to 100%. Double chance outcomes overlap, so they don't.</Text>
            </View>
            );
            return isLocked ? (
              <Glass
                radius={16}
                style={{ marginBottom: 12 }}
                overlay={
                  <View style={s.lockOverlay}>
                    <View style={s.lockIcon}>
                      <Icon name="lock" size={24} color={C.accent} />
                    </View>
                    <Text style={[s.cardTitle, { textAlign: 'center' }]}>All-market predictions are part of Plus</Text>
                    <Button small label="See plans" onPress={() => push({ name: 'premium' })} />
                  </View>
                }
              >
                {panel}
              </Glass>
            ) : (
              panel
            );
          })()
        ) : null}

        {detailTab === 'Stats' ? (
          <View style={s.panel}>
            <View style={s.statHead}>
              <Crest id={m.home} size={22} />
              <Text style={s.eyebrow}>Season averages · observed</Text>
              <Crest id={m.away} size={22} />
            </View>
            {statRows.map(([label, hv, av, unit]) => {
              const max = Math.max(hv, av) || 1;
              return (
                <View key={label} style={s.statRow}>
                  <View style={s.statNums}>
                    <Text style={[s.statNum, hv >= av && { color: C.text }]}>
                      {hv}
                      {unit ?? ''}
                    </Text>
                    <Text style={s.statLabel}>{label}</Text>
                    <Text style={[s.statNum, av >= hv && { color: C.text }]}>
                      {av}
                      {unit ?? ''}
                    </Text>
                  </View>
                  <View style={s.statBars}>
                    <View style={s.statTrackL}>
                      <View style={[s.statFillL, { width: `${(hv / max) * 100}%` }]} />
                    </View>
                    <View style={s.statTrackR}>
                      <View style={[s.statFillR, { width: `${(av / max) * 100}%` }]} />
                    </View>
                  </View>
                </View>
              );
            })}
            {comp.xg ? (
              <View style={s.statRow}>
                <View style={s.statNums}>
                  <Text style={s.statNum}>{seeded(m.home + 'x', 1.1, 2.2, 2)}</Text>
                  <Text style={s.statLabel}>xG / match</Text>
                  <Text style={s.statNum}>{seeded(m.away + 'x', 0.9, 2, 2)}</Text>
                </View>
              </View>
            ) : (
              <Notice text={`Expected goals (xG) is not available for ${comp.name}. We hide it rather than show zero.`} />
            )}
            <Text style={s.meta}>Sample values for this prototype.</Text>
          </View>
        ) : null}

        {detailTab === 'Standings' ? (
          (() => {
            const pair = [m.home, m.away];
            const main = standings(m.comp);
            const both = pair.every((id) => main.some((r) => r.id === id));
            const tables: { title: string; rows: Row[]; all: Row[] }[] = both
              ? [{ title: comp.name, rows: main, all: main }]
              : pair.map((id) => {
                  const all = standings(teamComp(id));
                  const i = all.findIndex((r) => r.id === id);
                  const from = Math.max(0, Math.min(i - 2, all.length - 5));
                  return { title: `${team(id).name} · ${COMPS[teamComp(id)].name}`, rows: all.slice(from, from + 5), all };
                });
            const posOf = (id: string, all: Row[]) => all.findIndex((r) => r.id === id) + 1;
            return (
              <>
                <View style={s.metrics}>
                  {pair.map((id) => {
                    const t = tables.find((x) => x.all.some((r) => r.id === id))!;
                    const r = t.all.find((x) => x.id === id)!;
                    return (
                      <View key={id} style={s.metric}>
                        <Text style={s.metricValue}>{posOf(id, t.all)}{['st', 'nd', 'rd'][posOf(id, t.all) - 1] ?? 'th'}</Text>
                        <Text style={s.metricLabel} numberOfLines={1}>{team(id).name} · {r.pts} pts</Text>
                      </View>
                    );
                  })}
                </View>
                {tables.map((t) => (
                  <View key={t.title} style={[s.panel, { marginTop: 12 }]}>
                    <Text style={[s.listSub, { marginBottom: 8 }]}>{t.title}</Text>
                    <View style={s.tableRow}>
                      <Text style={[s.tableHead, s.cPos]}>#</Text>
                      <Text style={[s.tableHead, { flex: 1 }]}>Team</Text>
                      {['P', 'W', 'D', 'L', 'GD', 'Pts'].map((h) => (
                        <Text key={h} style={[s.tableHead, s.cNum]}>{h}</Text>
                      ))}
                    </View>
                    {t.rows.map((r) => {
                      const hl = pair.includes(r.id);
                      const pos = posOf(r.id, t.all);
                      return (
                        <Pressable key={r.id} accessibilityRole="button" accessibilityLabel={`${pos}, ${team(r.id).name}, ${r.pts} points`} onPress={() => push({ name: 'team', id: r.id })} style={[s.tableRow, hl && { backgroundColor: C.accentSoft, borderRadius: 8 }]}>
                          <Text style={[s.tableCell, s.cPos, hl && { color: C.accent, fontWeight: '800' }]}>{pos}</Text>
                          <View style={[s.row, { flex: 1, gap: 8 }]}>
                            <Crest id={r.id} size={20} />
                            <Text style={[s.tableCell, { flex: 1 }, hl && { fontWeight: '800' }]} numberOfLines={1}>{team(r.id).name}</Text>
                          </View>
                          {[r.p, r.w, r.d, r.l, r.gf - r.ga, r.pts].map((v, k) => (
                            <Text key={k} style={[s.tableCell, s.cNum, k === 5 && { fontWeight: '800' }]}>{k === 4 && v > 0 ? `+${v}` : v}</Text>
                          ))}
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
                <Text style={[s.meta, { marginTop: 10 }]}>Both teams highlighted. Tap a team for its stats. Sample table.</Text>
              </>
            );
          })()
        ) : null}

        {detailTab === 'Form & H2H' ? (
          <>
            {[m.home, m.away].map((id) => (
              <View key={id} style={s.panel}>
                <View style={s.teamLine}>
                  <Crest id={id} size={22} />
                  <Text style={s.listTitle}>{team(id).name} · last 5</Text>
                </View>
                <View style={s.formRow}>
                  {form(id).map((r, i) => (
                    <View key={i} style={s.formItem}>
                      <View style={[s.formChip, { backgroundColor: r === 'W' ? C.wonSoft : r === 'L' ? C.lostSoft : C.raised }]}>
                        <Text style={[s.formText, { color: r === 'W' ? C.won : r === 'L' ? C.lost : C.soft }]}>{r}</Text>
                      </View>
                      <Text style={s.formDate}>{dateFor(-7 * (5 - i)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Text>
                      <Text style={s.formDate}>{hash(id + i) % 2 ? 'H' : 'A'}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
            <View style={s.panel}>
              <Text style={s.eyebrow}>Head to head · last 6 meetings · 2022–2026</Text>
              <View style={s.h2h}>
                {[
                  [H.short, 2 + (hash(m.id) % 2)],
                  ['Draws', 1 + (hash(m.id + 'd') % 2)],
                  [A.short, 6 - 2 - (hash(m.id) % 2) - 1 - (hash(m.id + 'd') % 2)],
                ].map(([k, v]) => (
                  <View key={k as string} style={s.h2hItem}>
                    <Text style={s.h2hValue}>{v}</Text>
                    <Text style={s.listSub}>{k}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.meta}>A sample of 6 is small. Treat head-to-head as context, not evidence.</Text>
            </View>
          </>
        ) : null}

        {detailTab === 'Lineups' ? (
          <Notice
            icon="groups"
            text={
              comp.lineups
                ? m.status === 'upcoming'
                  ? 'Confirmed lineups usually appear about an hour before kick-off.'
                  : 'Lineups will appear here when the data source is connected.'
                : `Lineups are not available for ${comp.name}.`
            }
          />
        ) : null}

        <Notice tone="caution" text="This estimate expresses uncertainty. It is not a guarantee, a betting instruction or a promise of profit." />
      </>
    );
  };

  const renderTeam = (id: string) => {
    const t = team(id);
    const comp = teamComp(id);
    const table = standings(comp);
    const row = table.find((r) => r.id === id)!;
    const pos = table.indexOf(row) + 1;
    const games = MATCHES.filter((m) => m.home === id || m.away === id);
    const upcoming = games.filter((m) => m.status !== 'finished').sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
    const recent = games.filter((m) => m.status === 'finished').sort((a, b) => b.day - a.day);
    const on = followTeams.includes(id);
    const stats: [string, string][] = [
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
    return (
      <>
        <View style={s.teamHero}>
          <Crest id={id} size={72} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={s.teamHeroName}>{t.name}</Text>
            <Pressable accessibilityRole="button" onPress={() => { setCompTab('Standings'); push({ name: 'comp', id: comp }); }}>
              <Text style={s.link}>
                {COMPS[comp].name} · {pos}
                {pos === 1 ? 'st' : pos === 2 ? 'nd' : pos === 3 ? 'rd' : 'th'} · {row.pts} pts
              </Text>
            </Pressable>
          </View>
        </View>
        <Button kind={on ? 'secondary' : 'primary'} icon={on ? 'star' : 'star-outline'} label={on ? 'Following' : 'Follow team'} onPress={() => toggleTeam(id)} />
        <SectionHead title="Form" sub="Last 5, most recent on the right" />
        <View style={s.panel}>
          <View style={s.formRow}>
            {row.form.map((r, i) => (
              <View key={i} style={s.formItem}>
                <View style={[s.formChip, { backgroundColor: r === 'W' ? C.wonSoft : r === 'L' ? C.lostSoft : C.raised }]}>
                  <Text style={[s.formText, { color: r === 'W' ? C.won : r === 'L' ? C.lost : C.soft }]}>{r}</Text>
                </View>
                <Text style={s.formDate}>{dateFor(-7 * (5 - i)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Text>
              </View>
            ))}
          </View>
        </View>
        <SectionHead title="League standing" sub={`${COMPS[comp].name} · ${pos}${pos === 1 ? 'st' : pos === 2 ? 'nd' : pos === 3 ? 'rd' : 'th'} of ${table.length}`} action="Full table" onAction={() => { setCompTab('Standings'); push({ name: 'comp', id: comp }); }} />
        <View style={s.panel}>
          <View style={s.tableRow}>
            <Text style={[s.tableHead, s.cPos]}>#</Text>
            <Text style={[s.tableHead, { flex: 1 }]}>Team</Text>
            {['P', 'W', 'D', 'L', 'GD', 'Pts'].map((h) => (
              <Text key={h} style={[s.tableHead, s.cNum]}>
                {h}
              </Text>
            ))}
          </View>
          {table
            .map((r, i) => ({ r, i }))
            .filter(({ i }) => Math.abs(i - (pos - 1)) <= 2 || (pos <= 3 && i < 5) || (pos > table.length - 3 && i >= table.length - 5))
            .map(({ r, i }) => (
              <Pressable key={r.id} accessibilityRole="button" disabled={r.id === id} onPress={() => push({ name: 'team', id: r.id })} style={[s.tableRow, r.id === id && { backgroundColor: C.accentSoft }]}>
                <Text style={[s.tableCell, s.cPos, r.id === id && { color: C.accent, fontWeight: '800' }]}>{i + 1}</Text>
                <View style={[s.row, { flex: 1, gap: 8 }]}>
                  <Crest id={r.id} size={20} />
                  <Text style={[s.tableCell, { flex: 1 }, r.id === id && { fontWeight: '800' }]} numberOfLines={1}>
                    {team(r.id).name}
                  </Text>
                </View>
                {[r.p, r.w, r.d, r.l, r.gf - r.ga, r.pts].map((v, k) => (
                  <Text key={k} style={[s.tableCell, s.cNum, k === 5 && { fontWeight: '800' }]}>
                    {k === 4 && v > 0 ? `+${v}` : v}
                  </Text>
                ))}
              </Pressable>
            ))}
        </View>
        <SectionHead title="Season stats" sub={`${COMPS[comp].name} 2026/27 · sample`} />
        <View style={s.panel}>
          {stats.map(([k, v]) => (
            <View key={k} style={s.kvRow}>
              <Text style={s.listSub}>{k}</Text>
              <Text style={s.kvValue}>{v}</Text>
            </View>
          ))}
        </View>
        {upcoming.length ? (
          <>
            <SectionHead title="Upcoming and predictions" />
            {upcoming.map((m) => renderMatchCard(m, { showDay: true }))}
          </>
        ) : null}
        {recent.length ? (
          <>
            <SectionHead title="Recent results" sub="With our pick as published" />
            {recent.map((m) => renderMatchCard(m, { showDay: true }))}
          </>
        ) : null}
      </>
    );
  };

  const renderComp = (c: CompId) => {
    const comp = COMPS[c];
    const table = standings(c);
    const games = MATCHES.filter((m) => m.comp === c);
    const upcoming = games.filter((m) => m.status !== 'finished').sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
    const finished = games.filter((m) => m.status === 'finished');
    const correct = finished.filter((m) => settle(m) === 'won').length;
    const on = followComps.includes(c);
    const totalGoals = table.reduce((a, r) => a + r.gf, 0);
    const totalGames = table.reduce((a, r) => a + r.p, 0) / 2;
    return (
      <>
        <View style={s.teamHero}>
          <View style={[s.flag, { width: 64, height: 48, borderRadius: 12 }]}>
            <Text style={[s.flagText, { fontSize: 15 }]}>{comp.country.slice(0, 3).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={s.teamHeroName}>{comp.name}</Text>
            <Text style={s.listSub}>{comp.country} · 2026/27 season</Text>
          </View>
        </View>
        <Button kind={on ? 'secondary' : 'primary'} icon={on ? 'star' : 'star-outline'} label={on ? 'Following' : 'Follow league'} onPress={() => toggleComp(c)} />
        <View style={[s.segment, { marginTop: 14 }]}>
          {(['Predictions', 'Standings', 'Season stats'] as const).map((t) => (
            <Pressable key={t} accessibilityRole="tab" accessibilityState={{ selected: compTab === t }} onPress={() => setCompTab(t)} style={[s.segItem, compTab === t && s.segItemOn]}>
              <Text style={[s.segText, compTab === t && s.segTextOn]}>{t}</Text>
            </Pressable>
          ))}
        </View>
        {compTab === 'Predictions' ? (
          upcoming.length ? (
            <>
              {[...new Set(upcoming.map((m) => m.day))].map((d) => (
                <View key={d}>
                  <Text style={s.groupLabel}>{longDate(d)}</Text>
                  {upcoming.filter((m) => m.day === d).map((m) => renderMatchCard(m))}
                </View>
              ))}
              {finished.length ? (
                <Notice icon="fact-check" text={`Recent record in ${comp.name}: ${correct} of ${finished.length} top picks correct in the last 3 days (sample).`} />
              ) : null}
            </>
          ) : (
            <Notice text="No upcoming fixtures in the sample data." />
          )
        ) : compTab === 'Standings' ? (
          <View style={s.panel}>
            <View style={s.tableRow}>
              <Text style={[s.tableHead, s.cPos]}>#</Text>
              <Text style={[s.tableHead, { flex: 1 }]}>Team</Text>
              {['P', 'W', 'D', 'L', 'GD', 'Pts'].map((h) => (
                <Text key={h} style={[s.tableHead, s.cNum]}>
                  {h}
                </Text>
              ))}
            </View>
            {table.map((r, i) => (
              <Pressable key={r.id} accessibilityRole="button" accessibilityLabel={`${i + 1}, ${team(r.id).name}, ${r.pts} points`} onPress={() => push({ name: 'team', id: r.id })} style={[s.tableRow, followTeams.includes(r.id) && { backgroundColor: C.accentSoft }]}>
                <Text style={[s.tableCell, s.cPos, i < 4 && { color: C.accent, fontWeight: '800' }]}>{i + 1}</Text>
                <View style={[s.row, { flex: 1, gap: 8 }]}>
                  <Crest id={r.id} size={20} />
                  <Text style={[s.tableCell, { flex: 1 }]} numberOfLines={1}>
                    {team(r.id).name}
                  </Text>
                </View>
                {[r.p, r.w, r.d, r.l, r.gf - r.ga, r.pts].map((v, k) => (
                  <Text key={k} style={[s.tableCell, s.cNum, k === 5 && { fontWeight: '800' }]}>
                    {k === 4 && v > 0 ? `+${v}` : v}
                  </Text>
                ))}
              </Pressable>
            ))}
            <Text style={[s.meta, { marginTop: 10 }]}>Top 4 highlighted. Tap a team for its stats. Sample table.</Text>
          </View>
        ) : (
          <>
            <View style={s.metrics}>
              <View style={s.metric}>
                <Text style={s.metricValue}>{(totalGoals / totalGames).toFixed(2)}</Text>
                <Text style={s.metricLabel}>Goals per game</Text>
              </View>
              <View style={s.metric}>
                <Text style={s.metricValue}>{seeded(c + 'hw', 40, 50)}%</Text>
                <Text style={s.metricLabel}>Home wins</Text>
              </View>
            </View>
            <View style={s.panel}>
              {(
                [
                  ['Draws', `${seeded(c + 'dr', 22, 31)}%`],
                  ['Away wins', `${seeded(c + 'aw', 24, 33)}%`],
                  ['Both teams scored', `${seeded(c + 'bt', 42, 58)}%`],
                  ['Over 2.5 goals', `${seeded(c + 'o', 40, 60)}%`],
                  ['Clean sheets per team', `${seeded(c + 'cs', 2, 5, 1)}`],
                  ['Best attack', `${team([...table].sort((a, b) => b.gf - a.gf)[0].id).name} · ${[...table].sort((a, b) => b.gf - a.gf)[0].gf} goals`],
                  ['Best defence', `${team([...table].sort((a, b) => a.ga - b.ga)[0].id).name} · ${[...table].sort((a, b) => a.ga - b.ga)[0].ga} conceded`],
                ] as [string, string][]
              ).map(([k, v]) => (
                <View key={k} style={s.kvRow}>
                  <Text style={s.listSub}>{k}</Text>
                  <Text style={s.kvValue}>{v}</Text>
                </View>
              ))}
            </View>
            <Text style={s.meta}>Season to date, sample figures.</Text>
          </>
        )}
      </>
    );
  };

  const renderRecord = () => {
    const data = {
      '30 days': { n: 118, w: 66, brier: '0.209', base: '0.228', range: '26 Oct – 24 Nov 2026', months: [['Oct', 14, 11], ['Nov', 52, 41]] },
      '90 days': { n: 412, w: 225, brier: '0.214', base: '0.231', range: '1 Aug – 24 Nov 2026', months: [['Aug', 49, 38], ['Sep', 61, 47], ['Oct', 63, 58], ['Nov', 52, 44]] },
      'All time': { n: 1206, w: 641, brier: '0.218', base: '0.233', range: '3 Jan – 24 Nov 2026', months: [['Q1', 141, 129], ['Q2', 158, 137], ['Q3', 171, 150], ['Q4', 171, 149]] },
    }[recordRange];
    const pct = ((data.w / data.n) * 100).toFixed(1);
    const maxTotal = Math.max(...data.months.map(([, w, l]) => Number(w) + Number(l)));
    const settled = MATCHES.filter((m) => m.status === 'finished').sort((a, b) => b.day - a.day);
    return (
      <>
        <Text style={s.pageTitle}>Track record</Text>
        <Text style={s.lead}>Every published top pick, settled against fixed rules. Losses, voids and postponements stay in. Sample figures.</Text>
        <View style={s.segment}>
          {(['30 days', '90 days', 'All time'] as const).map((r) => (
            <Pressable key={r} accessibilityRole="button" accessibilityState={{ selected: recordRange === r }} onPress={() => setRecordRange(r)} style={[s.segItem, recordRange === r && s.segItemOn]}>
              <Text style={[s.segText, recordRange === r && s.segTextOn]}>{r}</Text>
            </Pressable>
          ))}
        </View>
        <View style={s.metrics}>
          <View style={s.metric}>
            <Text style={s.metricValue}>{pct}%</Text>
            <Text style={s.metricLabel}>Top picks correct</Text>
            <Text style={s.metricSub}>
              {data.w} of {data.n} settled
            </Text>
          </View>
          <View style={s.metric}>
            <Text style={s.metricValue}>{data.brier}</Text>
            <Text style={s.metricLabel}>Brier score</Text>
            <Text style={s.metricSub}>Lower is better · baseline {data.base}</Text>
          </View>
        </View>
        <Text style={[s.meta, { marginBottom: 14 }]}>Period: {data.range}. A correct-pick rate is not profit: it ignores prices and stakes.</Text>
        <View style={s.panel}>
          <View style={[s.row, { justifyContent: 'space-between', marginBottom: 8 }]}>
            <Text style={[s.cardTitle, { marginBottom: 0 }]}>Settled by period</Text>
            <Pressable accessibilityRole="button" onPress={() => setRecordTable(!recordTable)} style={s.linkWrap}>
              <Icon name={recordTable ? 'bar-chart' : 'table-rows'} size={16} color={C.accent} />
              <Text style={s.link}>{recordTable ? 'Show chart' : 'Show table'}</Text>
            </Pressable>
          </View>
          {recordTable ? (
            <View>
              <View style={s.tableRow}>
                {['Period', 'Correct', 'Missed', 'Rate'].map((h) => (
                  <Text key={h} style={[s.tableHead, h !== 'Period' && s.tableNum]}>
                    {h}
                  </Text>
                ))}
              </View>
              {data.months.map(([mo, w, l]) => (
                <View key={mo as string} style={s.tableRow}>
                  <Text style={s.tableCell}>{mo}</Text>
                  <Text style={[s.tableCell, s.tableNum]}>{w}</Text>
                  <Text style={[s.tableCell, s.tableNum]}>{l}</Text>
                  <Text style={[s.tableCell, s.tableNum]}>{((Number(w) / (Number(w) + Number(l))) * 100).toFixed(0)}%</Text>
                </View>
              ))}
            </View>
          ) : (
            <>
              {data.months.map(([mo, w, l]) => (
                <View key={mo as string} style={s.barRow} accessibilityLabel={`${mo}: ${w} correct, ${l} missed`}>
                  <Text style={s.barLabel}>{mo}</Text>
                  <View style={s.barTrack}>
                    <View style={{ width: `${(Number(w) / maxTotal) * 100}%`, backgroundColor: C.accent, height: '100%' }} />
                    <View style={{ width: `${(Number(l) / maxTotal) * 100}%`, backgroundColor: '#5D5F6B', height: '100%' }} />
                  </View>
                  <Text style={s.barCount}>{Number(w) + Number(l)}</Text>
                </View>
              ))}
              <View style={s.legend}>
                <View style={[s.legendSwatch, { backgroundColor: C.accent }]} />
                <Text style={s.meta}>Correct</Text>
                <View style={[s.legendSwatch, { backgroundColor: '#5D5F6B', marginLeft: 14 }]} />
                <Text style={s.meta}>Missed</Text>
              </View>
            </>
          )}
        </View>
        <View style={s.panel}>
          <Text style={s.cardTitle}>By market</Text>
          {[
            ['Match result', 54, 168],
            ['Double chance', 71, 64],
            ['Total goals', 56, 121],
            ['Both teams to score', 52, 59],
          ].map(([k, r, n]) => (
            <View key={k as string} style={s.marketRow}>
              <Text style={[s.marketLabel, { width: 130 }]}>{k}</Text>
              <View style={s.marketTrack}>
                <View style={[s.marketFill, { width: `${Number(r)}%` }]} />
              </View>
              <Text style={[s.marketPct, { width: 76 }]}>
                {r}% <Text style={s.meta}>n={n}</Text>
              </Text>
            </View>
          ))}
          <Text style={s.meta}>Double chance hits more often because it covers two outcomes. Compare each market with its own baseline.</Text>
        </View>
        <SectionHead title="Recently settled" sub="Shown exactly as published" />
        {settled.map((m) => renderMatchCard(m, { showDay: true }))}
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: rulesOpen }} onPress={() => setRulesOpen(!rulesOpen)} style={s.settingRow}>
          <View style={s.settingIcon}>
            <Icon name="gavel" size={20} color={C.accent} />
          </View>
          <Text style={[s.listTitle, { flex: 1 }]}>Settlement rules</Text>
          <Icon name={rulesOpen ? 'expand-less' : 'expand-more'} size={22} color={C.muted} />
        </Pressable>
        {rulesOpen ? (
          <View style={s.panel}>
            {[
              'Picks are locked at kick-off and never edited afterwards.',
              'Results use the score after 90 minutes plus stoppage time. Extra time and penalties do not count.',
              'Postponed or abandoned matches are void and listed, not removed.',
              'Each pick keeps the model version and data snapshot it was published with.',
            ].map((r) => (
              <View key={r} style={s.bullet}>
                <Text style={s.bulletDot}>•</Text>
                <Text style={[s.body, { flex: 1 }]}>{r}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <Notice tone="caution" text="Past results do not predict future outcomes." />
      </>
    );
  };

  const renderPremium = () => {
    const plans = [
      { id: 'month' as const, name: 'Monthly', price: '₦2,500', per: 'per month', total: 'Billed ₦2,500 every month' },
      { id: 'quarter' as const, name: '3 months', price: '₦6,500', per: '₦2,167 a month', total: 'Billed ₦6,500 every 3 months', tag: 'Save 13%' },
      { id: 'year' as const, name: '12 months', price: '₦22,000', per: '₦1,833 a month', total: 'Billed ₦22,000 every year', tag: 'Save 27%' },
    ];
    const chosen = plans.find((p) => p.id === plan)!;
    return (
      <>
        <View style={s.plusPill}>
          <Text style={s.plusPillText}>ODDLYTICS PLUS</Text>
        </View>
        <Text style={[s.pageTitle, { marginTop: 10 }]}>More context.{'\n'}Better questions.</Text>
        <View style={s.panel}>
          <View style={s.compareHead}>
            <Text style={[s.fieldLabel, { flex: 1, marginTop: 0 }]}>What you get</Text>
            <Text style={s.compareCol}>Free</Text>
            <Text style={[s.compareCol, { color: C.accent }]}>Plus</Text>
          </View>
          {[
            ['Fixtures, scores, stats and form', true, true],
            ['Settled history and track record', true, true],
            ['Daily insights', 'Some', 'All'],
            ['All markets per match', false, true],
            ['Competitions with insights', '6', '6+'],
            ['Alerts for followed teams', false, true],
            ['Ads', 'Light', 'None'],
          ].map(([k, f, p]) => (
            <View key={k as string} style={s.compareRow}>
              <Text style={[s.body, { flex: 1 }]}>{k}</Text>
              {[f, p].map((v, i) => (
                <View key={i} style={s.compareCell}>
                  {typeof v === 'boolean' ? (
                    <Icon name={v ? 'check' : 'remove'} size={18} color={v ? (i ? C.accent : C.soft) : C.faint} />
                  ) : (
                    <Text style={[s.compareText, i === 1 && { color: C.accent }]}>{v}</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
        <Text style={s.groupLabel}>Choose a plan · sample prices</Text>
        {plans.map((p) => (
          <Pressable key={p.id} accessibilityRole="radio" accessibilityState={{ checked: plan === p.id }} onPress={() => setPlan(p.id)} style={[s.planCard, plan === p.id && s.planCardOn]}>
            <Icon name={plan === p.id ? 'radio-button-checked' : 'radio-button-unchecked'} size={22} color={plan === p.id ? C.accent : C.faint} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={s.row}>
                <Text style={s.listTitle}>{p.name}</Text>
                {p.tag ? (
                  <View style={s.saveTag}>
                    <Text style={s.saveTagText}>{p.tag}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={s.listSub}>{p.per}</Text>
            </View>
            <Text style={s.planPrice}>{p.price}</Text>
          </Pressable>
        ))}
        <View style={s.panel}>
          <Text style={s.listTitle}>{chosen.total}</Text>
          <Text style={s.body}>Renews automatically until you cancel. Cancel any time in your app store account; access continues to the end of the paid period. Prices include VAT.</Text>
        </View>
        <Button label="Payments not enabled in this prototype" disabled onPress={() => {}} />
        <View style={{ height: 8 }} />
        <Button kind="ghost" label={isPlus ? 'Stop Plus preview' : 'Preview Plus in this demo'} onPress={() => { setIsPlus(!isPlus); showToast(isPlus ? 'Plus preview off' : 'Plus preview on: premium insights unlocked'); }} />
        <Button kind="ghost" label="Restore purchase" onPress={() => showToast('Nothing to restore in this prototype')} />
        <Notice tone="caution" text="Plus gives more information, not better luck. No pick is guaranteed. 18+ only." />
      </>
    );
  };

  const renderLeagues = () => {
    const regions = ['Nigeria', 'Africa', 'Europe'];
    return (
      <>
        <Text style={s.pageTitle}>Competitions</Text>
        <Text style={s.lead}>The goal is the same breadth of leagues as the big score apps. Each competition is switched on once its data is verified.</Text>
        {regions.map((r) => (
          <View key={r}>
            <Text style={s.groupLabel}>{r}</Text>
            <View style={s.settings}>
              {COMP_ORDER.filter((c) => COMPS[c].region === r).map((c) => (
                <Pressable
                  key={c}
                  accessibilityRole="button"
                  onPress={() => {
                    setFilters({ ...DEFAULT_FILTERS, comps: [c] });
                    setQuery('');
                    goTab('All matches');
                  }}
                  style={s.settingRow}
                >
                  <View style={s.flag}>
                    <Text style={s.flagText}>{COMPS[c].country.slice(0, 3).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.listTitle}>{COMPS[c].name}</Text>
                    <Text style={s.listSub}>
                      {MATCHES.filter((m) => m.comp === c && m.status !== 'finished').length} upcoming · {COMPS[c].xg ? 'full stats' : 'core stats'}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={22} color={C.faint} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
        <Text style={s.groupLabel}>Coming as coverage is verified</Text>
        <View style={s.wrap}>
          {['Bundesliga', 'Ligue 1', 'Ghana Premier League', 'South African PSL', 'Egyptian Premier League', 'Eredivisie', 'MLS', 'AFCON qualifiers'].map((n) => (
            <View key={n} style={[s.chip, { opacity: 0.6 }]}>
              <Text style={s.chipText}>{n}</Text>
            </View>
          ))}
        </View>
      </>
    );
  };

  const renderPage = (page: 'how' | 'responsible' | 'privacy' | 'help') => {
    const content: Record<typeof page, { title: string; items: [IconName, string, string][] }> = {
      how: {
        title: 'How Oddlytics works',
        items: [
          ['dataset', 'Data', 'Fixtures, results and team statistics come from licensed football data providers. Each card shows when it was last refreshed.'],
          ['functions', 'Model', 'A statistical model turns recent form, home and away strength and scoring rates into probabilities for each outcome. Version shown on every pick.'],
          ['schedule', 'Timing', 'Estimates publish the morning before a match and may update until kick-off, when they lock.'],
          ['fact-check', 'Grading', 'Every top pick is settled against fixed rules and kept in the public record, including losses.'],
          ['warning-amber', 'Limits', 'Late team news, weather and motivation are hard to model. Smaller leagues have less data, so estimates there are less certain.'],
        ],
      },
      responsible: {
        title: 'Play responsibly',
        items: [
          ['person-off', '18+ only', 'Oddlytics is for adults. We ask for age confirmation on first use.'],
          ['casino', 'Estimates are not certainties', 'A 70% estimate still loses about 3 times in 10. Never stake more than you can afford to lose.'],
          ['timer', 'Take breaks', 'Set your own limits on time and money, and stop if it stops being fun.'],
          ['support-agent', 'Get support', 'If betting is causing harm, talk to someone you trust or a local support service. Support contacts for your country will be listed here before launch.'],
        ],
      },
      privacy: {
        title: 'Privacy and data',
        items: [
          ['storage', 'What this prototype stores', 'Nothing leaves your device. Favourites and settings reset when you reload.'],
          ['download', 'Your data', 'At launch you will be able to export or delete your account data from here.'],
          ['campaign', 'Marketing', 'No marketing messages unless you opt in.'],
        ],
      },
      help: {
        title: 'Help',
        items: [
          ['percent', 'What does 48% mean?', 'Our model thinks the outcome happens about 48 times out of 100 in matches like this one.'],
          ['star-outline', 'What are Bankers?', 'Our featured picks of the day with the clearest reasoning. Not guaranteed results.'],
          ['lock-outline', 'What is free?', 'Fixtures, scores, stats, form, the track record and a daily sample of insights.'],
        ],
      },
    };
    const c = content[page];
    return (
      <>
        <Text style={s.pageTitle}>{c.title}</Text>
        {c.items.map(([icon, t, b]) => (
          <View key={t} style={s.infoRow}>
            <View style={s.settingIcon}>
              <Icon name={icon} size={20} color={C.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.listTitle}>{t}</Text>
              <Text style={s.body}>{b}</Text>
            </View>
          </View>
        ))}
        {page === 'help' ? <Button kind="secondary" icon="menu-book" label="Betting terms explained" onPress={() => setSheet('glossary')} /> : null}
      </>
    );
  };

  /* ---------- sheets ---------- */

  const renderFilterSheet = () => (
    <>
      <View style={s.sheetHead}>
        <Text style={s.sheetTitle}>Filters</Text>
        <Pressable accessibilityRole="button" onPress={() => setDraft(DEFAULT_FILTERS)} hitSlop={10}>
          <Text style={s.link}>Reset</Text>
        </Pressable>
      </View>
      <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
        <Text style={s.fieldLabel}>Status</Text>
        <View style={s.wrap}>
          {(['all', 'upcoming', 'live', 'finished'] as const).map((st) => (
            <Chip key={st} label={st === 'all' ? 'Any' : st[0].toUpperCase() + st.slice(1)} selected={draft.status === st} onPress={() => setDraft({ ...draft, status: st })} />
          ))}
        </View>
        <Text style={s.fieldLabel}>Prediction market</Text>
        <View style={s.wrap}>
          {(['Result', 'Double chance', 'Goals', 'BTTS'] as MarketGroup[]).map((g) => (
            <Chip
              key={g}
              label={g}
              selected={draft.groups.includes(g)}
              onPress={() => setDraft({ ...draft, groups: draft.groups.includes(g) ? draft.groups.filter((x) => x !== g) : [...draft.groups, g] })}
            />
          ))}
        </View>
        <Text style={s.fieldLabel}>Minimum estimate</Text>
        <View style={s.wrap}>
          {[0, 50, 60, 70].map((p) => (
            <Chip key={p} label={p ? `${p}%+` : 'Any'} selected={draft.minP === p} onPress={() => setDraft({ ...draft, minP: p })} />
          ))}
        </View>
        <Text style={s.meta}>Higher estimates are less common and are still not certain.</Text>
        <Text style={s.fieldLabel}>Competition</Text>
        <View style={s.wrap}>
          {COMP_ORDER.map((c) => (
            <Chip
              key={c}
              label={COMPS[c].name}
              selected={draft.comps.includes(c)}
              onPress={() => setDraft({ ...draft, comps: draft.comps.includes(c) ? draft.comps.filter((x) => x !== c) : [...draft.comps, c] })}
            />
          ))}
        </View>
        <Text style={s.fieldLabel}>Sort by</Text>
        <View style={s.segment}>
          {(['league', 'time', 'probability'] as const).map((so) => (
            <Pressable key={so} accessibilityRole="button" accessibilityState={{ selected: draft.sort === so }} onPress={() => setDraft({ ...draft, sort: so })} style={[s.segItem, draft.sort === so && s.segItemOn]}>
              <Text style={[s.segText, draft.sort === so && s.segTextOn]}>{so === 'league' ? 'Competition' : so === 'time' ? 'Kick-off' : 'Estimate'}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View style={{ height: 14 }} />
      <Button
        label={draftCount ? `Show ${draftCount} ${draftCount === 1 ? 'match' : 'matches'}` : 'No matches: adjust filters'}
        disabled={!draftCount}
        onPress={() => {
          setFilters(draft);
          setSheet(null);
        }}
      />
    </>
  );

  const renderCalendarSheet = () => {
    const y = calMonth.getFullYear();
    const mo = calMonth.getMonth();
    const first = (new Date(y, mo, 1).getDay() + 6) % 7;
    const days = new Date(y, mo + 1, 0).getDate();
    const today = dateFor(0);
    const selected = dateFor(day);
    return (
      <>
        <View style={s.sheetHead}>
          <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => setCalMonth(new Date(y, mo - 1, 1))} style={s.iconBtn}>
            <Icon name="chevron-left" size={22} color={C.accent} />
          </Pressable>
          <Text style={s.sheetTitle}>{calMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => setCalMonth(new Date(y, mo + 1, 1))} style={s.iconBtn}>
            <Icon name="chevron-right" size={22} color={C.accent} />
          </Pressable>
        </View>
        <View style={s.calGrid}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <Text key={i} style={s.calWeekday}>
              {d}
            </Text>
          ))}
          {Array.from({ length: first }, (_, i) => (
            <View key={'b' + i} style={s.calCell} />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const d = new Date(y, mo, i + 1);
            const offset = Math.round((d.getTime() - today.getTime()) / 86400000);
            const has = MATCHES.some((m) => m.day === offset);
            const isSel = d.getTime() === selected.getTime();
            const isToday = offset === 0;
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`${d.toDateString()}${has ? ', has fixtures' : ''}`}
                onPress={() => {
                  setQuery('');
                  setDay(offset);
                  setSheet(null);
                }}
                style={s.calCell}
              >
                <View style={[s.calDay, isSel && s.calDayOn, isToday && !isSel && s.calDayToday]}>
                  <Text style={[s.calDayText, isSel && { color: '#0B0820', fontWeight: '800' }]}>{i + 1}</Text>
                </View>
                <View style={[s.calDot, { opacity: has ? 1 : 0 }]} />
              </Pressable>
            );
          })}
        </View>
        <Text style={s.meta}>Dots mark days with sample fixtures.</Text>
        <View style={{ height: 12 }} />
        <Button
          kind="secondary"
          label="Jump to today"
          onPress={() => {
            setDay(0);
            setCalMonth(new Date(today.getFullYear(), today.getMonth(), 1));
            setSheet(null);
          }}
        />
      </>
    );
  };

  const renderGlossary = () => (
    <>
      <View style={s.sheetHead}>
        <Text style={s.sheetTitle}>Betting terms explained</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setSheet(null)} style={s.iconBtn}>
          <Icon name="close" size={20} color={C.text} />
        </Pressable>
      </View>
      <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
        {GLOSSARY.map((g) => (
          <View key={g.title} style={{ marginBottom: 14 }}>
            <Text style={s.fieldLabel}>{g.title}</Text>
            {g.rows.map(([code, meaning]) => (
              <View key={code} style={s.glossRow}>
                <Text style={s.glossCode}>{code}</Text>
                <Text style={[s.body, { flex: 1 }]}>{meaning}</Text>
              </View>
            ))}
          </View>
        ))}
        <Text style={s.meta}>Settlement rules can vary between bookmakers. This explains terms only and is not a recommendation.</Text>
      </ScrollView>
    </>
  );

  const renderMenu = () => (
    <>
      <View style={s.sheetHead}>
        <Text style={s.sheetTitle}>More</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Close menu" onPress={() => setSheet(null)} style={s.iconBtn}>
          <Icon name="close" size={20} color={C.text} />
        </Pressable>
      </View>
      {(
        [
          ['public', 'Competitions', () => push({ name: 'leagues' })],
          ['insights', 'Track record', () => push({ name: 'record' })],
          ['workspace-premium', 'Oddlytics Plus', () => push({ name: 'premium' })],
          ['lightbulb-outline', 'How it works', () => push({ name: 'page', page: 'how' })],
          ['menu-book', 'Betting terms', () => setTimeout(() => setSheet('glossary'), 50)],
          ['volunteer-activism', 'Play responsibly', () => push({ name: 'page', page: 'responsible' })],
        ] as [IconName, string, () => void][]
      ).map(([icon, label, go]) => (
        <Pressable
          key={label}
          accessibilityRole="button"
          onPress={() => {
            setSheet(null);
            go();
          }}
          style={s.settingRow}
        >
          <View style={s.settingIcon}>
            <Icon name={icon} size={20} color={C.accent} />
          </View>
          <Text style={[s.listTitle, { flex: 1 }]}>{label}</Text>
          <Icon name="chevron-right" size={22} color={C.faint} />
        </Pressable>
      ))}
    </>
  );

  /* ---------- onboarding ---------- */

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail.trim());
  const authValid = emailOk && authPass.length >= 6 && (authMode === 'signin' || authName.trim().length >= 2);
  const socialAuth = (provider: string) => {
    setUser({ name: `${provider} user`, email: `you@${provider.toLowerCase()}.com` });
    showToast(`${provider} sign-in is simulated in this prototype`);
    afterAuth();
  };
  const renderAuth = () => (
    <ScrollView style={s.onboardBody} contentContainerStyle={{ paddingBottom: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={s.onboardTitle}>{authMode === 'signup' ? 'Create your account' : 'Welcome back'}</Text>
      <Text style={s.lead}>{authMode === 'signup' ? 'Save your favourites and picks, and pick up where you left off on any device.' : 'Sign in to get your favourites and saved picks back.'}</Text>
      <View style={s.segment}>
        {(['signup', 'signin'] as const).map((m) => (
          <Pressable key={m} accessibilityRole="tab" accessibilityState={{ selected: authMode === m }} onPress={() => setAuthMode(m)} style={[s.segItem, authMode === m && s.segItemOn]}>
            <Text style={[s.segText, authMode === m && s.segTextOn]}>{m === 'signup' ? 'Register' : 'Sign in'}</Text>
          </Pressable>
        ))}
      </View>
      {authMode === 'signup' ? (
        <>
          <Text style={s.fieldLabel}>Full name</Text>
          <View style={s.authField}>
            <Icon name="person-outline" size={20} color={C.muted} />
            <TextInput value={authName} onChangeText={setAuthName} placeholder="e.g. Ada Okafor" placeholderTextColor={C.faint} autoCapitalize="words" style={s.searchInput} accessibilityLabel="Full name" />
          </View>
        </>
      ) : null}
      <Text style={s.fieldLabel}>Email</Text>
      <View style={[s.authField, authEmail.length > 3 && !emailOk && { borderColor: C.amber }]}>
        <Icon name="mail-outline" size={20} color={C.muted} />
        <TextInput value={authEmail} onChangeText={setAuthEmail} placeholder="you@example.com" placeholderTextColor={C.faint} autoCapitalize="none" keyboardType="email-address" autoComplete="email" style={s.searchInput} accessibilityLabel="Email" />
      </View>
      <Text style={s.fieldLabel}>Password</Text>
      <View style={s.authField}>
        <Icon name="lock-outline" size={20} color={C.muted} />
        <TextInput value={authPass} onChangeText={setAuthPass} placeholder={authMode === 'signup' ? 'At least 6 characters' : 'Your password'} placeholderTextColor={C.faint} secureTextEntry={!showPass} autoCapitalize="none" style={s.searchInput} accessibilityLabel="Password" />
        <Pressable accessibilityRole="button" accessibilityLabel={showPass ? 'Hide password' : 'Show password'} onPress={() => setShowPass(!showPass)} hitSlop={10}>
          <Icon name={showPass ? 'visibility-off' : 'visibility'} size={20} color={C.muted} />
        </Pressable>
      </View>
      {authMode === 'signin' ? (
        <Pressable accessibilityRole="button" onPress={() => showToast('A reset link would be emailed to you')} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
          <Text style={s.link}>Forgot password?</Text>
        </Pressable>
      ) : (
        <Text style={[s.meta, { marginTop: 8 }]}>By registering you agree to the Terms and Privacy Policy.</Text>
      )}
      <View style={s.authDivider}>
        <View style={s.authLine} />
        <Text style={s.meta}>or continue with</Text>
        <View style={s.authLine} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {(['Google', 'Apple'] as const).map((p) => (
          <Pressable key={p} accessibilityRole="button" accessibilityLabel={`Continue with ${p}`} onPress={() => socialAuth(p)} style={({ pressed }) => [s.socialBtn, pressed && { opacity: 0.8 }]}>
            {p === 'Google' ? <Text style={s.socialG}>G</Text> : <Icon name="apple" size={20} color={C.text} />}
            <Text style={s.listTitle}>{p}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable accessibilityRole="button" onPress={() => { setUser(null); afterAuth(); }} style={{ alignSelf: 'center', marginTop: 18 }}>
        <Text style={[s.link, { color: C.soft }]}>Skip for now, continue as guest</Text>
      </Pressable>
    </ScrollView>
  );

  const renderOnboarding = () => (
    <View style={s.onboard}>
      <View style={s.onboardDots}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[s.onboardDot, onboardStep === i && s.onboardDotOn]} />
        ))}
      </View>
      {onboardStep === 0 ? (
        <ScrollView style={s.onboardBody} contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
          <Text style={s.brandLarge}>
            oddlytics<Text style={{ color: C.accent }}>.</Text>
          </Text>
          <Text style={s.onboardTitle}>Don't guess.{'\n'}Understand the game.</Text>
          {(
            [
              ['percent', 'Clear probabilities', 'Every pick shows how likely our model thinks it is, never a promise.'],
              ['query-stats', 'The evidence behind it', 'Form, stats and head to head in one place.'],
              ['fact-check', 'An honest record', 'Every settled pick stays public, including the misses.'],
            ] as [IconName, string, string][]
          ).map(([icon, t, b]) => (
            <View key={t} style={s.infoRow}>
              <View style={s.settingIcon}>
                <Icon name={icon} size={20} color={C.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.listTitle}>{t}</Text>
                <Text style={s.body}>{b}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : onboardStep === 1 ? (
        renderAuth()
      ) : onboardStep === 2 ? (
        <ScrollView style={s.onboardBody} contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
          <Text style={s.onboardTitle}>What do you follow?</Text>
          <Text style={s.lead}>We'll put these first. You can change this any time in Favourites.</Text>
          {COMP_ORDER.map((c) => {
            const on = followComps.includes(c);
            return (
              <Pressable key={c} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => setFollowComps((cs) => (on ? cs.filter((x) => x !== c) : [...cs, c]))} style={[s.planCard, on && s.planCardOn]}>
                <View style={s.flag}>
                  <Text style={s.flagText}>{COMPS[c].country.slice(0, 3).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.listTitle}>{COMPS[c].name}</Text>
                  <Text style={s.listSub}>{COMPS[c].country}</Text>
                </View>
                <Icon name={on ? 'check-circle' : 'radio-button-unchecked'} size={22} color={on ? C.accent : C.faint} />
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <ScrollView style={s.onboardBody} contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
          <Text style={s.onboardTitle}>One last thing</Text>
          <Text style={s.lead}>Oddlytics is for adults. Our estimates help you understand matches, but football is unpredictable and no pick is guaranteed.</Text>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: ageOk }} onPress={() => setAgeOk(!ageOk)} style={[s.planCard, ageOk && s.planCardOn]}>
            <Icon name={ageOk ? 'check-box' : 'check-box-outline-blank'} size={24} color={ageOk ? C.accent : C.muted} />
            <Text style={[s.listTitle, { flex: 1, marginLeft: 12 }]}>I'm 18 or older and understand estimates are not certainties</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => { setOnboarded(true); push({ name: 'page', page: 'responsible' }); }}>
            <Text style={[s.link, { marginTop: 8 }]}>Read about playing responsibly</Text>
          </Pressable>
        </ScrollView>
      )}
      <View style={s.onboardFoot}>
        {onboardStep > 0 ? <Button kind="ghost" label="Back" onPress={() => { if (authReturn) { setAuthReturn(false); setOnboarded(true); } else setOnboardStep(onboardStep - 1); }} /> : <View />}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Button
            label={
              onboardStep === 0
                ? 'Get started'
                : onboardStep === 1
                  ? authMode === 'signup'
                    ? 'Create account'
                    : 'Sign in'
                  : onboardStep === 2
                    ? `Continue${followComps.length ? ` · ${followComps.length} selected` : ''}`
                    : 'Show me today’s matches'
            }
            disabled={(onboardStep === 1 && !authValid) || (onboardStep === 3 && !ageOk)}
            onPress={() => {
              if (onboardStep === 1) {
                setUser({ name: authMode === 'signup' ? authName.trim() : authEmail.split('@')[0], email: authEmail.trim() });
                showToast(authMode === 'signup' ? 'Account created (prototype)' : 'Signed in (prototype)');
                afterAuth();
              } else if (onboardStep < 3) setOnboardStep(onboardStep + 1);
              else {
                writeFlag('oddlytics-onboarded');
                setOnboarded(true);
                setStack([]);
                setTab('Bankers');
              }
            }}
          />
        </View>
      </View>
    </View>
  );

  /* ---------- layout ---------- */

  const routeTitle = route
    ? route.name === 'match'
      ? 'Match'
      : route.name === 'record'
        ? 'Track record'
        : route.name === 'premium'
          ? 'Plus'
          : route.name === 'leagues'
            ? 'Competitions'
            : route.name === 'team'
              ? 'Team'
              : route.name === 'comp'
                ? 'League'
                : ''
    : '';

  const tabContent: Record<Tab, () => React.ReactNode> = {
    Bankers: renderBankers,
    'All matches': renderExplore,
    'Bet Builder': renderBuilder,
    Favourites: renderFavourites,
    Account: renderAccount,
  };

  return (
    <LinearGradient colors={['#000000', '#111111', '#050505']} locations={[0, 0.52, 1]} style={s.screen}>
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        {/* Header */}
        <View style={s.header}>
          {route ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={pop} hitSlop={10} style={s.back}>
              <Icon name="arrow-back" size={22} color={C.text} />
              <Text style={s.headerTitle}>{routeTitle}</Text>
            </Pressable>
          ) : (
            <View style={{ flex: 1 }}>
              <Text style={s.brand}>
                oddlytics<Text style={{ color: C.accent }}>.</Text>
              </Text>
              <Text style={s.headerDate}>{tab === 'Bankers' || tab === 'All matches' ? longDate(0) : "Don't guess. Understand the game."}</Text>
            </View>
          )}
          <View style={s.headerRight}>
            {route?.name === 'match' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Save match"
                onPress={() => toggleSaved(MATCHES.find((m) => m.id === route.id)!)}
                style={s.headerBtn}
              >
                <Icon name={savedIds.includes(route.id) ? 'favorite' : 'favorite-border'} size={22} color={C.accent} />
              </Pressable>
            ) : (
              <Pressable accessibilityRole="button" accessibilityLabel="Search" onPress={openSearch} style={s.headerBtn}>
                <Icon name="search" size={22} color={C.accent} />
              </Pressable>
            )}
            <Pressable accessibilityRole="button" accessibilityLabel="More" onPress={() => setSheet('menu')} style={s.headerBtn}>
              <Icon name="menu" size={22} color={C.accent} />
            </Pressable>
          </View>
        </View>

        {/* Body: tabs stay mounted so scroll position and filters survive navigation */}
        <View style={{ flex: 1 }}>
          {NAV.map(({ name }) => (
            <View key={name} style={[s.fill, (name !== tab || !!route) && s.hidden]}>
              {name === 'Bankers' || name === 'All matches' ? renderDateRail() : null}
              <ScrollView style={s.fill} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {tabContent[name]()}
              </ScrollView>
            </View>
          ))}
          {route ? (
            <ScrollView key={JSON.stringify(route)} style={s.fill} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
              {route.name === 'match'
                ? renderDetail(MATCHES.find((m) => m.id === route.id)!)
                : route.name === 'record'
                  ? renderRecord()
                  : route.name === 'premium'
                    ? renderPremium()
                    : route.name === 'leagues'
                      ? renderLeagues()
                      : route.name === 'team'
                        ? renderTeam(route.id)
                        : route.name === 'comp'
                          ? renderComp(route.id)
                          : renderPage(route.page)}
            </ScrollView>
          ) : null}

          {toast ? (
            <View style={s.toast} accessibilityLiveRegion="polite">
              <Text style={s.toastText}>{toast.text}</Text>
              {toast.undo ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    toast.undo?.();
                    setToast(null);
                  }}
                  hitSlop={10}
                >
                  <Text style={s.toastUndo}>Undo</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Bottom navigation */}
        <View style={s.nav}>
          {NAV.map((item) => {
            const active = tab === item.name && !route;
            const color = tab === item.name ? C.accent : C.muted;
            const icon: IconName = item.name === 'Favourites' && tab === item.name ? 'favorite' : item.icon;
            return (
              <Pressable
                key={item.name}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === item.name }}
                accessibilityLabel={item.name}
                onPress={() => goTab(item.name)}
                style={s.navItem}
              >
                <View style={s.navPill}>
                  {tab === item.name ? (
                    <View style={s.navGlass} />
                  ) : null}
                  <Icon name={icon} size={22} color={tab === item.name ? '#C9C1FF' : color} />
                  {item.name === 'Favourites' && savedIds.length ? (
                    <View style={s.navBadge}>
                      <Text style={s.navBadgeText}>{savedIds.length}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[s.navText, { color }, active && { fontWeight: '700' }]} numberOfLines={1}>
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Bottom sheets */}
        {sheet ? (
          <DragSheet key={sheet} onClose={() => setSheet(null)}>
              {sheet === 'filters'
                ? renderFilterSheet()
                : sheet === 'calendar'
                  ? renderCalendarSheet()
                  : sheet === 'glossary'
                    ? renderGlossary()
                    : renderMenu()}
          </DragSheet>
        ) : null}

        {!onboarded ? <View style={s.overlay}>{renderOnboarding()}</View> : null}
        {splash ? <View style={s.overlay}><Splash onDone={() => setSplash(false)} /></View> : null}
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  fill: { flex: 1 },
  hidden: { display: 'none' },
  row: { flexDirection: 'row', alignItems: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  content: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 40 },

  header: { minHeight: 64, paddingHorizontal: 18, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1E1F24' },
  brand: { color: C.text, fontWeight: '800', fontSize: 24, letterSpacing: -0.8 },
  headerDate: { color: C.muted, fontSize: 12, marginTop: 1 },
  headerRight: { flexDirection: 'row', gap: 8 },
  headerBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, borderColor: C.accentSoft, backgroundColor: '#08080A', alignItems: 'center', justifyContent: 'center' },
  back: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  headerTitle: { color: C.text, fontSize: 18, fontWeight: '700' },

  railWrap: { flexDirection: 'row', alignItems: 'center', paddingLeft: 18, paddingRight: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1E1F24', backgroundColor: '#050505' },
  rail: { gap: 6, paddingRight: 8 },
  railItem: { width: 52, height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.lineSoft },
  railItemOn: { backgroundColor: C.accent, borderColor: C.accent },
  railTop: { color: C.muted, fontSize: 11, fontWeight: '600' },
  railBottom: { color: C.text, fontSize: 17, fontWeight: '800', marginTop: 1, fontVariant: ['tabular-nums'] },
  railTextOn: { color: '#0B0820' },
  railDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.accent, marginTop: 3 },
  calBtn: { width: 48, height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: C.accentSoft, marginLeft: 4 },

  pageTitle: { color: C.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.8, marginBottom: 8 },
  lead: { color: C.soft, fontSize: 15, lineHeight: 22, marginBottom: 16 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 10 },
  sectionTitle: { color: C.text, fontSize: 18, fontWeight: '700' },
  sectionSub: { color: C.muted, fontSize: 12, marginTop: 2 },
  linkWrap: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 32 },
  link: { color: C.accent, fontSize: 14, fontWeight: '700' },
  eyebrow: { color: C.accent, fontSize: 12, fontWeight: '700' },
  cardTitle: { color: C.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  body: { color: C.soft, fontSize: 14, lineHeight: 21 },
  meta: { color: C.muted, fontSize: 12, lineHeight: 17 },
  groupLabel: { color: C.muted, fontSize: 13, fontWeight: '700', marginTop: 22, marginBottom: 8 },
  foot: { color: C.faint, fontSize: 12, lineHeight: 18, marginTop: 20 },

  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 38, paddingHorizontal: 14, borderRadius: 19, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, marginRight: 8, marginBottom: 8 },
  chipOn: { backgroundColor: C.accentSoft, borderColor: C.accentLine },
  chipText: { color: C.soft, fontSize: 13, fontWeight: '600' },
  chipTextOn: { color: C.accent },
  chipCount: { backgroundColor: C.accent, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  chipCountText: { color: '#0B0820', fontSize: 11, fontWeight: '800' },
  clearAll: { minHeight: 38, justifyContent: 'center', marginBottom: 8, paddingHorizontal: 4 },

  btn: { minHeight: 50, borderRadius: 14, backgroundColor: C.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18 },
  btnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.accentLine },
  btnGhost: { backgroundColor: 'transparent' },
  btnSmall: { minHeight: 44, paddingHorizontal: 14, borderRadius: 12 },
  btnDisabled: { backgroundColor: C.raised, borderColor: C.raised },
  btnText: { fontSize: 15, fontWeight: '700' },

  notice: { flexDirection: 'row', gap: 10, backgroundColor: '#15161A', borderRadius: 14, padding: 14, marginTop: 14, borderWidth: 1, borderColor: C.lineSoft },
  noticeText: { color: C.muted, fontSize: 13, lineHeight: 19, flex: 1 },

  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, height: 24, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  crest: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  crestText: { fontWeight: '800', letterSpacing: -0.3 },

  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.live },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveText: { color: C.live, fontSize: 12, fontWeight: '800' },
  liveMinute: { color: C.live, fontSize: 13, fontWeight: '700', marginTop: 2, fontVariant: ['tabular-nums'] },
  liveComp: { color: C.muted, fontSize: 12, flex: 1 },
  liveCard: { width: 220, backgroundColor: C.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#4A2522' },

  feature: { backgroundColor: C.elevated, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#3A3C45', marginBottom: 12 },
  featureTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  featureTeams: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  featureTeam: { flex: 1, alignItems: 'center', gap: 8 },
  featureTeamName: { color: C.text, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  featureVs: { color: C.muted, fontSize: 18, fontWeight: '700', paddingHorizontal: 8, fontVariant: ['tabular-nums'] },
  featurePick: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 16 },
  featurePickLabel: { color: C.muted, fontSize: 12 },
  featurePickText: { color: C.text, fontSize: 17, fontWeight: '700', marginTop: 2 },
  featurePct: { color: C.accent, fontSize: 32, fontWeight: '800', letterSpacing: -1, fontVariant: ['tabular-nums'] },
  meter: { height: 6, borderRadius: 3, backgroundColor: C.raised, marginTop: 10, overflow: 'hidden' },
  meterFill: { height: '100%', backgroundColor: C.accent, borderRadius: 3 },
  featureReason: { color: C.soft, fontSize: 14, lineHeight: 21, marginTop: 12 },

  freeBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.accentSoft, borderRadius: 14, padding: 14, marginTop: 4 },
  freeText: { color: C.soft, fontSize: 13, lineHeight: 19, flex: 1 },

  group: { marginBottom: 6 },
  collapseBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.lineSoft, paddingLeft: 14, paddingRight: 6, minHeight: 48, marginBottom: 8 },
  collapseText: { color: C.soft, fontSize: 13, fontWeight: '600' },
  collapseBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 10 },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingVertical: 6 },
  groupName: { color: C.text, fontSize: 14, fontWeight: '700' },
  groupCountry: { color: C.muted, fontSize: 12 },
  groupCount: { color: C.muted, fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] },
  flag: { width: 34, height: 26, borderRadius: 6, backgroundColor: C.raised, alignItems: 'center', justifyContent: 'center' },
  flagText: { color: C.soft, fontSize: 10, fontWeight: '800' },
  inlineComp: { color: C.muted, fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 4 },

  card: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.lineSoft, padding: 14, marginBottom: 8 },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  statusCol: { width: 58, paddingRight: 4 },
  statusText: { color: C.soft, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  statusSub: { color: C.muted, fontSize: 11, marginTop: 2 },
  cardTeams: { flex: 1, gap: 6 },
  teamLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  teamName: { color: C.text, fontSize: 15, fontWeight: '600', flex: 1 },
  score: { color: C.text, fontSize: 15, fontWeight: '800', width: 22, textAlign: 'right', fontVariant: ['tabular-nums'] },
  cardProb: { width: 64, alignItems: 'flex-end' },
  probValue: { color: C.accent, fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  probCaption: { color: C.muted, fontSize: 11 },
  cardFoot: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: C.lineSoft, marginTop: 12, paddingTop: 10 },
  pickLine: { color: C.text, fontSize: 14, fontWeight: '600' },
  pickMarket: { color: C.muted, fontWeight: '400' },
  heart: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  recordTeaser: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: C.lineSoft },

  empty: { alignItems: 'center', gap: 8, backgroundColor: C.surface, borderRadius: 16, padding: 24, marginTop: 6 },
  emptyTitle: { color: C.text, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  emptyBody: { color: C.muted, fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 6 },

  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.line, paddingHorizontal: 14, minHeight: 50 },
  searchInput: { flex: 1, color: C.text, fontSize: 16, minHeight: 48 },
  toolbar: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  iconBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resultLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 6, gap: 8 },
  resultText: { color: C.muted, fontSize: 13, flex: 1, marginBottom: 8 },

  panel: { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.lineSoft },
  fieldLabel: { color: C.soft, fontSize: 13, fontWeight: '700', marginTop: 14, marginBottom: 8 },
  segment: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: C.lineSoft, marginBottom: 14 },
  segItem: { flex: 1, minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  segItemOn: { backgroundColor: C.accentSoft },
  segText: { color: C.muted, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  stepValueWide: { color: C.text, fontSize: 18, fontWeight: '800', minWidth: 48, textAlign: 'center', fontVariant: ['tabular-nums'] },
  builderSummary: { flexDirection: 'row', gap: 8, marginTop: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12 },
  totalOdds: { color: C.accent, fontSize: 30, fontWeight: '800', fontVariant: ['tabular-nums'] },
  genRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  oddPill: { minWidth: 56, height: 34, borderRadius: 10, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, marginLeft: 8 },
  oddText: { color: '#0B0820', fontSize: 15, fontWeight: '800', fontVariant: ['tabular-nums'] },
  rowLink: { flex: 1, flexDirection: 'row', alignItems: 'center', minHeight: 48, marginRight: 8 },
  teamHero: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  teamHeroName: { color: C.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 38, borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  kvValue: { color: C.text, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  cPos: { width: 26, flexGrow: 0, flexShrink: 0, flexBasis: 26 },
  cNum: { width: 30, flexGrow: 0, flexShrink: 0, flexBasis: 30, textAlign: 'center', fontVariant: ['tabular-nums'] },
  segRow: { flexDirection: 'row', gap: 6, minHeight: 46 },
  slipHead: { backgroundColor: '#1C1830', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#3D3470', marginBottom: 10 },
  slipRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.lineSoft, padding: 14, marginBottom: 8 },
  slipNum: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  slipNumText: { color: C.accent, fontSize: 14, fontWeight: '800' },
  agreeDot: { width: 14, height: 6, borderRadius: 3, backgroundColor: C.raised },
  agreeDotOn: { backgroundColor: C.won },
  segTall: { minHeight: 54, paddingVertical: 6 },
  segSub: { color: C.faint, fontSize: 11, marginTop: 2, textAlign: 'center' },
  segTextOn: { color: C.accent, fontWeight: '700' },
  builderRow: { flexDirection: 'row' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, borderTopWidth: 1, borderTopColor: C.lineSoft, paddingTop: 14 },
  stepBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: C.accentLine, alignItems: 'center', justifyContent: 'center' },
  stepValue: { color: C.text, fontSize: 20, fontWeight: '800', width: 28, textAlign: 'center', fontVariant: ['tabular-nums'] },
  builderCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  builderTeams: { color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 4 },

  tray: { position: 'absolute', left: 14, right: 14, bottom: 12, minHeight: 56, borderRadius: 16, backgroundColor: C.accent, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
  trayCount: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#0B0820', alignItems: 'center', justifyContent: 'center' },
  trayCountText: { color: C.accent, fontWeight: '800' },
  trayText: { color: '#0B0820', fontSize: 14, fontWeight: '600', flex: 1 },
  trayAction: { color: '#0B0820', fontSize: 14, fontWeight: '800' },

  segmentGap: { height: 10 },
  listRow: { flexDirection: 'row', alignItems: 'center', minHeight: 64, borderBottomWidth: 1, borderBottomColor: C.lineSoft, paddingVertical: 8 },
  listTitle: { color: C.text, fontSize: 15, fontWeight: '600' },
  listSub: { color: C.muted, fontSize: 13, marginTop: 2 },
  followBtn: { minHeight: 36, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  followBtnOn: { borderColor: C.accentLine, backgroundColor: C.accentSoft },
  followText: { color: C.soft, fontSize: 13, fontWeight: '700' },

  profile: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.lineSoft, marginTop: 8 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
  plusCard: { backgroundColor: '#1C1830', borderRadius: 18, padding: 18, marginTop: 12, borderWidth: 1, borderColor: '#3D3470' },
  plusPill: { alignSelf: 'flex-start', backgroundColor: C.accent, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  plusPillText: { color: '#0B0820', fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  plusTitle: { color: C.text, fontSize: 20, fontWeight: '800', marginTop: 12, marginBottom: 6 },
  settings: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.lineSoft, paddingHorizontal: 14 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  settingIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: 'row', gap: 12, paddingVertical: 12 },

  detailMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  matchup: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.surface, borderRadius: 18, paddingVertical: 20, paddingHorizontal: 8, marginTop: 12, marginBottom: 12, borderWidth: 1, borderColor: C.lineSoft },
  matchupTeam: { flex: 1, alignItems: 'center', gap: 8 },
  matchupName: { color: C.text, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  matchupFollow: { color: C.accent, fontSize: 12, fontWeight: '600' },
  matchupCenter: { alignItems: 'center', justifyContent: 'center', paddingTop: 12, minWidth: 90, gap: 4 },
  bigScore: { color: C.text, fontSize: 32, fontWeight: '800', fontVariant: ['tabular-nums'] },
  bigTime: { color: C.text, fontSize: 26, fontWeight: '800', fontVariant: ['tabular-nums'] },
  glassFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(28,24,48,0.35)', borderWidth: 1, borderColor: 'rgba(139,124,255,0.35)' },
  lockProb: { paddingHorizontal: 6, paddingVertical: 2, alignItems: 'flex-end' },
  lockLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingLeft: 10, width: '100%' },
  lockLabelText: { color: C.accent, fontSize: 13, fontWeight: '700' },
  lockOverlay: { alignItems: 'center', gap: 10, paddingHorizontal: 22 },
  lockIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(139,124,255,0.18)', borderWidth: 1, borderColor: 'rgba(139,124,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  numField: { color: C.text, fontSize: 18, fontWeight: '800', width: 76, flexGrow: 0, flexShrink: 0, height: 44, textAlign: 'center', borderRadius: 10, borderWidth: 1, borderColor: C.line, backgroundColor: 'rgba(255,255,255,0.04)', marginHorizontal: 6, paddingHorizontal: 6, fontVariant: ['tabular-nums'] },
  numFieldOn: { borderColor: C.accent, backgroundColor: C.accentSoft },
  lockedPanel: { alignItems: 'flex-start', gap: 10, backgroundColor: '#1C1830', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#3D3470', marginBottom: 12 },
  estimate: { backgroundColor: '#1C1830', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#3D3470', marginBottom: 12 },
  settleBox: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 8, marginBottom: 14 },
  settleText: { color: C.soft, fontSize: 14, lineHeight: 20 },
  estimatePick: { color: C.text, fontSize: 20, fontWeight: '800', marginTop: 6 },
  estimateRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  estimatePct: { color: C.accent, fontSize: 48, fontWeight: '800', letterSpacing: -1.5, fontVariant: ['tabular-nums'] },
  estimateNote: { color: C.muted, fontSize: 13, lineHeight: 18, flex: 1 },
  probBar: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', gap: 2 },
  probLegend: { flexDirection: 'row', marginTop: 8 },
  probLegendItem: { flex: 1 },
  probLegendValue: { color: C.text, fontSize: 15, fontWeight: '800', fontVariant: ['tabular-nums'] },
  probLegendLabel: { color: C.muted, fontSize: 12 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, rowGap: 4, columnGap: 14 },
  tabsScroll: { marginHorizontal: -18, marginBottom: 12 },
  tabs: { paddingHorizontal: 18, gap: 6 },
  tab: { minHeight: 40, paddingHorizontal: 14, borderRadius: 20, justifyContent: 'center', borderWidth: 1, borderColor: C.line },
  tabOn: { backgroundColor: C.text, borderColor: C.text },
  tabText: { color: C.soft, fontSize: 14, fontWeight: '600' },
  tabTextOn: { color: '#000', fontWeight: '700' },
  evidence: { marginTop: 12, borderTopWidth: 1, borderTopColor: C.lineSoft, paddingTop: 6 },
  evidenceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  evidenceValue: { color: C.text, fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  marketBlock: { marginBottom: 6 },
  marketRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 30 },
  marketLabel: { color: C.soft, fontSize: 13, width: 110 },
  marketTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: C.raised, overflow: 'hidden' },
  marketFill: { height: '100%', backgroundColor: C.accent, borderRadius: 4 },
  marketPct: { color: C.text, fontSize: 13, fontWeight: '700', width: 40, textAlign: 'right', fontVariant: ['tabular-nums'] },
  statHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statRow: { paddingVertical: 8 },
  statNums: { flexDirection: 'row', alignItems: 'center' },
  statNum: { color: C.muted, fontSize: 15, fontWeight: '800', width: 54, fontVariant: ['tabular-nums'] },
  statLabel: { color: C.soft, fontSize: 13, flex: 1, textAlign: 'center' },
  statBars: { flexDirection: 'row', gap: 6, marginTop: 6 },
  statTrackL: { flex: 1, height: 6, borderRadius: 3, backgroundColor: C.raised, overflow: 'hidden', flexDirection: 'row-reverse' },
  statTrackR: { flex: 1, height: 6, borderRadius: 3, backgroundColor: C.raised, overflow: 'hidden' },
  statFillL: { height: '100%', backgroundColor: C.accent },
  statFillR: { height: '100%', backgroundColor: '#B7AEFF' },
  formRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  formItem: { alignItems: 'center', gap: 3 },
  formChip: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  formText: { fontSize: 15, fontWeight: '800' },
  formDate: { color: C.muted, fontSize: 11 },
  h2h: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 14 },
  h2hItem: { alignItems: 'center' },
  h2hValue: { color: C.text, fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] },

  metrics: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  metric: { flex: 1, backgroundColor: C.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.lineSoft },
  metricValue: { color: C.text, fontSize: 26, fontWeight: '800', fontVariant: ['tabular-nums'] },
  metricLabel: { color: C.soft, fontSize: 13, fontWeight: '600', marginTop: 2 },
  metricSub: { color: C.muted, fontSize: 12, marginTop: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 32 },
  barLabel: { color: C.soft, fontSize: 13, width: 32 },
  barTrack: { flex: 1, height: 12, borderRadius: 6, backgroundColor: C.raised, overflow: 'hidden', flexDirection: 'row' },
  barCount: { color: C.text, fontSize: 13, fontWeight: '700', width: 34, textAlign: 'right', fontVariant: ['tabular-nums'] },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  legendSwatch: { width: 10, height: 10, borderRadius: 2 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.lineSoft, paddingVertical: 9 },
  tableHead: { color: C.muted, fontSize: 12, fontWeight: '700', flex: 1 },
  tableCell: { color: C.text, fontSize: 14, flex: 1 },
  tableNum: { textAlign: 'right', fontVariant: ['tabular-nums'] },
  bullet: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bulletDot: { color: C.accent, fontSize: 16, lineHeight: 21 },

  compareHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  compareCol: { width: 56, textAlign: 'center', color: C.soft, fontSize: 13, fontWeight: '700' },
  compareRow: { flexDirection: 'row', alignItems: 'center', minHeight: 40, borderTopWidth: 1, borderTopColor: C.lineSoft },
  compareCell: { width: 56, alignItems: 'center' },
  compareText: { color: C.soft, fontSize: 13, fontWeight: '600' },
  planCard: { flexDirection: 'row', alignItems: 'center', minHeight: 64, backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.lineSoft },
  planCardOn: { borderColor: C.accentLine, backgroundColor: '#1C1830' },
  planPrice: { color: C.text, fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  saveTag: { backgroundColor: C.wonSoft, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 },
  saveTagText: { color: C.won, fontSize: 11, fontWeight: '700' },

  glossRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 36 },
  glossCode: { color: C.accent, fontSize: 14, fontWeight: '800', width: 64 },

  nav: { flexDirection: 'row', backgroundColor: '#08080A', borderTopWidth: 1, borderTopColor: '#1E1F24', paddingTop: 8, paddingBottom: 8, position: 'relative', zIndex: 10 },
  navItem: { flex: 1, alignItems: 'center', minHeight: 54, justifyContent: 'center' },
  navPill: { width: 62, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  navGlass: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 17, overflow: 'hidden', backgroundColor: 'rgba(139,124,255,0.22)', borderWidth: 1, borderColor: 'rgba(183,174,255,0.55)', shadowColor: C.accent, shadowOpacity: 0.55, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } },
  navGlassShine: { position: 'absolute', top: 0, left: 6, right: 6, height: '45%', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, backgroundColor: 'rgba(255,255,255,0.10)' },
  navText: { fontSize: 11, marginTop: 3, fontWeight: '500' },
  navBadge: { position: 'absolute', top: -2, right: 8, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  navBadgeText: { color: '#0B0820', fontSize: 10, fontWeight: '800' },

  toast: { position: 'absolute', left: 16, right: 16, bottom: 12, minHeight: 50, borderRadius: 14, backgroundColor: '#F5F5F7', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  toastText: { color: '#111', fontSize: 14, fontWeight: '600', flex: 1 },
  toastUndo: { color: '#5B4BE0', fontSize: 14, fontWeight: '800' },

  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 100 },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.28)' },
  sheet: { backgroundColor: 'rgba(28,28,38,0.55)', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingBottom: 24, paddingTop: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' },
  grabZone: { alignSelf: 'stretch', alignItems: 'center', paddingTop: 6, paddingBottom: 14, marginTop: -8, cursor: 'grab', touchAction: 'none' } as any,
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, marginBottom: 4 },
  sheetTitle: { color: C.text, fontSize: 19, fontWeight: '800' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  calWeekday: { width: `${100 / 7}%`, textAlign: 'center', color: C.muted, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  calCell: { width: `${100 / 7}%`, height: 50, alignItems: 'center', justifyContent: 'center' },
  calDay: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  calDayOn: { backgroundColor: C.accent },
  calDayToday: { borderWidth: 1, borderColor: C.accent },
  calDayText: { color: C.text, fontSize: 15, fontVariant: ['tabular-nums'] },
  calDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.accent, marginTop: 1 },

  splash: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  splashLogo: { color: C.text, fontSize: 46, fontWeight: '800', letterSpacing: -1.6 },
  onboard: { flex: 1, backgroundColor: '#050505', paddingHorizontal: 22, paddingTop: 24, paddingBottom: 20 },
  onboardDots: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  onboardDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.line },
  onboardDotOn: { width: 24, backgroundColor: C.accent },
  onboardBody: { flex: 1 },
  brandLarge: { color: C.text, fontSize: 34, fontWeight: '800', letterSpacing: -1.2, marginBottom: 16 },
  onboardTitle: { color: C.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.8, lineHeight: 34, marginBottom: 14 },
  authField: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.line, paddingHorizontal: 14, minHeight: 50 },
  authDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 22, marginBottom: 14 },
  authLine: { flex: 1, height: 1, backgroundColor: C.line },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
  socialG: { color: C.text, fontSize: 18, fontWeight: '800' },
  onboardFoot: { flexDirection: 'row', alignItems: 'center' },
});
