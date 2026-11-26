/* Small building blocks shared by every screen. */
import React, { useEffect, useRef } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Animated, Pressable, Text, View } from 'react-native';
import { C } from '../theme/colors';
import { s } from '../theme/styles';
import type { FormResult } from '../types';

export type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

export function Icon({ name, size = 20, color = C.muted }: { name: IconName; size?: number; color?: string }) {
  return <MaterialIcons name={name} size={size} color={color} />;
}

export function LivePulse() {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[s.liveDot, { opacity }]} />;
}

export function Chip({
  label,
  selected,
  onPress,
  icon,
  count,
  removable,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: IconName;
  count?: number;
  removable?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={removable ? `Remove filter ${label}` : label}
      onPress={onPress}
      style={[s.chip, selected && s.chipOn]}
    >
      {icon ? <Icon name={icon} size={16} color={selected ? C.accent : C.soft} /> : null}
      <Text style={[s.chipText, selected && s.chipTextOn]}>{label}</Text>
      {count ? (
        <View style={s.chipCount}>
          <Text style={s.chipCountText}>{count}</Text>
        </View>
      ) : null}
      {removable ? <Icon name="close" size={14} color={C.accent} /> : null}
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  icon,
  disabled,
  small,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'ghost';
  icon?: IconName;
  disabled?: boolean;
  small?: boolean;
}) {
  const color = kind === 'primary' ? '#0B0820' : C.accent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        kind === 'secondary' && s.btnSecondary,
        kind === 'ghost' && s.btnGhost,
        small && s.btnSmall,
        disabled && s.btnDisabled,
        pressed && !disabled && { opacity: 0.8 },
      ]}
    >
      {icon ? <Icon name={icon} size={18} color={disabled ? C.faint : color} /> : null}
      <Text style={[s.btnText, { color: disabled ? C.faint : color }, small && { fontSize: 13 }]}>{label}</Text>
    </Pressable>
  );
}

