import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text } from 'react-native';
import { BRAND } from '../config/brand';
import { C } from '../theme/colors';
import { s } from '../theme/styles';

/** Logo splash shown on every launch for about two seconds. Tap to skip. Waits for `ready`. */
export function Splash({ onDone, ready }: { onDone: () => void; ready: boolean }) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const done = useRef(false);
  const timeUp = useRef(false);
  const readyRef = useRef(ready);
  readyRef.current = ready;
  const finish = () => {
    if (done.current || !readyRef.current) return;
    done.current = true;
    Animated.timing(fade, { toValue: 0, duration: 320, useNativeDriver: true }).start(() => onDone());
  };
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => {
      timeUp.current = true;
      finish();
    }, 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (ready && timeUp.current) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  return (
    <Pressable accessibilityRole="image" accessibilityLabel={BRAND.name} onPress={finish} style={s.splash}>
      <Animated.View style={{ opacity: fade, transform: [{ scale }] }}>
        <Wordmark style={s.splashLogo} />
      </Animated.View>
    </Pressable>
  );
}

export function Wordmark({ style }: { style: object }) {
  return (
    <Text style={style}>
      {BRAND.wordmark}
      <Text style={{ color: C.accent }}>.</Text>
    </Text>
  );
}
