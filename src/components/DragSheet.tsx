import React, { useEffect, useRef } from 'react';
import { BlurView } from 'expo-blur';
import { Animated, PanResponder, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s } from '../theme/styles';

/* Bottom sheet that slides up, and closes when dragged down by its handle or when the scrim is tapped. */
export function DragSheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(600)).current;
  const h = useRef(600);
  const closing = useRef(false);
  useEffect(() => {
    Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 16 }).start();
  }, [y]);
  const close = () => {
    if (closing.current) return;
    closing.current = true;
    Animated.timing(y, { toValue: h.current, duration: 200, useNativeDriver: true }).start(() => onClose());
  };
  const closeRef = useRef(close);
  closeRef.current = close;
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 3,
      onPanResponderMove: (_e, g) => y.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_e, g) => {
        if (g.dy > Math.min(140, h.current * 0.3) || g.vy > 0.9) closeRef.current();
        else Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
      },
      onPanResponderTerminate: () => Animated.spring(y, { toValue: 0, useNativeDriver: true }).start(),
    }),
  ).current;
  const scrimOpacity = y.interpolate({ inputRange: [0, 400], outputRange: [1, 0], extrapolate: 'clamp' });
  return (
    <View style={s.overlay}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: scrimOpacity }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" style={s.scrim} onPress={close} />
      </Animated.View>
      <Animated.View
        style={{ transform: [{ translateY: y }], maxHeight: '90%' }}
        onLayout={(e) => (h.current = e.nativeEvent.layout.height)}
      >
        <BlurView
          intensity={45}
          tint="dark"
          style={[
            s.sheet,
            { flexShrink: 1, paddingBottom: 24 + insets.bottom },
            Platform.OS === 'android' && { backgroundColor: 'rgba(24,24,32,0.97)' },
          ]}
        >
          <View {...pan.panHandlers} accessibilityLabel="Drag down to close" style={s.grabZone}>
            <View style={s.grabber} />
          </View>
          {children}
        </BlurView>
      </Animated.View>
    </View>
  );
}
