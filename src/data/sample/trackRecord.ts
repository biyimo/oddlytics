/* SAMPLE track record figures. Real figures come from your settled-picks store. */
export type RecordRange = '30 days' | '90 days' | 'All time';

export const TRACK_RECORD: Record<
  RecordRange,
  { n: number; w: number; brier: string; base: string; range: string; months: [string, number, number][] }
> = {
  '30 days': {
    n: 118,
    w: 66,
    brier: '0.209',
    base: '0.228',
    range: '26 Oct – 24 Nov 2026',
    months: [
      ['Oct', 14, 11],
      ['Nov', 52, 41],
    ],
  },
  '90 days': {
    n: 412,
    w: 225,
    brier: '0.214',
    base: '0.231',
    range: '1 Aug – 24 Nov 2026',
    months: [
      ['Aug', 49, 38],
      ['Sep', 61, 47],
      ['Oct', 63, 58],
      ['Nov', 52, 44],
    ],
  },
  'All time': {
    n: 1206,
    w: 641,
    brier: '0.218',
    base: '0.233',
    range: '3 Jan – 24 Nov 2026',
    months: [
      ['Q1', 141, 129],
      ['Q2', 158, 137],
      ['Q3', 171, 150],
      ['Q4', 171, 149],
    ],
  },
};

export const BY_MARKET: [string, number, number][] = [
  ['Match result', 54, 168],
  ['Double chance', 71, 64],
  ['Total goals', 56, 121],
  ['Both teams to score', 52, 59],
];

export const TEASER = { correct: 225, total: 412, period: '1 Aug – 24 Nov 2026' };
