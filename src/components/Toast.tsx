import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../state/AppProvider';
import { s } from '../theme/styles';

/** Short confirmation message above the tab bar, with optional Undo. */
export function Toast() {
  const { toast, setToast } = useApp();
  const insets = useSafeAreaInsets();
  if (!toast) return null;
  return (
    <View pointerEvents="box-none" style={[s.toast, { bottom: insets.bottom + 84 }]} accessibilityLiveRegion="polite">
      <Text style={s.toastText}>{toast.text}</Text>
      {toast.undo ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            toast.undo?.();
            setToast(null);
          }}
          hitSlop={10}
        >
          <Text style={s.toastUndo}>Undo</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
