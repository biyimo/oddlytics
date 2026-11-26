import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Crest } from '../../components/Crest';
import { NumField } from '../../components/NumField';
import { Screen } from '../../components/Screen';
import { Button, Chip, Icon, TipBadge } from '../../components/ui';
import { type BuilderSettings, DEFAULT_BUILDER, useApp } from '../../state/AppProvider';
import { useData } from '../../state/DataProvider';
import { C, probColor } from '../../theme/colors';
import { s } from '../../theme/styles';
import { dateFor, dayLabel } from '../../utils/dates';
import { MARKET_NAME, maxOddAt, oddsFor, pickCode } from '../../utils/markets';
import { buildSlip, builderPool } from './builder';

export default function BetBuilderScreen() {
  const { builder: b, setBuilder, builderSlip, setBuilderSlip, locked, openMatch, showToast } = useApp();
  const { matches, match, team, comp } = useData();
  const set = <K extends keyof BuilderSettings>(k: K, v: BuilderSettings[K]) => setBuilder((x) => ({ ...x, [k]: v }));
  const r2 = (v: number) => Math.round(v * 100) / 100;
  const pool = builderPool(matches, b, locked);
  const perPickNeeded = Math.pow(b.total, 1 / b.count);
  const slipMatches = (builderSlip ?? []).map((id) => match(id)).filter((m): m is NonNullable<typeof m> => !!m);
  const total = slipMatches.reduce((acc, m) => acc * oddsFor(m), 1);
  const poolMax = pool.reduce((mx, m) => Math.max(mx, oddsFor(m)), 0);
  const capped = pool.length > 0 && perPickNeeded > poolMax;
  const hard = perPickNeeded > b.maxOdd || perPickNeeded < b.minOdd || capped;
  const maxOddAtP = maxOddAt(b.minP);
  const probBlocksOdds = maxOddAtP < b.minOdd;
  const generateSlip = () => {
    const chosen = buildSlip(pool, b.count, b.total);
    setBuilderSlip(chosen.map((m) => m.id));
    if (!chosen.length) showToast('No games fit these settings. Loosen a limit and try again.');
  };
  const clearBuilder = () => {
    setBuilder(DEFAULT_BUILDER);
    setBuilderSlip(null);
  };
  return (
    <Screen tab>
      <Text style={s.pageTitle}>Bet Builder</Text>
      <Text style={s.lead}>Set your targets and we'll build a slip from our strongest estimates. Nothing is placed or wagered here.</Text>
      <View style={s.panel}>
        <Text style={[s.fieldLabel, { marginTop: 0 }]}>Pick games from</Text>
        <View style={s.segment}>
          {(
            [
              ['today', "Today's games", dateFor(0)],
              ['tomorrow', "Tomorrow's games", dateFor(1)],
              ['both', 'Both days', null],
            ] as const
          ).map(([k, label, d]) => (
            <Pressable
              key={k}
              accessibilityRole="button"
              accessibilityState={{ selected: b.day === k }}
              onPress={() => set('day', k)}
              style={[s.segItem, s.segTall, b.day === k && s.segItemOn]}
            >
              <Text style={[s.segText, b.day === k && s.segTextOn]}>{label}</Text>
              <Text style={[s.segSub, b.day === k && { color: C.accent }]}>
                {d ? d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Today + tomorrow'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={s.fieldLabel}>Event type</Text>
        <View style={s.segment}>
          {(['All', 'Featured', 'Live'] as const).map((t) => (
            <Pressable
              key={t}
              accessibilityRole="button"
              accessibilityState={{ selected: b.type === t }}
              onPress={() => set('type', t)}
              style={[s.segItem, b.type === t && s.segItemOn]}
            >
              <Text style={[s.segText, b.type === t && s.segTextOn]}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <View style={[s.row, { justifyContent: 'space-between', marginTop: 14, marginBottom: 8 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.fieldLabel, { marginTop: 0, marginBottom: 2 }]}>Total odds</Text>
            <Text style={s.meta}>Pick one or tap the number to type your own</Text>
          </View>
          <NumField label="Total odds" value={b.total} decimals={2} min={1.1} max={10000} onCommit={(v) => set('total', v)} />
        </View>
        <View style={s.wrap}>
          {[2, 5, 10, 20, 50, 100].map((t) => (
            <Chip key={t} label={`${t} odds`} selected={b.total === t} onPress={() => set('total', t)} />
          ))}
        </View>
        <View style={s.stepperRow}>
          <View style={{ flex: 1 }}>
            <Text style={[s.fieldLabel, { marginTop: 0, marginBottom: 2 }]}>Number of matches</Text>
            <Text style={s.meta}>How many games on the slip</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Decrease number of matches"
            onPress={() => set('count', Math.max(1, b.count - 1))}
            style={s.stepBtn}
          >
            <Icon name="remove" size={20} color={C.accent} />
          </Pressable>
          <NumField label="Number of matches" value={b.count} min={1} max={20} onCommit={(v) => set('count', v)} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Increase number of matches"
            onPress={() => set('count', Math.min(20, b.count + 1))}
            style={s.stepBtn}
          >
            <Icon name="add" size={20} color={C.accent} />
          </Pressable>
        </View>
        <View style={s.stepperRow}>
          <View style={{ flex: 1 }}>
            <Text style={[s.fieldLabel, { marginTop: 0, marginBottom: 2 }]}>Minimum odd per pick</Text>
            <Text style={s.meta}>Skip picks priced below this</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Decrease minimum odd"
            onPress={() => set('minOdd', Math.max(1.01, r2(b.minOdd - 0.05)))}
            style={s.stepBtn}
          >
            <Icon name="remove" size={20} color={C.accent} />
          </Pressable>
          <NumField
            label="Minimum odd per pick"
            value={b.minOdd}
            decimals={2}
            min={1.01}
            max={Math.max(1.02, b.maxOdd - 0.01)}
            onCommit={(v) => set('minOdd', v)}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Increase minimum odd"
            onPress={() => set('minOdd', Math.min(r2(b.maxOdd - 0.05), r2(b.minOdd + 0.05)))}
            style={s.stepBtn}
          >
            <Icon name="add" size={20} color={C.accent} />
          </Pressable>
        </View>
        <View style={s.stepperRow}>
          <View style={{ flex: 1 }}>
            <Text style={[s.fieldLabel, { marginTop: 0, marginBottom: 2 }]}>Maximum odd per pick</Text>
            <Text style={s.meta}>Skip picks priced above this</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Decrease maximum odd"
            onPress={() => set('maxOdd', Math.max(r2(b.minOdd + 0.05), r2(b.maxOdd - 0.1)))}
            style={s.stepBtn}
          >
            <Icon name="remove" size={20} color={C.accent} />
          </Pressable>
          <NumField
            label="Maximum odd per pick"
            value={b.maxOdd}
            decimals={2}
            min={b.minOdd + 0.01}
            max={50}
            onCommit={(v) => set('maxOdd', v)}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Increase maximum odd"
            onPress={() => set('maxOdd', Math.min(10, r2(b.maxOdd + 0.1)))}
            style={s.stepBtn}
          >
            <Icon name="add" size={20} color={C.accent} />
          </Pressable>
        </View>
        <View style={[s.row, { justifyContent: 'space-between', marginTop: 14, marginBottom: 8 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.fieldLabel, { marginTop: 0, marginBottom: 2 }]}>Minimum probability per game</Text>
            <Text style={s.meta}>Pick one or type your own (%)</Text>
          </View>
          <NumField label="Minimum probability percent" value={b.minP} min={1} max={95} onCommit={(v) => set('minP', v)} />
        </View>
        <View style={s.wrap}>
          {[50, 55, 60, 65, 70, 75, 80, 85].map((p) => (
            <Chip key={p} label={`${p}%+`} selected={b.minP === p} onPress={() => set('minP', p)} />
          ))}
        </View>
        <View style={s.builderSummary}>
          <Icon
            name={hard || probBlocksOdds || !pool.length ? 'warning-amber' : 'info-outline'}
            size={18}
            color={hard || probBlocksOdds || !pool.length ? C.amber : C.muted}
          />
          <Text style={[s.meta, { flex: 1 }]}>
            {probBlocksOdds
              ? `At ${b.minP}%+ probability the odds are at most about ${maxOddAtP.toFixed(2)}, below your minimum odd of ${b.minOdd.toFixed(2)}. Lower the minimum odd or the probability. `
              : ''}
            {pool.length} games fit. To reach {Number(b.total.toFixed(2))} odds with {b.count} {b.count === 1 ? 'pick' : 'picks'}, each
            needs about {perPickNeeded.toFixed(2)} odds
            {capped && perPickNeeded <= b.maxOdd
              ? `, but at ${b.minP}%+ probability the highest odd available is ${poolMax.toFixed(2)}. Lower the minimum probability or add more matches to get closer.`
              : hard
                ? ', which is outside your odds range. The slip will get as close as it can.'
                : '.'}
          </Text>
        </View>
      </View>
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Button kind="secondary" icon="filter-alt-off" label="Clear filter" onPress={clearBuilder} />
        </View>
        <View style={{ width: 10 }} />
        <View style={{ flex: 1.3 }}>
          <Button icon="auto-awesome" label="Generate slip" onPress={generateSlip} />
        </View>
      </View>

      {builderSlip && slipMatches.length ? (
        <View style={[s.slipHead, { marginTop: 18 }]}>
          <View style={[s.row, { justifyContent: 'space-between' }]}>
            <View>
              <Text style={s.eyebrow}>Your generated slip</Text>
              <Text style={s.cardTitle}>
                {slipMatches.length} {slipMatches.length === 1 ? 'pick' : 'picks'}
                {slipMatches.length < b.count ? ` (only ${slipMatches.length} fit)` : ''}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.totalOdds}>{total.toFixed(2)}</Text>
              <Text style={s.meta}>total odds · target {Number(b.total.toFixed(2))}</Text>
            </View>
          </View>
          {slipMatches.map((m, i) => (
            <Pressable key={m.id} accessibilityRole="button" onPress={() => openMatch(m)} style={s.genRow}>
              <View style={s.slipNum}>
                <Text style={s.slipNumText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.inlineComp} numberOfLines={1}>
                  {comp(m.comp).name} · {m.status === 'live' ? `Live ${m.minute}′` : `${dayLabel(m.day)} ${m.time}`}
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
                  <TipBadge code={pickCode(m)} />
                  <Text style={[s.pickLine, { flex: 1 }]} numberOfLines={1}>
                    {MARKET_NAME[m.pick.market]} <Text style={[s.pickMarket, { color: probColor(m.pick.p) }]}>· {m.pick.p}%</Text>
                  </Text>
                </View>
              </View>
              <View style={s.oddPill}>
                <Text style={s.oddText}>{oddsFor(m).toFixed(2)}</Text>
              </View>
            </Pressable>
          ))}
          <Text style={[s.meta, { marginTop: 10 }]}>
            Odds are sample prices until a price feed is connected. Total odds is a price, not your chance of winning, and we don't show a
            combined probability because results can be related.
          </Text>
        </View>
      ) : builderSlip ? (
        <View style={[s.empty, { marginTop: 18 }]}>
          <Icon name="search-off" size={32} color={C.accent} />
          <Text style={s.emptyTitle}>No games fit these settings</Text>
          <Text style={s.emptyBody}>Lower the minimum probability, widen the odds range or pick both days.</Text>
        </View>
      ) : null}
    </Screen>
  );
}
