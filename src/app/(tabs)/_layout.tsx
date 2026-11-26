import React from 'react';
import { Tabs } from 'expo-router/js-tabs';
import { BottomNav } from '../../components/BottomNav';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <BottomNav {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: '#050505' } }}>
      <Tabs.Screen name="index" options={{ title: 'Bankers' }} />
      <Tabs.Screen name="matches" options={{ title: 'All matches' }} />
      <Tabs.Screen name="builder" options={{ title: 'Bet Builder' }} />
      <Tabs.Screen name="favourites" options={{ title: 'Favourites' }} />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
    </Tabs>
  );
}
