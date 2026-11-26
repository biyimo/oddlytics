import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useApp } from '../state/AppProvider';
import { useData } from '../state/DataProvider';
import { C } from '../theme/colors';
import { s } from '../theme/styles';
import type { StandingRow } from '../types';
import { Crest } from './Crest';

/**
 * League table. `rows` may be an excerpt; `pos` is each row's position in the full table.
 * Highlighted rows get the accent background; `accentPos` colours the position number.
 */
export function StandingsTable({
  rows,
  highlight = () => false,
  accentPos,
  boldHighlight = true,
  disabledId,
}: {
  rows: { r: StandingRow; pos: number }[];
  highlight?: (id: string) => boolean;
  accentPos?: (pos: number, id: string) => boolean;
  boldHighlight?: boolean;
  disabledId?: string;
}) {
  const { openTeam } = useApp();
  const { team } = useData();
  return (
    <>
      <View style={s.tableRow}>
        <Text style={[s.tableHead, s.cPos]}>#</Text>
        <Text style={[s.tableHead, { flex: 1 }]}>Team</Text>
        {['P', 'W', 'D', 'L', 'GD', 'Pts'].map((h) => (
          <Text key={h} style={[s.tableHead, s.cNum]}>
            {h}
          </Text>
        ))}
      </View>
      {rows.map(({ r, pos }) => {
        const hl = highlight(r.id);
        const accent = accentPos ? accentPos(pos, r.id) : hl;
        return (
          <Pressable
            key={r.id}
            accessibilityRole="button"
            accessibilityLabel={`${pos}, ${team(r.id).name}, ${r.pts} points`}
            disabled={r.id === disabledId}
            onPress={() => openTeam(r.id)}
            style={[s.tableRow, hl && { backgroundColor: C.accentSoft, borderRadius: 8 }]}
          >
            <Text style={[s.tableCell, s.cPos, accent && { color: C.accent, fontWeight: '800' }]}>{pos}</Text>
            <View style={[s.row, { flex: 1, gap: 8 }]}>
              <Crest id={r.id} size={20} />
              <Text style={[s.tableCell, { flex: 1 }, hl && boldHighlight && { fontWeight: '800' }]} numberOfLines={1}>
                {team(r.id).name}
              </Text>
            </View>
            {[r.p, r.w, r.d, r.l, r.gf - r.ga, r.pts].map((v, k) => (
              <Text key={k} style={[s.tableCell, s.cNum, k === 5 && { fontWeight: '800' }]}>
                {k === 4 && v > 0 ? `+${v}` : v}
              </Text>
            ))}
          </Pressable>
        );
      })}
    </>
  );
}
