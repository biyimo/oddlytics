import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Flag, Icon } from '../../components/ui';
import { DEFAULT_FILTERS, useApp } from '../../state/AppProvider';
import { useData } from '../../state/DataProvider';
import { C } from '../../theme/colors';
import { s } from '../../theme/styles';

/* Competitions grouped by region. Tapping one filters All matches to it. */
const COMING_SOON = ['Ghana Premier League', 'South African PSL', 'Egyptian Premier League', 'Eredivisie', 'MLS', 'AFCON qualifiers'];

export default function CompetitionsScreen() {
  const { setFilters, setQuery, goTab } = useApp();
  const { compOrder, comp, matches } = useData();
  const regions = [...new Set(compOrder.map((c) => comp(c).region))];
  return (
    <Screen title="Competitions">
      <Text style={s.pageTitle}>Competitions</Text>
      <Text style={s.lead}>
        The goal is the same breadth of leagues as the big score apps. Each competition is switched on once its data is verified.
      </Text>
      {regions.map((r) => (
        <View key={r}>
          <Text style={s.groupLabel}>{r}</Text>
          <View style={s.settings}>
            {compOrder
              .filter((c) => comp(c).region === r)
              .map((c) => (
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
                  <Flag country={comp(c).country} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.listTitle}>{comp(c).name}</Text>
                    <Text style={s.listSub}>
                      {matches.filter((m) => m.comp === c && m.status !== 'finished').length} upcoming ·{' '}
                      {comp(c).xg ? 'full stats' : 'core stats'}
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
        {COMING_SOON.map((n) => (
          <View key={n} style={[s.chip, { opacity: 0.6 }]}>
            <Text style={s.chipText}>{n}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
