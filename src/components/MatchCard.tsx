import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useApp } from '../state/AppProvider';
import { useData } from '../state/DataProvider';
import { C, probColor } from '../theme/colors';
import { s } from '../theme/styles';
import type { Match } from '../types';
import { shortDay } from '../utils/dates';
import { MARKET_NAME, pickCode, settle } from '../utils/markets';
import { Crest } from './Crest';
import { Glass } from './Glass';
import { Icon, LivePulse, ResultBadge, TipBadge } from './ui';

/** The standard match row: status, both teams, our estimate and the pick. */
export function MatchCard({ m, showDay }: { m: Match; showDay?: boolean }) {
  const { locked, savedIds, openMatch, toggleSaved } = useApp();
  const { team, pickText } = useData();
  const opts = { showDay };
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
      accessibilityRole="button"
      accessibilityLabel={`${team(m.home).name} versus ${team(m.away).name}, ${
        m.status === 'live'
          ? `live, ${m.score?.join(' to ')}`
          : m.status === 'finished'
            ? `full time ${m.score?.join(' to ')}`
            : `kick-off ${m.time}`
      }. ${isLocked ? 'Premium insight' : `Tip ${pickCode(m)}, ${pickText(m)}, ${m.pick.p} percent`}${result ? `, prediction ${result === 'won' ? 'correct' : 'missed'}` : ''}`}
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
              {m.score ? <Text style={[s.score, m.status === 'live' && { color: C.live }]}>{m.score[i]}</Text> : null}
            </View>
          ))}
        </View>
        <View style={s.cardProb}>
          {isLocked ? (
            <Glass overlay={<Icon name="lock" size={18} color={C.accent} />} style={s.lockProb}>
              <Text style={[s.probValue, { color: probColor(m.pick.p) }]}>{m.pick.p}%</Text>
              <Text style={s.probCaption}>estimate</Text>
            </Glass>
          ) : (
            <>
              <Text style={[s.probValue, m.estimate !== 'pending' && { color: probColor(m.pick.p) }]}>
                {m.estimate === 'pending' ? '…' : `${m.pick.p}%`}
              </Text>
              <Text style={s.probCaption}>{m.estimate === 'pending' ? 'loading' : 'estimate'}</Text>
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
              <View style={[s.row, { gap: 8, paddingVertical: 4 }]}>
                <TipBadge code={pickCode(m)} />
                <Text style={[s.pickLine, { flex: 1 }]} numberOfLines={1}>
                  {MARKET_NAME[m.pick.market]}
                </Text>
              </View>
            </Glass>
          ) : (
            <View style={[s.row, { gap: 8 }]}>
              <TipBadge code={pickCode(m)} />
              <Text style={[s.pickLine, { flex: 1 }]} numberOfLines={1}>
                {MARKET_NAME[m.pick.market]}
              </Text>
            </View>
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
}
