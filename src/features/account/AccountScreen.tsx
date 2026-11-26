import React from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Button, Icon, SettingRow } from '../../components/ui';
import { BRAND } from '../../config/brand';
import { isSampleData } from '../../services/api';
import { useApp } from '../../state/AppProvider';
import { C } from '../../theme/colors';
import { s } from '../../theme/styles';

export default function AccountScreen() {
  const {
    user,
    signOut,
    startSignIn,
    isPlus,
    setIsPlus,
    notify,
    setNotify,
    reminders,
    setReminders,
    showToast,
    openPremium,
    openRecord,
    openPage,
    replayWelcome,
  } = useApp();
  return (
    <Screen tab>
      <Text style={s.pageTitle}>Account</Text>
      <View style={s.profile}>
        <View style={s.avatar}>
          <Icon name="person" size={26} color={C.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{user ? user.name : 'Guest'}</Text>
          <Text style={s.body}>{user ? user.email : 'Sign in to keep favourites across devices.'}</Text>
        </View>
        {user ? (
          <Button small kind="secondary" label="Sign out" onPress={signOut} />
        ) : (
          <Button small kind="secondary" label="Sign in" onPress={startSignIn} />
        )}
      </View>
      <Pressable accessibilityRole="button" onPress={() => openPremium()} style={s.plusCard}>
        <View style={s.plusPill}>
          <Text style={s.plusPillText}>{BRAND.plusName.toUpperCase()}</Text>
        </View>
        <Text style={s.plusTitle}>{isPlus ? 'You are previewing Plus' : 'Go deeper into the game'}</Text>
        <Text style={s.body}>Every insight, all markets per match, longer history and alerts for the teams you follow.</Text>
        <View style={[s.linkWrap, { marginTop: 12 }]}>
          <Text style={s.link}>{isPlus ? 'Manage plan' : 'See plans and prices'}</Text>
          <Icon name="arrow-forward" size={16} color={C.accent} />
        </View>
      </Pressable>
      <Text style={s.groupLabel}>Preferences</Text>
      <View style={s.settings}>
        <SettingRow
          icon="schedule"
          title="Time zone"
          sub={`${BRAND.timeZoneName} · kick-offs shown in local time`}
          onPress={() => showToast('Time zone changes come with sign-in')}
        />
        <SettingRow
          icon="notifications-none"
          title="Match alerts"
          sub={notify ? 'On for followed teams' : 'Off'}
          right={<Switch value={notify} onValueChange={setNotify} trackColor={{ true: C.accent, false: C.raised }} thumbColor="#fff" />}
        />
        <SettingRow
          icon="alarm"
          title="Kick-off reminders"
          sub="For saved matches, 30 min before"
          right={
            <Switch value={reminders} onValueChange={setReminders} trackColor={{ true: C.accent, false: C.raised }} thumbColor="#fff" />
          }
        />
        <SettingRow icon="language" title="Language" sub="English" />
      </View>
      <Text style={s.groupLabel}>Trust and safety</Text>
      <View style={s.settings}>
        <SettingRow icon="insights" title="Track record" sub="Every settled pick, including losses" onPress={() => openRecord()} />
        <SettingRow
          icon="lightbulb-outline"
          title={`How ${BRAND.name} works`}
          sub="Data, model versions and limits"
          onPress={() => openPage('how')}
        />
        <SettingRow
          icon="volunteer-activism"
          title="Play responsibly"
          sub="18+ · tools and support"
          onPress={() => openPage('responsible')}
        />
        <SettingRow icon="lock-outline" title="Privacy and data" sub="What we store and your choices" onPress={() => openPage('privacy')} />
        <SettingRow icon="help-outline" title="Help" sub="Betting terms and FAQs" onPress={() => openPage('help')} />
      </View>
      <Text style={s.groupLabel}>Prototype controls</Text>
      <View style={s.settings}>
        <SettingRow
          icon="workspace-premium"
          title="Preview as Plus member"
          sub="Unlocks premium insights in this demo"
          right={<Switch value={isPlus} onValueChange={setIsPlus} trackColor={{ true: C.accent, false: C.raised }} thumbColor="#fff" />}
        />
        <SettingRow icon="replay" title="Replay welcome" sub="See the first-run screens again" onPress={replayWelcome} />
      </View>
      <Text style={s.foot}>
        {BRAND.name} gives football information and probability estimates. It does not take bets. 18+ only. Availability depends on local
        rules. Version {BRAND.version}
        {isSampleData() ? ' · sample data' : ''}.
      </Text>
    </Screen>
  );
}
