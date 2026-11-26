import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Crest } from '../../components/Crest';
import { MatchCard } from '../../components/MatchCard';
import { Screen } from '../../components/Screen';
import { Button, Icon } from '../../components/ui';
import { useApp } from '../../state/AppProvider';
import { useData } from '../../state/DataProvider';
import { C } from '../../theme/colors';
import { s } from '../../theme/styles';
import { dayLabel } from '../../utils/dates';

export default function FavouritesScreen() {
  const { savedIds, favSegment, setFavSegment, reminders, goTab, followTeams, followComps, toggleTeam, toggleComp, openTeam, openComp } =
    useApp();
  const { matches, teamIds, team, comp, compOrder } = useData();
  const savedMatches = matches.filter((m) => savedIds.includes(m.id));
  return (
    <Screen tab>
      <Text style={s.pageTitle}>Favourites</Text>
      <View style={s.segment}>
        {(['Matches', 'Teams', 'Competitions'] as const).map((t) => (
          <Pressable
            key={t}
            accessibilityRole="tab"
            accessibilityState={{ selected: favSegment === t }}
            onPress={() => setFavSegment(t)}
            style={[s.segItem, favSegment === t && s.segItemOn]}
          >
            <Text style={[s.segText, favSegment === t && s.segTextOn]}>{t}</Text>
          </Pressable>
        ))}
      </View>
      {favSegment === 'Matches' ? (
        savedMatches.length ? (
          <>
            <Text style={s.resultText}>
              {savedMatches.length} saved · kick-off reminders {reminders ? 'on' : 'off'}
            </Text>
            {savedMatches.map((m) => (
              <MatchCard key={m.id} m={m} showDay />
            ))}
          </>
        ) : (
          <View style={s.empty}>
            <Icon name="favorite-border" size={34} color={C.accent} />
            <Text style={s.emptyTitle}>No saved matches yet</Text>
            <Text style={s.emptyBody}>Tap the heart on any match to keep it here.</Text>
            <Button small kind="secondary" label="Browse matches" onPress={() => goTab('All matches')} />
          </View>
        )
      ) : favSegment === 'Teams' ? (
        <>
          <Text style={s.resultText}>Following {followTeams.length} teams · tap a team for stats</Text>
          {teamIds
            .sort((a, b) => Number(followTeams.includes(b)) - Number(followTeams.includes(a)))
            .map((id) => {
              const next = matches
                .filter((m) => (m.home === id || m.away === id) && m.status !== 'finished')
                .sort((a, b) => a.day - b.day)[0];
              const on = followTeams.includes(id);
              return (
                <View key={id} style={s.listRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${team(id).name}`}
                    onPress={() => openTeam(id)}
                    style={s.rowLink}
                  >
                    <Crest id={id} size={34} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={s.listTitle}>{team(id).name}</Text>
                      <Text style={s.listSub} numberOfLines={1}>
                        {next
                          ? `Next: ${dayLabel(next.day)} ${next.time} v ${team(next.home === id ? next.away : next.home).name}`
                          : 'No upcoming sample fixture'}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={on ? `Unfollow ${team(id).name}` : `Follow ${team(id).name}`}
                    onPress={() => toggleTeam(id)}
                    style={[s.followBtn, on && s.followBtnOn]}
                  >
                    <Text style={[s.followText, on && { color: C.accent }]}>{on ? 'Following' : 'Follow'}</Text>
                  </Pressable>
                </View>
              );
            })}
        </>
      ) : (
        <>
          <Text style={s.resultText}>Followed competitions appear first on Bankers</Text>
          {compOrder.map((c) => {
            const on = followComps.includes(c);
            return (
              <View key={c} style={s.listRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${comp(c).name}`}
                  onPress={() => openComp(c, 'Predictions')}
                  style={s.rowLink}
                >
                  <View style={s.flag}>
                    <Text style={s.flagText}>{comp(c).country.slice(0, 3).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.listTitle}>{comp(c).name}</Text>
                    <Text style={s.listSub}>
                      {comp(c).country} · {matches.filter((m) => m.comp === c && m.status !== 'finished').length} upcoming · tap for table
                    </Text>
                  </View>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => toggleComp(c)} style={[s.followBtn, on && s.followBtnOn]}>
                  <Text style={[s.followText, on && { color: C.accent }]}>{on ? 'Following' : 'Follow'}</Text>
                </Pressable>
              </View>
            );
          })}
        </>
      )}
    </Screen>
  );
}
