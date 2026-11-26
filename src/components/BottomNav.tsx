import React, { useEffect } from 'react';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_ROUTES, type Tab, useApp } from '../state/AppProvider';
import { C } from '../theme/colors';
import { s } from '../theme/styles';
import { Icon, type IconName } from './ui';

const NAV: { name: Tab; icon: IconName }[] = [
  { name: 'Bankers', icon: 'auto-awesome' },
  { name: 'All matches', icon: 'sports-soccer' },
  { name: 'Bet Builder', icon: 'playlist-add-check' },
  { name: 'Favourites', icon: 'favorite-border' },
  { name: 'Account', icon: 'person-outline' },
];

/** Custom bottom tab bar: the selected tab sits in a purple frosted pill. */
export function BottomNav({ state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { goTab, savedIds, setCurrentTab } = useApp();
  const routeName = state.routes[state.index]?.name;
  const tab = (Object.keys(TAB_ROUTES) as Tab[]).find((t) => TAB_ROUTES[t] === routeName) ?? 'Bankers';
  useEffect(() => setCurrentTab(tab), [tab, setCurrentTab]);
  return (
    <View style={[s.nav, { paddingBottom: 8 + insets.bottom }]}>
      {NAV.map((item) => {
        const on = tab === item.name;
        const color = on ? C.accent : C.muted;
        const icon: IconName = item.name === 'Favourites' && on ? 'favorite' : item.icon;
        return (
          <Pressable
            key={item.name}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={item.name}
            onPress={() => goTab(item.name)}
            style={s.navItem}
          >
            <View style={s.navPill}>
              {on ? <View style={s.navGlass} /> : null}
              <Icon name={icon} size={22} color={on ? '#C9C1FF' : color} />
              {item.name === 'Favourites' && savedIds.length ? (
                <View style={s.navBadge}>
                  <Text style={s.navBadgeText}>{savedIds.length}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[s.navText, { color }, on && { fontWeight: '700' }]} numberOfLines={1}>
              {item.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
