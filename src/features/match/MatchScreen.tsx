import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Crest } from '../../components/Crest';
import { Glass } from '../../components/Glass';
import { Screen } from '../../components/Screen';
import { StandingsTable } from '../../components/StandingsTable';
import { Button, FormChip, Icon, LivePulse, Notice, ProbBar, ResultBadge, TipBadge } from '../../components/ui';
import { BRAND } from '../../config/brand';
import { expectedGoalsTotal, formVenue, headToHead, matchStatRows, matchXg } from '../../data/sample/insights';
import { useApp } from '../../state/AppProvider';
import { useData } from '../../state/DataProvider';
import { C } from '../../theme/colors';
import { s } from '../../theme/styles';
import type { Match, StandingRow } from '../../types';
import { ago, dateFor, dayLabel, longDate, ordinal } from '../../utils/dates';
import { MARKET_NAME, pickCode, settle, teamGoalProbs } from '../../utils/markets';

const TABS = ['Overview', 'Predictions', 'Stats', 'Standings', 'Form & H2H', 'Lineups'] as const;
type DetailTab = (typeof TABS)[number];

export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { match } = useData();
  const m = match(String(id));
  if (!m) {
    return (
      <Screen title="Match">
        <Notice text="This match is no longer available." />
      </Screen>
    );
  }
  return (
    <Screen title="Match" matchId={m.id}>
      <MatchDetail m={m} />
    </Screen>
  );
}