export function SectionHead({ title, action, onAction, sub }: { title: string; action?: string; onAction?: () => void; sub?: string }) {
  return (
    <View style={s.sectionHead}>
      <View style={{ flex: 1 }}>
        <Text style={s.sectionTitle}>{title}</Text>
        {sub ? <Text style={s.sectionSub}>{sub}</Text> : null}
      </View>
      {action && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={10} style={s.linkWrap}>
          <Text style={s.link}>{action}</Text>
          <Icon name="chevron-right" size={18} color={C.accent} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Notice({ icon = 'info-outline', text, tone = 'neutral' }: { icon?: IconName; text: string; tone?: 'neutral' | 'caution' }) {
  return (
    <View style={s.notice}>
      <Icon name={icon} size={18} color={tone === 'caution' ? C.amber : C.muted} />
      <Text style={s.noticeText}>{text}</Text>
    </View>
  );
}

export function ResultBadge({ result }: { result: 'won' | 'lost' }) {
  const won = result === 'won';
  return (
    <View style={[s.badge, { backgroundColor: won ? C.wonSoft : C.lostSoft }]}>
      <Icon name={won ? 'check-circle' : 'cancel'} size={14} color={won ? C.won : C.lost} />
      <Text style={[s.badgeText, { color: won ? C.won : C.lost }]}>{won ? 'Correct' : 'Missed'}</Text>
    </View>
  );
}

export function ProbBar({ parts, labels }: { parts: number[]; labels: string[] }) {
  const colors = [C.accent, '#5D5F6B', '#B7AEFF'];
  return (
    <View>
      <View style={s.probBar}>
        {parts.map((p, i) => (
          <View key={i} style={{ width: `${p}%`, backgroundColor: colors[i], height: '100%' }} />
        ))}
      </View>
      <View style={s.probLegend}>
        {parts.map((p, i) => (
          <View key={i} style={[s.probLegendItem, i === 1 && { alignItems: 'center' }, i === 2 && { alignItems: 'flex-end' }]}>
            <Text style={s.probLegendValue}>{p}%</Text>
            <Text style={s.probLegendLabel} numberOfLines={1}>
              {labels[i]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function SettingRow({
  icon,
  title,
  sub,
  onPress,
  right,
}: {
  icon: IconName;
  title: string;
  sub: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} disabled={!onPress} onPress={onPress} style={s.settingRow}>
      <View style={s.settingIcon}>
        <Icon name={icon} size={20} color={C.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.listTitle}>{title}</Text>
        <Text style={s.listSub}>{sub}</Text>
      </View>
      {right ?? <Icon name="chevron-right" size={22} color={C.faint} />}
    </Pressable>
  );
}

/** Segmented control: a row of options, one selected. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  role = 'button',
  style,
}: {
  options: readonly (T | readonly [T, string])[];
  value: T;
  onChange: (v: T) => void;
  role?: 'button' | 'tab';
  style?: object;
}) {
  return (
    <View style={[s.segment, style]}>
      {options.map((o) => {
        const [k, label] = typeof o === 'string' ? [o, o] : (o as readonly [T, string]);
        const on = value === k;
        return (
          <Pressable
            key={k}
            accessibilityRole={role}
            accessibilityState={{ selected: on }}
            onPress={() => onChange(k)}
            style={[s.segItem, on && s.segItemOn]}
          >
            <Text style={[s.segText, on && s.segTextOn]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function FormChip({ r }: { r: FormResult }) {
  return (
    <View style={[s.formChip, { backgroundColor: r === 'W' ? C.wonSoft : r === 'L' ? C.lostSoft : C.raised }]}>
      <Text style={[s.formText, { color: r === 'W' ? C.won : r === 'L' ? C.lost : C.soft }]}>{r}</Text>
    </View>
  );
}

export function Flag({ country, big }: { country: string; big?: boolean }) {
  return (
    <View style={[s.flag, big && { width: 64, height: 48, borderRadius: 12 }]}>
      <Text style={[s.flagText, big && { fontSize: 15 }]}>{country.slice(0, 3).toUpperCase()}</Text>
    </View>
  );
}

/**
 * Decimal odd for a pick. Shows the bookmaker price (median across books) when we have one;
 * otherwise the fair odd from our probability (100 / p), marked "fair" so it isn't mistaken for a price.
 */
export function OddPill({ odds, p, size = 'sm' }: { odds?: number; p: number; size?: 'sm' | 'md' }) {
  const value = odds ?? Math.max(1.01, Math.round((100 / Math.max(1, p)) * 100) / 100);
  const fs = size === 'md' ? 14 : 12;
  return (
    <View
      accessibilityLabel={odds ? `Odds ${value.toFixed(2)}` : `Fair odds ${value.toFixed(2)}`}
      style={{
        height: size === 'md' ? 30 : 22,
        paddingHorizontal: 8,
        borderRadius: size === 'md' ? 10 : 6,
        borderWidth: 1,
        borderColor: odds ? 'rgba(241,200,121,0.45)' : 'rgba(167,169,177,0.3)',
        backgroundColor: odds ? '#2E2614' : 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {odds ? null : <Text style={{ color: '#A7A9B1', fontSize: fs - 2, fontWeight: '600' }}>fair</Text>}
      <Text style={{ color: odds ? '#F1C879' : '#D1D2D8', fontWeight: '800', fontSize: fs }}>{value.toFixed(2)}</Text>
    </View>
  );
}

/** Betting code pill (1, X2, BTTS, HS2+ …). Shown on every pick so users learn the terms. */
export function TipBadge({ code, size = 'sm' }: { code: string; size?: 'sm' | 'md' | 'lg' }) {
  const dims =
    size === 'lg'
      ? { minWidth: 64, height: 40, fontSize: 18, px: 12 }
      : size === 'md'
        ? { minWidth: 48, height: 30, fontSize: 14, px: 9 }
        : { minWidth: 38, height: 22, fontSize: 12, px: 7 };
  return (
    <View
      accessibilityLabel={`Tip ${code}`}
      style={{
        minWidth: dims.minWidth,
        height: dims.height,
        paddingHorizontal: dims.px,
        borderRadius: size === 'sm' ? 6 : 10,
        backgroundColor: '#221D42',
        borderWidth: 1,
        borderColor: 'rgba(139,124,255,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#C9C1FF', fontWeight: '800', fontSize: dims.fontSize, letterSpacing: 0.2 }}>{code}</Text>
    </View>
  );
}
