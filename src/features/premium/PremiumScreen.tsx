import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Button, Icon, Notice } from '../../components/ui';
import { BRAND } from '../../config/brand';
import { type PlanId, PLANS } from '../../config/plans';
import { useApp } from '../../state/AppProvider';
import { C } from '../../theme/colors';
import { s } from '../../theme/styles';

/*
 * Paywall. Purchases are not wired up: connect App Store / Google Play billing
 * (for example with RevenueCat or react-native-iap) where the disabled button is.
 */
export default function PremiumScreen() {
  const { isPlus, setIsPlus, showToast } = useApp();
  const [plan, setPlan] = useState<PlanId>('quarter');
  const plans = PLANS;
  const chosen = plans.find((p) => p.id === plan)!;
  return (
    <Screen title="Plus">
      <View style={s.plusPill}>
        <Text style={s.plusPillText}>{BRAND.plusName.toUpperCase()}</Text>
      </View>
      <Text style={[s.pageTitle, { marginTop: 10 }]}>More context.{'\n'}Better questions.</Text>
      <View style={s.panel}>
        <View style={s.compareHead}>
          <Text style={[s.fieldLabel, { flex: 1, marginTop: 0 }]}>What you get</Text>
          <Text style={s.compareCol}>Free</Text>
          <Text style={[s.compareCol, { color: C.accent }]}>Plus</Text>
        </View>
        {[
          ['Fixtures, scores, stats and form', true, true],
          ['Settled history and track record', true, true],
          ['Daily insights', 'Some', 'All'],
          ['All markets per match', false, true],
          ['Competitions with insights', '6', '6+'],
          ['Alerts for followed teams', false, true],
          ['Ads', 'Light', 'None'],
        ].map(([k, f, p]) => (
          <View key={k as string} style={s.compareRow}>
            <Text style={[s.body, { flex: 1 }]}>{k}</Text>
            {[f, p].map((v, i) => (
              <View key={i} style={s.compareCell}>
                {typeof v === 'boolean' ? (
                  <Icon name={v ? 'check' : 'remove'} size={18} color={v ? (i ? C.accent : C.soft) : C.faint} />
                ) : (
                  <Text style={[s.compareText, i === 1 && { color: C.accent }]}>{v}</Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
      <Text style={s.groupLabel}>Choose a plan · sample prices</Text>
      {plans.map((p) => (
        <Pressable
          key={p.id}
          accessibilityRole="radio"
          accessibilityState={{ checked: plan === p.id }}
          onPress={() => setPlan(p.id)}
          style={[s.planCard, plan === p.id && s.planCardOn]}
        >
          <Icon
            name={plan === p.id ? 'radio-button-checked' : 'radio-button-unchecked'}
            size={22}
            color={plan === p.id ? C.accent : C.faint}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={s.row}>
              <Text style={s.listTitle}>{p.name}</Text>
              {p.tag ? (
                <View style={s.saveTag}>
                  <Text style={s.saveTagText}>{p.tag}</Text>
                </View>
              ) : null}
            </View>
            <Text style={s.listSub}>{p.per}</Text>
          </View>
          <Text style={s.planPrice}>{p.price}</Text>
        </Pressable>
      ))}
      <View style={s.panel}>
        <Text style={s.listTitle}>{chosen.total}</Text>
        <Text style={s.body}>
          Renews automatically until you cancel. Cancel any time in your app store account; access continues to the end of the paid period.
          Prices include VAT.
        </Text>
      </View>
      <Button label="Payments not enabled yet" disabled onPress={() => {}} />
      <View style={{ height: 8 }} />
      <Button
        kind="ghost"
        label={isPlus ? 'Stop Plus preview' : 'Preview Plus in this demo'}
        onPress={() => {
          setIsPlus(!isPlus);
          showToast(isPlus ? 'Plus preview off' : 'Plus preview on: premium insights unlocked');
        }}
      />
      <Button kind="ghost" label="Restore purchase" onPress={() => showToast('Nothing to restore yet')} />
      <Notice tone="caution" text="Plus gives more information, not better luck. No pick is guaranteed. 18+ only." />
    </Screen>
  );
}
