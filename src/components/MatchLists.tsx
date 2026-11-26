import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useApp } from '../state/AppProvider';
import { useData } from '../state/DataProvider';
import { C } from '../theme/colors';
import { s } from '../theme/styles';
import type { Match } from '../types';
import { dateFor, dayLabel, longDate, railLabel } from '../utils/dates';
import { MatchCard } from './MatchCard';
import { Button, Flag, Icon } from './ui';

/** Sticky row of dates (three days either side of today) plus the calendar button. */
export function DateRail() {
  const { day, setDay, query, setQuery, setSheet } = useApp();
  const { matches } = useData();
  const offsets = [-3, -2, -1, 0, 1, 2, 3];
  if (!offsets.includes(day)) offsets.push(day);
  return (
    <View style={s.railWrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail}>
        {offsets.map((o) => {
          const on = o === day && !query;
          const has = matches.some((m) => m.day === o);
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
              <Text style={[s.railTop, on && s.railTextOn]}>{railLabel(o)}</Text>
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
}

/** Matches grouped under collapsible competition headers, in competition order. */
export function GroupedMatches({ list, showDay = false }: { list: Match[]; showDay?: boolean }) {
  const { collapsed, setCollapsed, followComps } = useApp();
  const { compOrder, comp } = useData();
  return (
    <>
      {compOrder
        .filter((c) => list.some((m) => m.comp === c))
        .map((c) => {
          const items = list.filter((m) => m.comp === c);
          const isCollapsed = collapsed.includes(c);
          const info = comp(c);
          return (
            <View key={c} style={s.group}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: !isCollapsed }}
                accessibilityLabel={`${info.name}, ${items.length} matches`}
                onPress={() => setCollapsed((cs) => (isCollapsed ? cs.filter((x) => x !== c) : [...cs, c]))}
                style={s.groupHead}
              >
                <Flag country={info.country} />
                <View style={{ flex: 1 }}>
                  <Text style={s.groupName}>{info.name}</Text>
                  <Text style={s.groupCountry}>{info.country}</Text>
                </View>
                {followComps.includes(c) ? <Icon name="star" size={16} color={C.accent} /> : null}
                <Text style={s.groupCount}>{items.length}</Text>
                <Icon name={isCollapsed ? 'expand-more' : 'expand-less'} size={22} color={C.muted} />
              </Pressable>
              {!isCollapsed && items.map((m) => <MatchCard key={m.id} m={m} showDay={showDay} />)}
            </View>
          );
        })}
    </>
  );
}

export function EmptyDay() {
  const { day, setDay } = useApp();
  return (
    <View style={s.empty}>
      <Icon name="event-busy" size={34} color={C.accent} />
      <Text style={s.emptyTitle}>No fixtures on {longDate(day)}</Text>
      <Text style={s.emptyBody}>Try a nearby date. Fixtures are loaded for three days either side of today.</Text>
      <View style={s.row}>
        <Button small kind="secondary" icon="chevron-left" label={dayLabel(day - 1)} onPress={() => setDay(day - 1)} />
        <View style={{ width: 8 }} />
        <Button small kind="secondary" label="Today" onPress={() => setDay(0)} />
        <View style={{ width: 8 }} />
        <Button small kind="secondary" label={dayLabel(day + 1)} onPress={() => setDay(day + 1)} />
      </View>
    </View>
  );
}
