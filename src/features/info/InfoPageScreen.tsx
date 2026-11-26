import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Button, Icon, type IconName, Notice } from '../../components/ui';
import { BRAND } from '../../config/brand';
import { useApp } from '../../state/AppProvider';
import { C } from '../../theme/colors';
import { s } from '../../theme/styles';
import type { InfoPage } from '../../types';

export const INFO_PAGES: Record<InfoPage, { title: string; items: [IconName, string, string][] }> = {
  how: {
    title: `How ${BRAND.name} works`,
    items: [
      [
        'dataset',
        'Data',
        'Fixtures, results and team statistics come from licensed football data providers. Each card shows when it was last refreshed.',
      ],
      [
        'functions',
        'Model',
        'A statistical model turns recent form, home and away strength and scoring rates into probabilities for each outcome. Version shown on every pick.',
      ],
      ['schedule', 'Timing', 'Estimates publish the morning before a match and may update until kick-off, when they lock.'],
      ['fact-check', 'Grading', 'Every top pick is settled against fixed rules and kept in the public record, including losses.'],
      [
        'warning-amber',
        'Limits',
        'Late team news, weather and motivation are hard to model. Smaller leagues have less data, so estimates there are less certain.',
      ],
    ],
  },
  responsible: {
    title: 'Play responsibly',
    items: [
      ['person-off', '18+ only', `${BRAND.name} is for adults. We ask for age confirmation on first use.`],
      [
        'casino',
        'Estimates are not certainties',
        'A 70% estimate still loses about 3 times in 10. Never stake more than you can afford to lose.',
      ],
      ['timer', 'Take breaks', 'Set your own limits on time and money, and stop if it stops being fun.'],
      [
        'support-agent',
        'Get support',
        'If betting is causing harm, talk to someone you trust or a local support service. Support contacts for your country will be listed here before launch.',
      ],
    ],
  },
  privacy: {
    title: 'Privacy and data',
    items: [
      [
        'storage',
        'What is stored',
        'Favourites, follows and settings are saved on this device only. Nothing is sent to a server in this build.',
      ],
      ['download', 'Your data', 'At launch you will be able to export or delete your account data from here.'],
      ['campaign', 'Marketing', 'No marketing messages unless you opt in.'],
    ],
  },
  help: {
    title: 'Help',
    items: [
      ['percent', 'What does 48% mean?', 'Our model thinks the outcome happens about 48 times out of 100 in matches like this one.'],
      ['star-outline', 'What are Bankers?', 'Our featured picks of the day with the clearest reasoning. Not guaranteed results.'],
      ['lock-outline', 'What is free?', 'Fixtures, scores, stats, form, the track record and a daily sample of insights.'],
    ],
  },
};

export default function InfoPageScreen() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const { setSheet } = useApp();
  const c = INFO_PAGES[page as InfoPage];
  if (!c) {
    return (
      <Screen title="">
        <Notice text="Page not found." />
      </Screen>
    );
  }
  return (
    <Screen title="">
      <Text style={s.pageTitle}>{c.title}</Text>
      {c.items.map(([icon, t, b]) => (
        <View key={t} style={s.infoRow}>
          <View style={s.settingIcon}>
            <Icon name={icon} size={20} color={C.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.listTitle}>{t}</Text>
            <Text style={s.body}>{b}</Text>
          </View>
        </View>
      ))}
      {page === 'help' ? (
        <Button kind="secondary" icon="menu-book" label="Betting terms explained" onPress={() => setSheet('glossary')} />
      ) : null}
    </Screen>
  );
}
