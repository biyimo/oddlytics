/* Bottom sheets: filters, calendar, betting terms and the More menu. */
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Button, Chip, Icon, type IconName } from '../../components/ui';
import { DragSheet } from '../../components/DragSheet';
import { BRAND } from '../../config/brand';
import { DEFAULT_FILTERS, useApp } from '../../state/AppProvider';
import { useData } from '../../state/DataProvider';
import { C } from '../../theme/colors';
import { s } from '../../theme/styles';
import type { MarketGroup } from '../../types';
import { dateFor } from '../../utils/dates';
import { GLOSSARY } from '../../utils/markets';
import { applyFilters, useExploreBase } from '../matches/explore';

function FilterSheet() {
  const { draft, setDraft, setFilters, setSheet } = useApp();
  const { compOrder, comp } = useData();
  const draftCount = applyFilters(draft, useExploreBase()).length;
  return (
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
            <Chip
              key={st}
              label={st === 'all' ? 'Any' : st[0].toUpperCase() + st.slice(1)}
              selected={draft.status === st}
              onPress={() => setDraft({ ...draft, status: st })}
            />
          ))}
        </View>
        <Text style={s.fieldLabel}>Prediction market</Text>
        <View style={s.wrap}>
          {(['Result', 'Double chance', 'Goals', 'BTTS', 'Team goals'] as MarketGroup[]).map((g) => (
            <Chip
              key={g}
              label={g}
              selected={draft.groups.includes(g)}
              onPress={() =>
                setDraft({ ...draft, groups: draft.groups.includes(g) ? draft.groups.filter((x) => x !== g) : [...draft.groups, g] })
              }
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
          {compOrder.map((c) => (
            <Chip
              key={c}
              label={comp(c).name}
              selected={draft.comps.includes(c)}
              onPress={() =>
                setDraft({ ...draft, comps: draft.comps.includes(c) ? draft.comps.filter((x) => x !== c) : [...draft.comps, c] })
              }
            />
          ))}
        </View>
        <Text style={s.fieldLabel}>Sort by</Text>
        <View style={s.segment}>
          {(['league', 'time', 'probability'] as const).map((so) => (
            <Pressable
              key={so}
              accessibilityRole="button"
              accessibilityState={{ selected: draft.sort === so }}
              onPress={() => setDraft({ ...draft, sort: so })}
              style={[s.segItem, draft.sort === so && s.segItemOn]}
            >
              <Text style={[s.segText, draft.sort === so && s.segTextOn]}>
                {so === 'league' ? 'Competition' : so === 'time' ? 'Kick-off' : 'Estimate'}
              </Text>
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
}

function CalendarSheet() {
  const { calMonth, setCalMonth, day, setDay, setQuery, setSheet } = useApp();
  const { matches } = useData();
  const y = calMonth.getFullYear();
  const mo = calMonth.getMonth();
  const first = (new Date(y, mo, 1).getDay() + 6) % 7;
  const days = new Date(y, mo + 1, 0).getDate();
  const today = dateFor(0);
  const selected = dateFor(day);
  return (
    <>
      <>
        <View style={s.sheetHead}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            onPress={() => setCalMonth(new Date(y, mo - 1, 1))}
            style={s.iconBtn}
          >
            <Icon name="chevron-left" size={22} color={C.accent} />
          </Pressable>
          <Text style={s.sheetTitle}>{calMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next month"
            onPress={() => setCalMonth(new Date(y, mo + 1, 1))}
            style={s.iconBtn}
          >
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
            const has = matches.some((m) => m.day === offset);
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
        <Text style={s.meta}>Dots mark days with fixtures.</Text>
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
    </>
  );
}

function GlossarySheet() {
  const { setSheet } = useApp();
  return (
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
}

function MenuSheet() {
  const { setSheet, openLeagues, openRecord, openPremium, openPage } = useApp();
  return (
    <>
      <View style={s.sheetHead}>
        <Text style={s.sheetTitle}>More</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Close menu" onPress={() => setSheet(null)} style={s.iconBtn}>
          <Icon name="close" size={20} color={C.text} />
        </Pressable>
      </View>
      {(
        [
          ['public', 'Competitions', openLeagues],
          ['insights', 'Track record', openRecord],
          ['workspace-premium', BRAND.plusName, openPremium],
          ['lightbulb-outline', 'How it works', () => openPage('how')],
          ['menu-book', 'Betting terms', () => setTimeout(() => setSheet('glossary'), 50)],
          ['volunteer-activism', 'Play responsibly', () => openPage('responsible')],
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
}

/** Renders whichever sheet is open, above everything else. */
export function Sheets() {
  const { sheet, setSheet } = useApp();
  if (!sheet) return null;
  return (
    <DragSheet key={sheet} onClose={() => setSheet(null)}>
      {sheet === 'filters' ? (
        <FilterSheet />
      ) : sheet === 'calendar' ? (
        <CalendarSheet />
      ) : sheet === 'glossary' ? (
        <GlossarySheet />
      ) : (
        <MenuSheet />
      )}
    </DragSheet>
  );
}
