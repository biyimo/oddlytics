import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Crest } from '../../components/Crest';
import { MatchCard } from '../../components/MatchCard';
import { EmptyDay } from '../../components/MatchLists';
import { Screen } from '../../components/Screen';
import { Button, Icon, Notice, ResultBadge, SectionHead, TipBadge } from '../../components/ui';
import { BRAND } from '../../config/brand';
import { TEASER } from '../../data/sample/trackRecord';
import { useApp } from '../../state/AppProvider';
import { useData } from '../../state/DataProvider';
import { C } from '../../theme/colors';
import { s } from '../../theme/styles';
import type { Match } from '../../types';
import { ago, dayLabel } from '../../utils/dates';
import { MARKET_NAME, pickCode, settle } from '../../utils/markets';
import { Glass } from '../../components/Glass';

/** Large card for the top two picks of the day. */
function FeatureCard({ m, rank }: { m: Match; rank: number }) {
  const { openMatch } = useApp();
  const { team, comp, pickText } = useData();
  const result = settle(m);
  return (
    <Pressable accessibilityRole="button" onPress={() => openMatch(m)} style={s.feature}>
      <View style={s.featureTop}>
        <Text style={s.eyebrow}>
          #{rank} · {comp(m.comp).name} · {m.status === 'finished' ? 'Full time' : m.status === 'live' ? `Live ${m.minute}′` : m.time}
        </Text>
        {result ? <ResultBadge result={result} /> : <Icon name="north-east" size={18} color={C.accent} />}
      </View>
      <View style={s.featureTeams}>
        <View style={s.featureTeam}>
          <Crest id={m.home} size={44} />
          <Text style={s.featureTeamName} numberOfLines={2}>
            {team(m.home).name}
          </Text>
        </View>
        <Text style={s.featureVs}>{m.score ? m.score.join(' – ') : 'vs'}</Text>
        <View style={s.featureTeam}>
          <Crest id={m.away} size={44} />
          <Text style={s.featureTeamName} numberOfLines={2}>
            {team(m.away).name}
          </Text>
        </View>
      </View>
      <View style={s.featurePick}>
        <View style={{ flex: 1 }}>
          <View style={[s.row, { gap: 10 }]}>
            <TipBadge code={pickCode(m)} size="md" />
            <Text style={[s.featurePickText, { marginTop: 0, flex: 1 }]} numberOfLines={2}>
              {MARKET_NAME[m.pick.market]}
            </Text>
          </View>
        </View>
        <Text style={s.featurePct}>{m.pick.p}%</Text>
      </View>
      <View style={s.meter}>
        <View style={[s.meterFill, { width: `${m.pick.p}%` }]} />
      </View>
      <Text style={s.featureReason}>{m.reason}</Text>
      <Text style={s.meta}>
        {m.status === 'finished'
          ? 'Published before kick-off · kept as originally published'
          : `Updated ${ago(m.updated)} · probability, not certainty`}
      </Text>
    </Pressable>
  );
}