function MatchDetail({ m }: { m: Match }) {
  const { locked, followTeams, toggleTeam, savedIds, toggleSaved, openComp, openPremium, openTeam } = useApp();
  const { team, comp: compOf, standings, teamComp, pickText } = useData();
  const [detailTab, setDetailTab] = useState<DetailTab>('Overview');
  const [detailMode, setDetailMode] = useState<'Result' | 'Preview'>('Result');
  const isLocked = locked(m);
  const result = settle(m);
  const comp = compOf(m.comp);
  const H = team(m.home);
  const A = team(m.away);
  const showResult = m.status === 'finished' && detailMode === 'Result';
  const tabs = TABS;
  const statRows = matchStatRows(m);
  const [xgH, xgA] = matchXg(m);
  const h2h = headToHead(m);
  const tg = teamGoalProbs(m);
  return (
    <>
      <View style={s.detailMeta}>
        <Text style={s.eyebrow}>{comp.name} · 2026/27</Text>
        <Text style={s.meta}>
          {longDate(m.day)} · {m.time} WAT
        </Text>
      </View>
      <View style={s.matchup}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${H.name}. ${followTeams.includes(m.home) ? 'Following' : 'Follow'}`}
          onPress={() => toggleTeam(m.home)}
          style={s.matchupTeam}
        >
          <Crest id={m.home} size={56} />
          <Text style={s.matchupName}>{H.name}</Text>
          <Text style={s.matchupFollow}>{followTeams.includes(m.home) ? '★ Following' : '☆ Follow'}</Text>
        </Pressable>
        <View style={s.matchupCenter}>
          {m.score ? (
            <Text style={[s.bigScore, m.status === 'live' && { color: C.live }]}>
              {m.score[0]} – {m.score[1]}
            </Text>
          ) : (
            <Text style={s.bigTime}>{m.time}</Text>
          )}
          {m.status === 'live' ? (
            <View style={s.liveRow}>
              <LivePulse />
              <Text style={s.liveText}>LIVE {m.minute}′</Text>
            </View>
          ) : (
            <Text style={s.meta}>{m.status === 'finished' ? 'Full time' : dayLabel(m.day)}</Text>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${A.name}. ${followTeams.includes(m.away) ? 'Following' : 'Follow'}`}
          onPress={() => toggleTeam(m.away)}
          style={s.matchupTeam}
        >
          <Crest id={m.away} size={56} />
          <Text style={s.matchupName}>{A.name}</Text>
          <Text style={s.matchupFollow}>{followTeams.includes(m.away) ? '★ Following' : '☆ Follow'}</Text>
        </Pressable>
      </View>

      {m.status === 'finished' ? (
        <View style={[s.segment, { marginBottom: 12 }]}>
          {(['Result', 'Preview'] as const).map((t) => (
            <Pressable
              key={t}
              accessibilityRole="button"
              accessibilityState={{ selected: detailMode === t }}
              onPress={() => setDetailMode(t)}
              style={[s.segItem, detailMode === t && s.segItemOn]}
            >
              <Text style={[s.segText, detailMode === t && s.segTextOn]}>
                {t === 'Result' ? 'Result & settlement' : 'Pre-match preview'}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {(() => {
        const est = (
          <View style={s.estimate}>
            {showResult && result ? (
              <View style={[s.settleBox, { borderColor: result === 'won' ? C.won : C.lost }]}>
                <ResultBadge result={result} />
                <Text style={s.settleText}>
                  Final score {m.score?.join('–')}. The pick “{pickCode(m)} · {pickText(m)}” is{' '}
                  {result === 'won' ? 'settled as correct' : 'settled as missed'} under our {MARKET_NAME[m.pick.market].toLowerCase()}{' '}
                  rules.
                </Text>
              </View>
            ) : null}
            <Text style={s.eyebrow}>{showResult ? 'Prediction as published' : `${BRAND.name} estimate`}</Text>
            <View style={[s.row, { gap: 12, marginTop: 8 }]}>
              <TipBadge code={pickCode(m)} size="lg" />
              <Text style={[s.estimatePick, { marginTop: 0, flex: 1 }]}>{pickText(m)}</Text>
            </View>
            <View style={s.estimateRow}>
              <Text style={s.estimatePct}>{m.pick.p}%</Text>
              <Text style={s.estimateNote}>chance in our model.{'\n'}Probability, not certainty.</Text>
            </View>
            <Text style={s.fieldLabel}>Match result</Text>
            <ProbBar parts={m.x} labels={[`1 · ${H.short}`, 'X · Draw', `2 · ${A.short}`]} />
            <View style={s.metaGrid}>
              <Text style={s.meta}>Market: {MARKET_NAME[m.pick.market]}</Text>
              <Text style={s.meta}>Model: baseline-0.1</Text>
              <Text style={s.meta}>Published: {dayLabel(m.day - 1)} 09:00</Text>
              <Text style={s.meta}>{m.status === 'finished' ? 'Locked at kick-off' : `Updated ${ago(m.updated)}`}</Text>
            </View>
          </View>
        );
        return isLocked ? (
          <Glass
            radius={18}
            style={{ marginBottom: 12 }}
            overlay={
              <View style={s.lockOverlay}>
                <View style={s.lockIcon}>
                  <Icon name="lock" size={24} color={C.accent} />
                </View>
                <Text style={[s.cardTitle, { textAlign: 'center' }]}>This insight is part of Plus</Text>
                <Text style={[s.body, { textAlign: 'center' }]}>
                  Unlock the pick, its probability and the reasoning. Stats and form below stay free.
                </Text>
                <Button small label="See plans" onPress={() => openPremium()} />
              </View>
            }
          >
            {est}
          </Glass>
        ) : (
          est
        );
      })()}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll} contentContainerStyle={s.tabs}>
        {tabs.map((t) => (
          <Pressable
            key={t}
            accessibilityRole="tab"
            accessibilityState={{ selected: detailTab === t }}
            onPress={() => setDetailTab(t)}
            style={[s.tab, detailTab === t && s.tabOn]}
          >
            <Text style={[s.tabText, detailTab === t && s.tabTextOn]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {detailTab === 'Overview' ? (
        <>
          <View style={s.panel}>
            <Text style={s.eyebrow}>Why this estimate</Text>
            <Text style={s.body}>{isLocked ? 'Unlock Plus to read the reasoning for this pick.' : m.reason}</Text>
            <View style={s.evidence}>
              {[
                [`${H.name} form`, H.form.join(' ')],
                [`${A.name} form`, A.form.join(' ')],
                ['Goals expected', `${expectedGoalsTotal(m)} in total`],
              ].map(([k, v]) => (
                <View key={k} style={s.evidenceRow}>
                  <Text style={s.listSub}>{k}</Text>
                  <Text style={s.evidenceValue}>{v}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Button
                kind="secondary"
                icon={savedIds.includes(m.id) ? 'favorite' : 'favorite-border'}
                label={savedIds.includes(m.id) ? 'Saved' : 'Save'}
                onPress={() => toggleSaved(m)}
              />
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <Button kind="secondary" icon="star-outline" label="League page" onPress={() => openComp(m.comp, 'Predictions')} />
            </View>
          </View>
        </>
      ) : null}

      {detailTab === 'Predictions'
        ? (() => {
            const panel = (
              <View style={s.panel}>
                {(
                  [
                    [
                      'Match result',
                      [
                        ['1', `${H.short} win`, m.x[0], m.home],
                        ['X', 'Draw', m.x[1]],
                        ['2', `${A.short} win`, m.x[2], m.away],
                      ],
                    ],
                    [
                      'Double chance',
                      [
                        ['1X', `${H.short} or draw`, m.x[0] + m.x[1], m.home],
                        ['X2', `${A.short} or draw`, m.x[1] + m.x[2], m.away],
                        ['12', 'Either team wins', m.x[0] + m.x[2]],
                      ],
                    ],
                    [
                      'Total goals',
                      [
                        ['O1.5', '2 or more goals', Math.min(95, m.o25 + 22)],
                        ['O2.5', '3 or more goals', m.o25],
                        ['U2.5', '2 goals or fewer', 100 - m.o25],
                        ['U3.5', '3 goals or fewer', Math.min(95, 100 - m.o25 + 22)],
                      ],
                    ],
                    [
                      'Both teams to score',
                      [
                        ['BTTS', 'Both teams score', m.btts],
                        ['No BTTS', 'Not both teams score', 100 - m.btts],
                      ],
                    ],
                    [
                      'Team goals',
                      [
                        ['HS', `${H.short} scores`, tg[0], m.home],
                        ['AS', `${A.short} scores`, tg[1], m.away],
                        ['HS2+', `${H.short} 2+ goals`, tg[2], m.home],
                        ['AS2+', `${A.short} 2+ goals`, tg[3], m.away],
                      ],
                    ],
                  ] as [string, [string, string, number, string?][]][]
                ).map(([title, rows]) => (
                  <View key={title} style={s.marketBlock}>
                    <Text style={s.fieldLabel}>{title}</Text>
                    {rows.map(([code, label, rawP, crestId]) => {
                      const p = code === pickCode(m) ? m.pick.p : rawP;
                      return (
                        <View key={code} style={[s.marketRow, code === pickCode(m) && { backgroundColor: C.accentSoft, borderRadius: 8 }]}>
                          <TipBadge code={code} />
                          <View style={[s.row, { width: 104, gap: 6, marginLeft: 8 }]}>
                            {crestId ? <Crest id={crestId} size={16} /> : null}
                            <Text style={[s.marketLabel, { width: undefined, flex: 1 }]} numberOfLines={1}>
                              {label}
                            </Text>
                          </View>
                          <View style={s.marketTrack}>
                            <View style={[s.marketFill, { width: `${p}%` }]} />
                          </View>
                          <Text style={s.marketPct}>{p}%</Text>
                        </View>
                      );
                    })}
                  </View>
                ))}
                <Text style={s.meta}>
                  Your pick is highlighted. Match result, O2.5/U2.5 and BTTS each add up to 100%. Double chance, O1.5/U3.5 and team goals
                  overlap, so they don't. Tap ? on All matches for every term.
                </Text>
              </View>
            );
            return isLocked ? (
              <Glass
                radius={16}
                style={{ marginBottom: 12 }}
                overlay={
                  <View style={s.lockOverlay}>
                    <View style={s.lockIcon}>
                      <Icon name="lock" size={24} color={C.accent} />
                    </View>
                    <Text style={[s.cardTitle, { textAlign: 'center' }]}>All-market predictions are part of Plus</Text>
                    <Button small label="See plans" onPress={() => openPremium()} />
                  </View>
                }
              >
                {panel}
              </Glass>
            ) : (
              panel
            );
          })()
        : null}

      {detailTab === 'Stats' ? (
        <View style={s.panel}>
          <View style={s.statHead}>
            <Crest id={m.home} size={22} />
            <Text style={s.eyebrow}>Season averages · observed</Text>
            <Crest id={m.away} size={22} />
          </View>
          {statRows.map(([label, hv, av, unit]) => {
            const max = Math.max(hv, av) || 1;
            return (
              <View key={label} style={s.statRow}>
                <View style={s.statNums}>
                  <Text style={[s.statNum, hv >= av && { color: C.text }]}>
                    {hv}
                    {unit ?? ''}
                  </Text>
                  <Text style={s.statLabel}>{label}</Text>
                  <Text style={[s.statNum, av >= hv && { color: C.text }]}>
                    {av}
                    {unit ?? ''}
                  </Text>
                </View>
                <View style={s.statBars}>
                  <View style={s.statTrackL}>
                    <View style={[s.statFillL, { width: `${(hv / max) * 100}%` }]} />
                  </View>
                  <View style={s.statTrackR}>
                    <View style={[s.statFillR, { width: `${(av / max) * 100}%` }]} />
                  </View>
                </View>
              </View>
            );
          })}
          {comp.xg ? (
            <View style={s.statRow}>
              <View style={s.statNums}>
                <Text style={s.statNum}>{xgH}</Text>
                <Text style={s.statLabel}>xG / match</Text>
                <Text style={s.statNum}>{xgA}</Text>
              </View>
            </View>
          ) : (
            <Notice text={`Expected goals (xG) is not available for ${comp.name}. We hide it rather than show zero.`} />
          )}
          <Text style={s.meta}>Sample values until a stats provider is connected.</Text>
        </View>
      ) : null}

      {detailTab === 'Standings'
        ? (() => {
            const pair = [m.home, m.away];
            const main = standings(m.comp);
            const both = pair.every((id) => main.some((r) => r.id === id));
            const tables: { title: string; rows: StandingRow[]; all: StandingRow[] }[] = both
              ? [{ title: comp.name, rows: main, all: main }]
              : pair.map((id) => {
                  const all = standings(teamComp(id));
                  const i = all.findIndex((r) => r.id === id);
                  const from = Math.max(0, Math.min(i - 2, all.length - 5));
                  return { title: `${team(id).name} · ${compOf(teamComp(id)).name}`, rows: all.slice(from, from + 5), all };
                });
            const posOf = (id: string, all: StandingRow[]) => all.findIndex((r) => r.id === id) + 1;
            return (
              <>
                <View style={s.metrics}>
                  {pair.map((id) => {
                    const t = tables.find((x) => x.all.some((r) => r.id === id))!;
                    const r = t.all.find((x) => x.id === id)!;
                    return (
                      <View key={id} style={s.metric}>
                        <Text style={s.metricValue}>{ordinal(posOf(id, t.all))}</Text>
                        <Text style={s.metricLabel} numberOfLines={1}>
                          {team(id).name} · {r.pts} pts
                        </Text>
                      </View>
                    );
                  })}
                </View>
                {tables.map((t) => (
                  <View key={t.title} style={[s.panel, { marginTop: 12 }]}>
                    <Text style={[s.listSub, { marginBottom: 8 }]}>{t.title}</Text>
                    <StandingsTable rows={t.rows.map((r) => ({ r, pos: posOf(r.id, t.all) }))} highlight={(id) => pair.includes(id)} />
                  </View>
                ))}
                <Text style={[s.meta, { marginTop: 10 }]}>Both teams highlighted. Tap a team for its stats. Sample table.</Text>
              </>
            );
          })()
        : null}

      {detailTab === 'Form & H2H' ? (
        <>
          {[m.home, m.away].map((id) => (
            <View key={id} style={s.panel}>
              <View style={s.teamLine}>
                <Crest id={id} size={22} />
                <Text style={s.listTitle}>{team(id).name} · last 5</Text>
              </View>
              <View style={s.formRow}>
                {team(id).form.map((r, i) => (
                  <View key={i} style={s.formItem}>
                    <FormChip r={r} />
                    <Text style={s.formDate}>{dateFor(-7 * (5 - i)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Text>
                    <Text style={s.formDate}>{formVenue(id, i)}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
          <View style={s.panel}>
            <Text style={s.eyebrow}>Head to head · last 6 meetings · 2022–2026</Text>
            <View style={s.h2h}>
              {[
                [H.short, h2h[0]],
                ['Draws', h2h[1]],
                [A.short, h2h[2]],
              ].map(([k, v]) => (
                <View key={k as string} style={s.h2hItem}>
                  <Text style={s.h2hValue}>{v}</Text>
                  <Text style={s.listSub}>{k}</Text>
                </View>
              ))}
            </View>
            <Text style={s.meta}>A sample of 6 is small. Treat head-to-head as context, not evidence.</Text>
          </View>
        </>
      ) : null}

      {detailTab === 'Lineups' ? (
        <Notice
          icon="groups"
          text={
            comp.lineups
              ? m.status === 'upcoming'
                ? 'Confirmed lineups usually appear about an hour before kick-off.'
                : 'Lineups will appear here when the data source is connected.'
              : `Lineups are not available for ${comp.name}.`
          }
        />
      ) : null}

      <Notice
        tone="caution"
        text="This estimate expresses uncertainty. It is not a guarantee, a betting instruction or a promise of profit."
      />
    </>
  );
}
