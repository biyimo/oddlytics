import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BackHandler, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Splash } from '../components/Splash';
import { Toast } from '../components/Toast';
import { Button, Icon } from '../components/ui';
import { Onboarding } from '../features/onboarding/Onboarding';
import { Sheets } from '../features/sheets/Sheets';
import { AppProvider, useApp } from '../state/AppProvider';
import { DataProvider, useData } from '../state/DataProvider';
import { C } from '../theme/colors';
import { s } from '../theme/styles';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <AppProvider>
          <StatusBar style="light" />
          <View style={{ flex: 1, backgroundColor: C.bg }}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#050505' }, animation: 'slide_from_right' }} />
            <Overlays />
          </View>
        </AppProvider>
      </DataProvider>
    </SafeAreaProvider>
  );
}

/** Everything drawn above the screens: toast, sheets, first-run flow, splash, load errors. */
function Overlays() {
  const { sheet, setSheet, onboarded, hydrated } = useApp();
  const { status, error, reload } = useData();
  const [splash, setSplash] = React.useState(true);

  // Android back button closes an open sheet before leaving the screen.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sheet) {
        setSheet(null);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [sheet, setSheet]);

  return (
    <>
      <Toast />
      <Sheets />
      {hydrated && !onboarded && status === 'ready' ? (
        <View style={s.overlay}>
          <Onboarding />
        </View>
      ) : null}
      {status === 'error' && !splash ? (
        <View style={[s.overlay, { justifyContent: 'center', backgroundColor: '#050505', padding: 24 }]}>
          <View style={s.empty}>
            <Icon name="cloud-off" size={36} color={C.accent} />
            <Text style={s.emptyTitle}>Couldn't load matches</Text>
            <Text style={s.emptyBody}>{error ?? 'Check your connection and try again.'}</Text>
            <Button label="Try again" onPress={reload} />
          </View>
        </View>
      ) : null}
      {splash ? (
        <View style={s.overlay}>
          <Splash ready={hydrated && status !== 'loading'} onDone={() => setSplash(false)} />
        </View>
      ) : null}
    </>
  );
}
