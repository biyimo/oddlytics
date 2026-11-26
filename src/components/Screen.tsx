import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../state/DataProvider';
import { C, SCREEN_GRADIENT } from '../theme/colors';
import { s } from '../theme/styles';
import { Header } from './Header';
import { DateRail } from './MatchLists';

/**
 * Page frame used by every screen: header, optional date rail, then a
 * scrolling body with pull-to-refresh.
 */
export function Screen({
  children,
  title,
  matchId,
  rail,
  showDate,
  tab,
}: {
  children: React.ReactNode;
  /** Set for pushed screens: shows a back button with this title. */
  title?: string;
  matchId?: string;
  rail?: boolean;
  showDate?: boolean;
  /** Tab screens sit above the tab bar, so they skip the bottom safe area. */
  tab?: boolean;
}) {
  const { refreshing, refresh } = useData();
  return (
    <LinearGradient colors={SCREEN_GRADIENT} locations={[0, 0.52, 1]} style={s.screen}>
      <SafeAreaView edges={tab ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']} style={s.safe}>
        <Header title={title} matchId={matchId} showDate={showDate} />
        {rail ? <DateRail /> : null}
        <View style={s.fill}>
          <ScrollView
            style={s.fill}
            contentContainerStyle={s.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={C.accent}
                colors={[C.accent]}
                progressBackgroundColor={C.surface}
              />
            }
          >
            {children}
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