function Picks() {
  const { day, bankersFocus, followComps, followTeams, isPlus, setFavSegment, goTab, openRecord, openPremium } = useApp();
  const { matches } = useData();
  const dayMatches = matches.filter((m) => m.day === day);
  const bankersList = dayMatches.filter((m) =>
    bankersFocus === 'All'
      ? true
      : bankersFocus === 'Nigeria'
        ? m.comp === 'npfl'
        : followComps.includes(m.comp) || followTeams.includes(m.home) || followTeams.includes(m.away),
  );
  const topPicks = [...bankersList]
    .filter((m) => m.pick.p >= 55)
    .sort((a, b) => b.pick.p - a.pick.p)
    .slice(0, 10);
  const freeCount = dayMatches.filter((m) => !m.premium).length;
  return (
    <>
      {dayMatches.length === 0 ? (
        <EmptyDay />
      ) : topPicks.length === 0 ? (
        <View style={s.empty}>
          <Icon name="star-outline" size={32} color={C.accent} />
          <Text style={s.emptyTitle}>
            {bankersFocus === 'Following' ? 'Nothing from your follows on this date' : 'No strong picks for this date'}
          </Text>
          <Text style={s.emptyBody}>
            {bankersFocus === 'Following' ? 'Follow teams and competitions to build this view.' : 'Every match is listed in All matches.'}
          </Text>
          {bankersFocus === 'Following' ? (
            <Button
              small
              kind="secondary"
              label="Choose what to follow"
              onPress={() => {
                setFavSegment('Teams');
                goTab('Favourites');
              }}
            />
          ) : null}
        </View>
      ) : (
        <>
          <SectionHead
            title={day === 0 ? "Today's top picks" : `Top picks · ${dayLabel(day)}`}
            sub="Highest model probability first"
            action="Track record"
            onAction={() => openRecord()}
          />
          {topPicks.slice(0, 2).map((m, i) => (
            <FeatureCard key={m.id} m={m} rank={i + 1} />
          ))}
          {topPicks.length > 2 ? <SectionHead title="More strong picks" sub={`${topPicks.length - 2} more at 55% or higher`} /> : null}
          {topPicks.slice(2).map((m) => (
            <MatchCard key={m.id} m={m} />
          ))}
        </>
      )}
      {!isPlus && freeCount < dayMatches.length ? (
        <Pressable accessibilityRole="button" onPress={() => openPremium()} style={s.freeBanner}>
          <Icon name="lock-open" size={20} color={C.accent} />
          <Text style={s.freeText}>
            <Text style={{ color: C.text, fontWeight: '700' }}>
              {freeCount} of {dayMatches.length} insights are free
            </Text>{' '}
            on this date. Fixture details stay free for every match.
          </Text>
          <Icon name="chevron-right" size={20} color={C.accent} />
        </Pressable>
      ) : null}

      {dayMatches.length ? (
        <View style={{ marginTop: 12 }}>
          <Button
            kind="secondary"
            icon="sports-soccer"
            label={`See all ${dayMatches.length} matches on this date`}
            onPress={() => goTab('All matches')}
          />
        </View>
      ) : null}
      <Pressable accessibilityRole="button" onPress={() => openRecord()} style={s.recordTeaser}>
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>Open track record · sample</Text>
          <Text style={s.cardTitle}>
            {TEASER.correct} of {TEASER.total} top picks correct
          </Text>
          <Text style={s.body}>{TEASER.period} · losses and voids included</Text>
        </View>
        <Icon name="chevron-right" size={24} color={C.accent} />
      </Pressable>
      <Notice
        tone="caution"
        icon="info-outline"
        text="“Bankers” is a section name, not a promise. Every estimate is uncertain and no result is guaranteed."
      />
    </>
  );
}

