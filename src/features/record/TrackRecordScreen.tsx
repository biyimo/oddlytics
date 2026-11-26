import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MatchCard } from '../../components/MatchCard';
import { Screen } from '../../components/Screen';
import { Icon, Notice, SectionHead } from '../../components/ui';
import { BY_MARKET, type RecordRange, TRACK_RECORD } from '../../data/sample/trackRecord';
import { useData } from '../../state/DataProvider';
import { C } from '../../theme/colors';
import { s } from '../../theme/styles';

export default function TrackRecordScreen() {
  const [recordRange, setRecordRange] = useState<RecordRange>('90 days');
  const [recordTable, setRecordTable] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const { matches } = useData();
  const data = TRACK_RECORD[recordRange];
  const pct = ((data.w / data.n) * 100).toFixed(1);
  const maxTotal = Math.max(...data.months.map(([, w, l]) => w + l));
  const settled = matches.filter((m) => m.status === 'finished').sort((a, b) => b.day - a.day);
  return (
    <Screen title="Track record">
      <Text style={s.pageTitle}>Track record</Text>
      <Text style={s.lead}>
        Every published top pick, settled against fixed rules. Losses, voids and postponements stay in. Sample figures.
      </Text>
      <View style={s.segment}>
        {(['30 days', '90 days', 'All time'] as const).map((r) => (
          <Pressable
            key={r}
            accessibilityRole="button"
            accessibilityState={{ selected: recordRange === r }}
            onPress={() => setRecordRange(r)}
            style={[s.segItem, recordRange === r && s.segItemOn]}
          >
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
      <Text style={[s.meta, { marginBottom: 14 }]}>
        Period: {data.range}. A correct-pick rate is not profit: it ignores prices and stakes.
      </Text>
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
        {BY_MARKET.map(([k, r, n]) => (
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
      {settled.map((m) => (
        <MatchCard key={m.id} m={m} showDay />
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: rulesOpen }}
        onPress={() => setRulesOpen(!rulesOpen)}
        style={s.settingRow}
      >
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
    </Screen>
  );
}
