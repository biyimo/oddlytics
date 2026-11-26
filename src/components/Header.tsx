import React from 'react';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { BRAND } from '../config/brand';
import { useApp } from '../state/AppProvider';
import { useData } from '../state/DataProvider';
import { C } from '../theme/colors';
import { s } from '../theme/styles';
import { longDate } from '../utils/dates';
import { Wordmark } from './Splash';
import { Icon } from './ui';

/**
 * Top bar. Tab screens show the wordmark and date; pushed screens show a back
 * button and title. A match page gets a save button instead of search.
 */
export function Header({ title, matchId, showDate }: { title?: string; matchId?: string; showDate?: boolean }) {
  const { openSearch, setSheet, savedIds, toggleSaved } = useApp();
  const { match } = useData();
  const m = matchId ? match(matchId) : undefined;
  return (
    <View style={s.header}>
      {title !== undefined ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/' as never))}
          hitSlop={10}
          style={s.back}
        >
          <Icon name="arrow-back" size={22} color={C.text} />
          <Text style={s.headerTitle}>{title}</Text>
        </Pressable>
      ) : (
        <View style={{ flex: 1 }}>
          <Wordmark style={s.brand} />
          <Text style={s.headerDate}>{showDate ? longDate(0) : BRAND.tagline}</Text>
        </View>
      )}
      <View style={s.headerRight}>
        {m ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={savedIds.includes(m.id) ? 'Remove from Favourites' : 'Save match'}
            onPress={() => toggleSaved(m)}
            style={s.headerBtn}
          >
            <Icon name={savedIds.includes(m.id) ? 'favorite' : 'favorite-border'} size={22} color={C.accent} />
          </Pressable>
        ) : (
          <Pressable accessibilityRole="button" accessibilityLabel="Search" onPress={openSearch} style={s.headerBtn}>
            <Icon name="search" size={22} color={C.accent} />
          </Pressable>
        )}
        <Pressable accessibilityRole="button" accessibilityLabel="More" onPress={() => setSheet('menu')} style={s.headerBtn}>
          <Icon name="menu" size={22} color={C.accent} />
        </Pressable>
      </View>
    </View>
  );
}