function Slip() {
  const { day, locked, openMatch } = useApp();
  const { matches, team, comp, pickText, consensus } = useData();
  const dayMatches = matches.filter((m) => m.day === day);
  const slip = [...dayMatches]
    .filter((m) => consensus(m) >= 4 && m.pick.p >= 58)
    .sort((a, b) => consensus(b) - consensus(a) || b.pick.p - a.pick.p)
    .slice(0, 5);
  return (
    <>
      <View style={s.slipHead}>
        <View style={s.row}>
          <Icon name="receipt-long" size={22} color={C.accent} />
          <Text style={[s.sectionTitle, { marginLeft: 8, flex: 1 }]}>{BRAND.slipName}</Text>
          <Text style={s.meta}>{dayLabel(day)}</Text>
        </View>
        <Text style={[s.body, { marginTop: 8 }]}>
          Up to 5 picks where our model is most confident and most outside prediction sources reach the same outcome.
        </Text>
      </View>
      {slip.length === 0 ? (
        dayMatches.length === 0 ? (
          <EmptyDay />
        ) : (
          <View style={s.empty}>
            <Icon name="receipt-long" size={32} color={C.accent} />
            <Text style={s.emptyTitle}>No slip for this date</Text>
            <Text style={s.emptyBody}>No match reached strong enough agreement. We'd rather show nothing than a weak slip.</Text>
          </View>
        )
      ) : (
        <>
          {slip.map((m, i) => {
            const isLocked = locked(m);
            const agree = consensus(m);
            const result = settle(m);
            return (
              <Pressable
                key={m.id}
                accessibilityRole="button"
                accessibilityLabel={`Slip pick ${i + 1}: ${team(m.home).name} versus ${team(m.away).name}. ${isLocked ? 'Plus insight' : `${pickText(m)}, ${m.pick.p} percent`}. ${agree} of 5 sources agree.`}
                onPress={() => openMatch(m)}
                style={s.slipRow}
              >
                <View style={s.slipNum}>
                  <Text style={s.slipNumText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.inlineComp} numberOfLines={1}>
                    {comp(m.comp).name} ·{' '}
                    {m.status === 'live' ? `Live ${m.minute}′` : m.status === 'finished' ? `FT ${m.score?.join('–')}` : m.time}
                  </Text>
                  <View style={{ gap: 4, marginBottom: 6 }}>
                    {[m.home, m.away].map((id) => (
                      <View key={id} style={[s.row, { gap: 8 }]}>
                        <Crest id={id} size={20} />
                        <Text style={[s.builderTeams, { marginBottom: 0, flex: 1 }]} numberOfLines={1}>
                          {team(id).name}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View style={[s.row, { gap: 8 }]}>
                    {isLocked ? null : <TipBadge code={pickCode(m)} />}
                    <Text style={[s.pickLine, { flex: 1 }]} numberOfLines={1}>
                      {isLocked ? (
                        <Text style={{ color: C.accent }}>Plus insight · unlock to see the pick</Text>
                      ) : (
                        MARKET_NAME[m.pick.market]
                      )}
                    </Text>
                  </View>
                  <View style={[s.row, { marginTop: 8, gap: 4 }]}>
                    {[0, 1, 2, 3, 4].map((k) => (
                      <View key={k} style={[s.agreeDot, k < agree && s.agreeDotOn]} />
                    ))}
                    <Text style={[s.meta, { marginLeft: 6 }]}>{agree}/5 sources agree</Text>
                    {result ? (
                      <View style={{ marginLeft: 'auto' }}>
                        <ResultBadge result={result} />
                      </View>
                    ) : null}
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                  {isLocked ? (
                    <Glass overlay={<Icon name="lock" size={18} color={C.accent} />} style={s.lockProb}>
                      <Text style={s.probValue}>{m.pick.p}%</Text>
                    </Glass>
                  ) : (
                    <Text style={s.probValue}>{m.pick.p}%</Text>
                  )}
                  <Text style={s.probCaption}>{isLocked ? 'Plus' : 'our estimate'}</Text>
                </View>
              </Pressable>
            );
          })}
        </>
      )}
      <Notice text="Agreement between sources needs licensed data; in this build it is sample data. Even when every source agrees, a result is never certain. We don't multiply the picks into one combined chance." />
    </>
  );
}

export default function BankersScreen() {
  const { bankersView, setBankersView } = useApp();
  return (
    <Screen tab rail showDate>
      <View style={[s.segment, { marginTop: 8 }]}>
        {(
          [
            ['picks', "Today's Picks", 'auto-awesome'],
            ['slip', BRAND.slipName, 'receipt-long'],
          ] as const
        ).map(([k, label, icon]) => (
          <Pressable
            key={k}
            accessibilityRole="tab"
            accessibilityState={{ selected: bankersView === k }}
            onPress={() => setBankersView(k)}
            style={[s.segItem, s.segRow, bankersView === k && s.segItemOn]}
          >
            <Icon name={icon} size={18} color={bankersView === k ? C.accent : C.muted} />
            <Text style={[s.segText, bankersView === k && s.segTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {bankersView === 'picks' ? <Picks /> : <Slip />}
    </Screen>
  );
}
