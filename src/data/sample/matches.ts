/*
 * SAMPLE fixtures and model output. About 35 games a day across 8 competitions,
 * three days either side of today. Not real fixtures, odds or predictions.
 */
import type { Match } from '../../types';
import { teamGoalProbs } from '../../utils/markets';
import { hash, seeded } from '../../utils/random';
import { LEAGUE_TEAMS, SAMPLE_COMP_ORDER } from './catalog';

const BASE_MATCHES: Match[] = [
  // Today
  {
    id: 'm1',
    comp: 'npfl',
    day: 0,
    time: '16:00',
    status: 'upcoming',
    home: 'enyimba',
    away: 'rivers',
    x: [48, 28, 24],
    btts: 44,
    o25: 41,
    pick: { market: '1X2', outcome: 'home', p: 48 },
    reason: 'Enyimba have scored in 9 of their last 10 home games, while Rivers United have won once away this season.',
    updated: 22,
    featured: true,
  },
  {
    id: 'm2',
    comp: 'npfl',
    day: 0,
    time: '15:00',
    status: 'live',
    minute: 62,
    score: [1, 0],
    home: 'rangers',
    away: 'abia',
    x: [61, 26, 13],
    btts: 38,
    o25: 35,
    pick: { market: '1X2', outcome: 'home', p: 61 },
    reason: 'Rangers concede few at home and Abia have the lowest away shot count in the sample.',
    updated: 3,
  },
  {
    id: 'm3',
    comp: 'epl',
    day: 0,
    time: '18:30',
    status: 'upcoming',
    home: 'arsenal',
    away: 'newcastle',
    x: [54, 24, 22],
    btts: 52,
    o25: 55,
    pick: { market: '1X2', outcome: 'home', p: 54 },
    reason: 'Arsenal create the most chances at home in the league; Newcastle are missing two first-choice defenders.',
    updated: 18,
    featured: true,
  },
  {
    id: 'm4',
    comp: 'epl',
    day: 0,
    time: '21:00',
    status: 'upcoming',
    home: 'liverpool',
    away: 'chelsea',
    x: [47, 25, 28],
    btts: 64,
    o25: 63,
    pick: { market: 'OU25', outcome: 'over', p: 63 },
    reason: 'Both sides average more than 1.7 expected goals per match across their last eight.',
    updated: 31,
    premium: true,
  },
  {
    id: 'm5',
    comp: 'seriea',
    day: 0,
    time: '20:45',
    status: 'upcoming',
    home: 'inter',
    away: 'napoli',
    x: [42, 30, 28],
    btts: 58,
    o25: 52,
    pick: { market: 'BTTS', outcome: 'yes', p: 58 },
    reason: 'Each side has scored in all of its last six league games.',
    updated: 40,
    premium: true,
  },
  {
    id: 'm6',
    comp: 'cafcl',
    day: 0,
    time: '17:00',
    status: 'upcoming',
    home: 'alahly',
    away: 'esttunis',
    x: [51, 31, 18],
    btts: 33,
    o25: 26,
    pick: { market: 'OU35', outcome: 'under', p: 74 },
    reason: 'Seven of the last eight meetings had three goals or fewer.',
    updated: 41,
  },
  {
    id: 'm7',
    comp: 'laliga',
    day: 0,
    time: '19:00',
    status: 'live',
    minute: 34,
    score: [2, 0],
    home: 'realmadrid',
    away: 'sevilla',
    x: [70, 18, 12],
    btts: 41,
    o25: 61,
    pick: { market: '1X2', outcome: 'home', p: 70 },
    reason: 'Real Madrid have won 11 of their last 12 home league games.',
    updated: 1,
  },
  // Tomorrow
  {
    id: 'm8',
    comp: 'npfl',
    day: 1,
    time: '16:00',
    status: 'upcoming',
    home: 'remo',
    away: 'kano',
    x: [52, 27, 21],
    btts: 49,
    o25: 44,
    pick: { market: 'OU15', outcome: 'over', p: 66 },
    reason: 'Remo Stars games average 2.6 goals at home this season.',
    updated: 35,
    featured: true,
  },
  {
    id: 'm9',
    comp: 'laliga',
    day: 1,
    time: '21:00',
    status: 'upcoming',
    home: 'barcelona',
    away: 'atletico',
    x: [49, 25, 26],
    btts: 61,
    o25: 57,
    pick: { market: 'BTTS', outcome: 'yes', p: 61 },
    reason: 'Both teams have scored in four of the last five meetings.',
    updated: 50,
  },
  {
    id: 'm10',
    comp: 'epl',
    day: 1,
    time: '16:00',
    status: 'upcoming',
    home: 'mancity',
    away: 'brighton',
    x: [68, 18, 14],
    btts: 50,
    o25: 64,
    pick: { market: '1X2', outcome: 'home', p: 68 },
    reason: 'City hold the highest home expected-goal difference in the league.',
    updated: 27,
    premium: true,
  },
  {
    id: 'm11',
    comp: 'ucl',
    day: 1,
    time: '21:00',
    status: 'upcoming',
    home: 'bayern',
    away: 'psg',
    x: [45, 24, 31],
    btts: 66,
    o25: 67,
    pick: { market: 'OU25', outcome: 'over', p: 67 },
    reason: 'Both clubs rank top three in the competition for shots per match.',
    updated: 44,
    featured: true,
  },
  // In two and three days
  {
    id: 'm12',
    comp: 'npfl',
    day: 2,
    time: '16:00',
    status: 'upcoming',
    home: 'shooting',
    away: 'plateau',
    x: [44, 32, 24],
    btts: 42,
    o25: 37,
    pick: { market: 'DC', outcome: '1X', p: 76 },
    reason: 'Shooting Stars have lost once at home in their last 14.',
    updated: 60,
    featured: true,
  },
  {
    id: 'm13',
    comp: 'seriea',
    day: 2,
    time: '20:45',
    status: 'upcoming',
    home: 'milan',
    away: 'juventus',
    x: [38, 32, 30],
    btts: 47,
    o25: 43,
    pick: { market: 'OU25', outcome: 'under', p: 57 },
    reason: 'Five of the last six meetings finished with two goals or fewer.',
    updated: 58,
  },
  {
    id: 'm14',
    comp: 'cafcl',
    day: 2,
    time: '15:00',
    status: 'upcoming',
    home: 'sundowns',
    away: 'wydad',
    x: [50, 30, 20],
    btts: 40,
    o25: 39,
    pick: { market: '1X2', outcome: 'home', p: 50 },
    reason: 'Sundowns are unbeaten at home in the group stage across two seasons.',
    updated: 63,
    premium: true,
  },
  {
    id: 'm15',
    comp: 'epl',
    day: 3,
    time: '17:30',
    status: 'upcoming',
    home: 'chelsea',
    away: 'arsenal',
    x: [36, 27, 37],
    btts: 60,
    o25: 54,
    pick: { market: 'BTTS', outcome: 'yes', p: 60 },
    reason: 'Both sides have scored in five of their last six meetings.',
    updated: 70,
    featured: true,
  },
  // Settled
  {
    id: 'm16',
    comp: 'npfl',
    day: -1,
    time: '16:00',
    status: 'finished',
    score: [2, 0],
    home: 'enyimba',
    away: 'plateau',
    x: [58, 25, 17],
    btts: 39,
    o25: 40,
    pick: { market: '1X2', outcome: 'home', p: 58 },
    reason: 'Enyimba were unbeaten in nine home games before kick-off.',
    updated: 0,
    featured: true,
  },
  {
    id: 'm17',
    comp: 'epl',
    day: -1,
    time: '17:30',
    status: 'finished',
    score: [1, 1],
    home: 'mancity',
    away: 'arsenal',
    x: [52, 25, 23],
    btts: 55,
    o25: 54,
    pick: { market: '1X2', outcome: 'home', p: 52 },
    reason: 'City had won six straight home games before this match.',
    updated: 0,
  },
  {
    id: 'm18',
    comp: 'seriea',
    day: -1,
    time: '20:45',
    status: 'finished',
    score: [0, 2],
    home: 'juventus',
    away: 'inter',
    x: [33, 31, 36],
    btts: 45,
    o25: 45,
    pick: { market: 'OU25', outcome: 'under', p: 55 },
    reason: 'Recent meetings between the two had been low scoring.',
    updated: 0,
  },
  {
    id: 'm19',
    comp: 'cafcl',
    day: -2,
    time: '17:00',
    status: 'finished',
    score: [0, 1],
    home: 'alahly',
    away: 'wydad',
    x: [49, 31, 20],
    btts: 36,
    o25: 36,
    pick: { market: 'OU25', outcome: 'under', p: 64 },
    reason: 'Both defences ranked top two in the group.',
    updated: 0,
    featured: true,
  },
  {
    id: 'm20',
    comp: 'npfl',
    day: -2,
    time: '16:00',
    status: 'finished',
    score: [2, 1],
    home: 'shooting',
    away: 'kano',
    x: [46, 30, 24],
    btts: 61,
    o25: 48,
    pick: { market: 'BTTS', outcome: 'yes', p: 61 },
    reason: 'Kano had scored in each of their last five away games.',
    updated: 0,
  },
  {
    id: 'm21',
    comp: 'epl',
    day: -3,
    time: '16:00',
    status: 'finished',
    score: [3, 2],
    home: 'newcastle',
    away: 'brighton',
    x: [45, 28, 27],
    btts: 53,
    o25: 43,
    pick: { market: 'OU25', outcome: 'under', p: 57 },
    reason: 'Both teams had kept clean sheets in three of their last five.',
    updated: 0,
  },
  {
    id: 'm22',
    comp: 'npfl',
    day: -3,
    time: '16:00',
    status: 'finished',
    score: [0, 0],
    home: 'rivers',
    away: 'plateau',
    x: [55, 27, 18],
    btts: 40,
    o25: 34,
    pick: { market: '1X2', outcome: 'home', p: 55 },
    reason: 'Rivers United had won four straight at home.',
    updated: 0,
    featured: true,
  },
  {
    id: 'm23',
    comp: 'laliga',
    day: -3,
    time: '21:00',
    status: 'finished',
    score: [2, 1],
    home: 'atletico',
    away: 'sevilla',
    x: [57, 25, 18],
    btts: 48,
    o25: 45,
    pick: { market: 'DC', outcome: '1X', p: 77 },
    reason: 'Atlético had lost one home league game all season.',
    updated: 0,
  },
];

