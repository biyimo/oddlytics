import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Crest } from '../../components/Crest';
import { MatchCard } from '../../components/MatchCard';
import { EmptyDay, GroupedMatches } from '../../components/MatchLists';
import { Screen } from '../../components/Screen';
import { Button, Chip, Icon, LivePulse, SectionHead } from '../../components/ui';
import { DEFAULT_FILTERS, useApp } from '../../state/AppProvider';
import { useData } from '../../state/DataProvider';
import { C } from '../../theme/colors';
import { s } from '../../theme/styles';
import { longDate } from '../../utils/dates';
import { useExploreList } from './explore';

/** Horizontal strip of matches in play right now. Shown on today's date only. */
function LiveNow() {
  const { day, query, openMatch } = useApp();
  const { matches, team, comp } = useData();
  const liveNow = matches.filter((m) => m.status === 'live' && m.day === 0);
  if (!liveNow.length || day !== 0 || query) return null;
  return (
    <>
      <SectionHead title="Live now" sub={`${liveNow.length} matches in play`} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -18 }}
        contentContainerStyle={{ paddingHorizontal: 18, gap: 10 }}
      >
        {liveNow.map((m) => (
          <Pressable key={m.id} accessibilityRole="button" onPress={() => openMatch(m)} style={s.liveCard}>
            <View style={s.liveRow}>
              <LivePulse />
              <Text style={s.liveText}>LIVE {m.minute}′</Text>
              <Text style={s.liveComp} numberOfLines={1}>
                {comp(m.comp).name}
              </Text>
            </View>
            {[m.home, m.away].map((id, i) => (
              <View key={id} style={[s.teamLine, { marginTop: 8 }]}>
                <Crest id={id} size={20} />
                <Text style={s.teamName} numberOfLines={1}>
                  {team(id).name}
                </Text>
                <Text style={[s.score, { color: C.text }]}>{m.score?.[i]}</Text>
              </View>
            ))}
          </Pressable>
        ))}
      </ScrollView>
      <View style={{ height: 12 }} />
    </>
  );
}

function CollapseBar({ comps }: { comps: string[] }) {
  const { collapsed, setCollapsed } = useApp();
  const allCollapsed = comps.every((c) => collapsed.includes(c));
  return (
    <View style={s.collapseBar}>
      <Text style={s.collapseText}>
        {comps.length} {comps.length === 1 ? 'league' : 'leagues'}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={allCollapsed ? 'Expand all leagues' : 'Collapse all leagues'}
        onPress={() => setCollapsed(allCollapsed ? [] : comps)}
        style={s.collapseBtn}
      >
        <Icon name={allCollapsed ? 'unfold-more' : 'unfold-less'} size={18} color={C.accent} />
        <Text style={s.link}>{allCollapsed ? 'Expand all' : 'Collapse all'}</Text>
      </Pressable>
    </View>
  );
}

