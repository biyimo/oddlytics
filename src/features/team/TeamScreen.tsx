import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Crest } from '../../components/Crest';
import { MatchCard } from '../../components/MatchCard';
import { Screen } from '../../components/Screen';
import { StandingsTable } from '../../components/StandingsTable';
import { Button, FormChip, Notice, SectionHead } from '../../components/ui';
import { teamSeasonStats } from '../../data/sample/insights';
import { useApp } from '../../state/AppProvider';
import { useData } from '../../state/DataProvider';
import { s } from '../../theme/styles';
import { dateFor, ordinal } from '../../utils/dates';

export default function TeamScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = String(rawId);
  const { followTeams, toggleTeam, openComp } = useApp();
  const { team, comp: compOf, teamComp, standings, matches } = useData();
  const t = team(id);
  const comp = teamComp(id);
  const table = standings(comp);
  const row = table.find((r) => r.id === id);
  if (!row) {
    return (
      <Screen title="Team">
        <Text style={s.teamHeroName}>{t.name}</Text>
        <Notice text="No table or season stats for this team yet." />
      </Screen>
    );
  }
  const pos = table.indexOf(row) + 1;
  const games = matches.filter((m) => m.home === id || m.away === id);
  const upcoming = games.filter((m) => m.status !== 'finished').sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
  const recent = games.filter((m) => m.status === 'finished').sort((a, b) => b.day - a.day);
  const on = followTeams.includes(id);
  const stats = teamSeasonStats(id, row);
  return (
    <Screen title="Team">
      <View style={s.teamHero}>
        <Crest id={id} size={72} />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={s.teamHeroName}>{t.name}</Text>
          <Pressable accessibilityRole="button" onPress={() => openComp(comp, 'Standings')}>
            <Text style={s.link}>
              {compOf(comp).name} · {ordinal(pos)} · {row.pts} pts
            </Text>
          </Pressable>
        </View>
      </View>
      <Button
        kind={on ? 'secondary' : 'primary'}
        icon={on ? 'star' : 'star-outline'}
        label={on ? 'Following' : 'Follow team'}
        onPress={() => toggleTeam(id)}
      />
      <SectionHead title="Form" sub="Last 5, most recent on the right" />
      <View style={s.panel}>
        <View style={s.formRow}>
          {row.form.map((r, i) => (
            <View key={i} style={s.formItem}>
              <FormChip r={r} />
              <Text style={s.formDate}>{dateFor(-7 * (5 - i)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Text>
            </View>
          ))}
        </View>
      </View>
      <SectionHead
        title="League standing"
        sub={`${compOf(comp).name} · ${ordinal(pos)} of ${table.length}`}
        action="Full table"
        onAction={() => openComp(comp, 'Standings')}
      />
      <View style={s.panel}>
        <StandingsTable
          rows={table
            .map((r, i) => ({ r, pos: i + 1 }))
            .filter(({ pos: p }) => Math.abs(p - pos) <= 2 || (pos <= 3 && p <= 5) || (pos > table.length - 3 && p > table.length - 5))}
          highlight={(x) => x === id}
          disabledId={id}
        />
      </View>
      <SectionHead title="Season stats" sub={`${compOf(comp).name} 2026/27 · sample`} />
      <View style={s.panel}>
        {stats.map(([k, v]) => (
          <View key={k} style={s.kvRow}>
            <Text style={s.listSub}>{k}</Text>
            <Text style={s.kvValue}>{v}</Text>
          </View>
        ))}
      </View>
      {upcoming.length ? (
        <>
          <SectionHead title="Upcoming and predictions" />
          {upcoming.map((m) => (
            <MatchCard key={m.id} m={m} showDay />
          ))}
        </>
      ) : null}
      {recent.length ? (
        <>
          <SectionHead title="Recent results" sub="With our pick as published" />
          {recent.map((m) => (
            <MatchCard key={m.id} m={m} showDay />
          ))}
        </>
      ) : null}
    </Screen>
  );
}