const PER_DAY: Record<string, number> = { npfl: 5, cafcl: 2, epl: 5, laliga: 4, seriea: 4, bundesliga: 4, ligue1: 3, ucl: 3 };
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
      [...BASE_MATCHES, ...out].some(
        (m) => Math.abs(m.day - day) <= 3 && ((m.home === x && m.away === y) || (m.home === y && m.away === x)),
      );
    for (const comp of SAMPLE_COMP_ORDER) {
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
        let pick: Match['pick'];
        if (strong && hash(key + 'mk') % 2) pick = { market: 'DC', outcome: '1X', p: Math.min(90, h + d) };
        else if (strong) pick = { market: 'OU15', outcome: 'over', p: seeded(key + 'o15', 80, 89) };
        else if (hash(key + 'tg') % 5 === 0) {
          // Team goals pick (HS, AS, HS2+, AS2+)
          const [hsP, asP, hs2P, as2P] = teamGoalProbs({ x: [h, d, a], o25 });
          const opts: [Match['pick']['market'], number][] = [
            ['HS', hsP],
            ['AS', asP],
            ['HS2', hs2P],
            ['AS2', as2P],
          ];
          const [mk, pp] = opts[hash(key + 'tgm') % 4][1] >= 55 ? opts[hash(key + 'tgm') % 4] : h >= a ? opts[0] : opts[1];
          pick = { market: mk, outcome: 'yes', p: pp };
        } else if (h >= 52) pick = { market: '1X2', outcome: 'home', p: h };
        else if (a >= 45) pick = { market: '1X2', outcome: 'away', p: a };
        else if (h + d >= 72) pick = { market: 'DC', outcome: '1X', p: h + d };
        else if (o25 >= 60) pick = { market: 'OU25', outcome: 'over', p: o25 };
        else if (o25 <= 40) pick = { market: 'OU35', outcome: 'under', p: Math.min(85, 100 - o25 + 12) };
        else if (btts >= 60) pick = { market: 'BTTS', outcome: 'yes', p: btts };
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

export const SAMPLE_MATCHES: Match[] = [...BASE_MATCHES, ...generateMatches()].sort(
  (a, b) => a.day - b.day || a.time.localeCompare(b.time),
);