export default function AllMatchesScreen() {
  const { searchRef, query, setQuery, filters, setFilters, setDraft, setSheet, liveOnly, setLiveOnly, day, openLeagues } = useApp();
  const { matches, comp, compOrder } = useData();
  const exploreList = useExploreList();
  const activeFilterCount = (filters.status !== 'all' ? 1 : 0) + filters.groups.length + (filters.minP ? 1 : 0) + filters.comps.length;
  return (
    <Screen tab rail showDate>
      <LiveNow />
      <View style={s.search}>
        <Icon name="search" size={20} color={C.muted} />
        <TextInput
          ref={searchRef}
          value={query}
          onChangeText={setQuery}
          placeholder="Search teams, competitions, countries"
          placeholderTextColor={C.faint}
          style={s.searchInput}
          accessibilityLabel="Search teams, competitions or countries"
          returnKeyType="search"
        />
        {query ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={10}>
            <Icon name="cancel" size={20} color={C.muted} />
          </Pressable>
        ) : null}
      </View>
      <View style={s.toolbar}>
        <Chip
          label="Filters"
          icon="tune"
          count={activeFilterCount}
          selected={activeFilterCount > 0}
          onPress={() => {
            setDraft(filters);
            setSheet('filters');
          }}
        />
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: liveOnly }}
          onPress={() => setLiveOnly(!liveOnly)}
          style={[s.chip, liveOnly && { backgroundColor: C.liveSoft, borderColor: C.live }]}
        >
          {liveOnly ? <LivePulse /> : <View style={[s.liveDot, { backgroundColor: C.faint }]} />}
          <Text style={[s.chipText, liveOnly && { color: C.live }]}>Live only</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Betting terms explained"
          onPress={() => setSheet('glossary')}
          style={s.iconBtn}
        >
          <Icon name="help-outline" size={20} color={C.accent} />
        </Pressable>
      </View>
      {activeFilterCount ? (
        <View style={s.wrap}>
          {filters.status !== 'all' ? (
            <Chip
              removable
              selected
              label={filters.status[0].toUpperCase() + filters.status.slice(1)}
              onPress={() => setFilters({ ...filters, status: 'all' })}
            />
          ) : null}
          {filters.groups.map((g) => (
            <Chip
              key={g}
              removable
              selected
              label={g}
              onPress={() => setFilters({ ...filters, groups: filters.groups.filter((x) => x !== g) })}
            />
          ))}
          {filters.minP ? (
            <Chip removable selected label={`${filters.minP}%+`} onPress={() => setFilters({ ...filters, minP: 0 })} />
          ) : null}
          {filters.comps.map((c) => (
            <Chip
              key={c}
              removable
              selected
              label={comp(c).name}
              onPress={() => setFilters({ ...filters, comps: filters.comps.filter((x) => x !== c) })}
            />
          ))}
          <Pressable accessibilityRole="button" onPress={() => setFilters(DEFAULT_FILTERS)} style={s.clearAll}>
            <Text style={s.link}>Clear all</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={s.resultLine}>
        <Text style={s.resultText}>
          {exploreList.length} {exploreList.length === 1 ? 'match' : 'matches'}
          {query ? ` for “${query}” across all dates` : ` · ${longDate(day)}`}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Sorted by ${filters.sort}. Change sort.`}
          onPress={() =>
            setFilters({ ...filters, sort: filters.sort === 'league' ? 'time' : filters.sort === 'time' ? 'probability' : 'league' })
          }
          style={s.linkWrap}
        >
          <Icon name="swap-vert" size={16} color={C.accent} />
          <Text style={s.link}>
            {filters.sort === 'league' ? 'By competition' : filters.sort === 'time' ? 'By kick-off' : 'By estimate'}
          </Text>
        </Pressable>
      </View>
      {exploreList.length === 0 ? (
        !query && matches.filter((m) => m.day === day).length === 0 ? (
          <EmptyDay />
        ) : (
          <View style={s.empty}>
            <Icon name="search-off" size={34} color={C.accent} />
            <Text style={s.emptyTitle}>No matches fit these choices</Text>
            <Text style={s.emptyBody}>Remove a filter, turn off Live only, or search a different team.</Text>
            <Button
              small
              kind="secondary"
              label="Reset search and filters"
              onPress={() => {
                setQuery('');
                setLiveOnly(false);
                setFilters(DEFAULT_FILTERS);
              }}
            />
          </View>
        )
      ) : filters.sort === 'league' ? (
        <>
          <CollapseBar comps={compOrder.filter((c) => exploreList.some((m) => m.comp === c))} />
          <GroupedMatches list={exploreList} showDay={!!query} />
        </>
      ) : (
        exploreList.map((m) => (
          <View key={m.id}>
            <Text style={s.inlineComp}>{comp(m.comp).name}</Text>
            <MatchCard m={m} showDay={!!query} />
          </View>
        ))
      )}
      <Pressable accessibilityRole="button" onPress={openLeagues} style={s.recordTeaser}>
        <Icon name="public" size={24} color={C.accent} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.cardTitle}>Browse competitions</Text>
          <Text style={s.body}>Coverage grows as each data source is verified.</Text>
        </View>
        <Icon name="chevron-right" size={24} color={C.accent} />
      </Pressable>
    </Screen>
  );
}
