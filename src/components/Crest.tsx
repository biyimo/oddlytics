import React from 'react';
import { Image, Text, View } from 'react-native';
import { useData } from '../state/DataProvider';
import { s } from '../theme/styles';

/** Team crest. Uses the provider's crest image when present, else a coloured badge with the short name. */
export function Crest({ id, size = 26 }: { id: string; size?: number }) {
  const t = useData().team(id);
  if (t.crestUrl) {
    return (
      <Image source={{ uri: t.crestUrl }} style={{ width: size, height: size }} resizeMode="contain" accessibilityIgnoresInvertColors />
    );
  }
  return (
    <View style={[s.crest, { width: size, height: size, borderRadius: size / 2, backgroundColor: t.color }]}>
      <Text style={[s.crestText, { fontSize: size * 0.34, color: t.dark ? '#111' : '#fff' }]}>{t.short.slice(0, 3)}</Text>
    </View>
  );
}
