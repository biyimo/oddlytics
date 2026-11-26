/*
 * SAMPLE catalog: competitions and teams. Replace with your data provider
 * through src/services/api.ts. Colours stand in for crest images.
 */
import type { Competition, Team } from '../../types';
import { hash } from '../../utils/random';

type CompSeed = Omit<Competition, 'id' | 'teamIds'>;

const COMP_SEEDS: Record<string, CompSeed> = {
  npfl: { name: 'NPFL', country: 'Nigeria', region: 'Nigeria', kind: 'league', xg: false, lineups: false },
  cafcl: { name: 'CAF Champions League', country: 'Africa', region: 'Africa', kind: 'cup', xg: false, lineups: true },
  epl: { name: 'Premier League', country: 'England', region: 'Europe', kind: 'league', xg: true, lineups: true },
  laliga: { name: 'LaLiga', country: 'Spain', region: 'Europe', kind: 'league', xg: true, lineups: true },
  seriea: { name: 'Serie A', country: 'Italy', region: 'Europe', kind: 'league', xg: true, lineups: true },
  bundesliga: { name: 'Bundesliga', country: 'Germany', region: 'Europe', kind: 'league', xg: true, lineups: true },
  ligue1: { name: 'Ligue 1', country: 'France', region: 'Europe', kind: 'league', xg: true, lineups: true },
  ucl: { name: 'Champions League', country: 'Europe', region: 'Europe', kind: 'cup', xg: true, lineups: true },
};

/** Display order: Nigeria first, then Africa, then Europe. */
export const SAMPLE_COMP_ORDER = ['npfl', 'cafcl', 'epl', 'laliga', 'seriea', 'bundesliga', 'ligue1', 'ucl'];

export const LEAGUE_TEAMS: Record<string, string[]> = {
  npfl: [
    'enyimba',
    'rivers',
    'remo',
    'kano',
    'rangers',
    'abia',
    'shooting',
    'plateau',
    'kwara',
    'lobi',
    'sunshine',
    'tornadoes',
    'bendel',
    'heartland',
    'ikorodu',
    'katsina',
  ],
  cafcl: ['alahly', 'esttunis', 'wydad', 'sundowns', 'simba', 'mazembe', 'raja', 'petro'],
  epl: [
    'arsenal',
    'newcastle',
    'mancity',
    'liverpool',
    'chelsea',
    'brighton',
    'tottenham',
    'manutd',
    'villa',
    'westham',
    'everton',
    'fulham',
    'forest',
    'bournemouth',
  ],
  laliga: ['realmadrid', 'barcelona', 'atletico', 'sevilla', 'villarreal', 'sociedad', 'betis', 'valencia', 'athletic', 'girona'],
  seriea: ['inter', 'milan', 'juventus', 'napoli', 'roma', 'lazio', 'atalanta', 'fiorentina', 'bologna', 'torino'],
  bundesliga: ['bayern', 'leverkusen', 'dortmund', 'leipzig', 'stuttgart', 'frankfurt', 'freiburg', 'wolfsburg', 'gladbach'],
  ligue1: ['psg', 'marseille', 'monaco', 'lille', 'lyon', 'nice', 'lens', 'rennes', 'nantes'],
  ucl: ['bayern', 'psg', 'realmadrid', 'barcelona', 'arsenal', 'inter', 'benfica', 'porto', 'dortmund', 'liverpool'],
};

const TEAM_SEEDS: Record<string, Omit<Team, 'id' | 'form'>> = {
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

function sampleForm(teamId: string): Team['form'] {
  return Array.from({ length: 5 }, (_, i) => {
    const r = hash(teamId + i) % 10;
    return r < 5 ? 'W' : r < 7 ? 'D' : 'L';
  });
}

export const SAMPLE_COMPETITIONS: Competition[] = SAMPLE_COMP_ORDER.map((id) => ({ id, ...COMP_SEEDS[id], teamIds: LEAGUE_TEAMS[id] }));

export const SAMPLE_TEAMS: Team[] = Object.entries(TEAM_SEEDS).map(([id, t]) => ({ id, ...t, form: sampleForm(id) }));
