/* Design tokens. Dark UI with a purple accent, as in the prototype and UI/UX spec. */
export const C = {
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
} as const;

/* Gradient behind every screen. */
export const SCREEN_GRADIENT = ['#000000', '#111111', '#050505'] as const;
