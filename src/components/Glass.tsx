import React, { useRef } from 'react';
import { BlurTargetView, BlurView } from 'expo-blur';
import { Platform, View } from 'react-native';
import { s } from '../theme/styles';

/*
 * Frosted-glass cover for locked (Plus) content. The content renders underneath,
 * blurred, with `overlay` on top. Android blurs through BlurTargetView on
 * Android 12+; older Android versions get an opaque tint so nothing leaks.
 */
const androidNoBlur = Platform.OS === 'android' && Number(Platform.Version) < 31;

export function Glass({
  children,
  overlay,
  radius = 12,
  style,
}: {
  children: React.ReactNode;
  overlay?: React.ReactNode;
  radius?: number;
  style?: object;
}) {
  const target = useRef<React.ComponentRef<typeof View>>(null);
  return (
    <View style={[{ position: 'relative', overflow: 'hidden', borderRadius: radius }, style]}>
      <BlurTargetView ref={target} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {children}
      </BlurTargetView>
      <BlurView
        intensity={70}
        tint="dark"
        blurTarget={target}
        blurMethod="dimezisBlurViewSdk31Plus"
        style={[s.glassFill, { borderRadius: radius }, androidNoBlur && { backgroundColor: 'rgba(28,24,48,0.97)' }]}
      >
        {overlay}
      </BlurView>
    </View>
  );
}
