import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { MatchCard } from '../../components/MatchCard';
import { Screen } from '../../components/Screen';
import { StandingsTable } from '../../components/StandingsTable';
import { Button, Flag, Notice, Segmented } from '../../components/ui';
import { compSeasonStats } from '../../data/sample/insights';
import { useApp } from '../../state/AppProvider';
import { useData } from '../../state/DataProvider';
import { s } from '../../theme/styles';
import type { CompTab } from '../../types';
import { longDate } from '../../utils/dates';
import { settle } from '../../utils/markets';

const TABS: CompTab[] = ['Predictions', 'Standings', 'Season stats'];

export default function CompetitionScreen() {
  const params = useLocalSearchParams<{ id: string; tab?: string }>();
  const c = String(params.id);
  const [compTab, setCompTab] = useState<CompTab>(TABS.includes(params.tab as CompTab) ? (params.tab as CompTab) : 'Predictions');
  const { followComps, followTeams, toggleComp } = useApp();
  const { comp: compOf, standings, matches, team } = useData();
  const comp = compOf(c);
  const table = standings(c);
  const games = matches.filter((m) => m.comp === c);
  const upcoming = games.filter((m) => m.status !== 'finished').sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
  const finished = games.filter((m) => m.status === 'finished');
  const correct = finished.filter((m) => settle(m) === 'won').length;
  const on = followComps.includes(c);
  const totalGoals = table.reduce((a, r) => a + r.gf, 0);
  const totalGames = table.reduce((a, r) => a + r.p, 0) / 2;
  const season = compSeasonStats(c);
  const byAttack = [...table].sort((a, b) => b.gf - a.gf)[0];
  const byDefence = [...table].sort((a, b) => a.ga - b.ga)[0];
  return (
    <Screen title="League">
      <View style={s.teamHero}>
        <Flag big country={comp.country} />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={s.teamHeroName}>{comp.name}</Text>
          <Text style={s.listSub}>{comp.country} · 2026/27 season</Text>
        </View>
      </View>
      <Button
        kind={on ? 'secondary' : 'primary'}
        icon={on ? 'star' : 'star-outline'}
        label={on ? 'Following' : 'Follow league'}
        onPress={() => toggleComp(c)}
      />
      <Segmented role="tab" options={TABS} value={compTab} onChange={setCompTab} style={{ marginTop: 14 }} />
      {compTab === 'Predictions' ? (
        upcoming.length ? (
          <>
            {[...new Set(upcoming.map((m) => m.day))].map((d) => (
              <View key={d}>
                <Text style={s.groupLabel}>{longDate(d)}</Text>
                {upcoming
                  .filter((m) => m.day === d)
                  .map((m) => (
                    <MatchCard key={m.id} m={m} />
                  ))}
              </View>
            ))}
            {finished.length ? (
              <Notice
                icon="fact-check"
                text={`Recent record in ${comp.name}: ${correct} of ${finished.length} top picks correct in the last 3 days (sample).`}
              />
            ) : null}
          </>
        ) : (
          <Notice text="No upcoming fixtures in the sample data." />
        )
      ) : compTab === 'Standings' ? (
        <View style={s.panel}>
          <StandingsTable
            rows={table.map((r, i) => ({ r, pos: i + 1 }))}
            highlight={(id) => followTeams.includes(id)}
            accentPos={(pos) => pos <= 4}
            boldHighlight={false}
          />
          <Text style={[s.meta, { marginTop: 10 }]}>Top 4 highlighted. Tap a team for its stats. Sample table.</Text>
        </View>
      ) : (
        <>
          <View style={s.metrics}>
            <View style={s.metric}>
              <Text style={s.metricValue}>{totalGames ? (totalGoals / totalGames).toFixed(2) : '–'}</Text>
              <Text style={s.metricLabel}>Goals per game</Text>
            </View>
            <View style={s.metric}>
              <Text style={s.metricValue}>{season.homeWins}%</Text>
              <Text style={s.metricLabel}>Home wins</Text>
            </View>
          </View>
          <View style={s.panel}>
            {[
              ...season.rows,
              ['Best attack', byAttack ? `${team(byAttack.id).name} · ${byAttack.gf} goals` : '–'],
              ['Best defence', byDefence ? `${team(byDefence.id).name} · ${byDefence.ga} conceded` : '–'],
            ].map(([k, v]) => (
              <View key={k} style={s.kvRow}>
                <Text style={s.listSub}>{k}</Text>
                <Text style={s.kvValue}>{v}</Text>
              </View>
            ))}
          </View>
          <Text style={s.meta}>Season to date, sample figures.</Text>
        </>
      )}
    </Screen>
  );
}
