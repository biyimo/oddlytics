import React, { useEffect, useState } from 'react';
import { TextInput } from 'react-native';
import { C } from '../theme/colors';
import { s } from '../theme/styles';

/** Tap-to-type number box. Clamps to [min, max] when editing ends. */
export function NumField({
  value,
  onCommit,
  decimals = 0,
  min,
  max,
  label,
}: {
  value: number;
  onCommit: (v: number) => void;
  decimals?: number;
  min: number;
  max: number;
  label: string;
}) {
  const [text, setText] = useState(value.toFixed(decimals));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setText(value.toFixed(decimals));
  }, [value, decimals, focused]);
  const commit = () => {
    setFocused(false);
    const n = parseFloat(text.replace(',', '.'));
    if (Number.isFinite(n)) {
      const v = Math.min(max, Math.max(min, decimals ? Math.round(n * 100) / 100 : Math.round(n)));
      onCommit(v);
      setText(v.toFixed(decimals));
    } else setText(value.toFixed(decimals));
  };
  return (
    <TextInput
      value={text}
      onChangeText={setText}
      onFocus={() => setFocused(true)}
      onBlur={commit}
      onSubmitEditing={commit}
      selectTextOnFocus
      keyboardType={decimals ? 'decimal-pad' : 'number-pad'}
      returnKeyType="done"
      accessibilityLabel={`${label}. Type a value between ${min} and ${max}`}
      placeholderTextColor={C.faint}
      style={[s.numField, focused && s.numFieldOn]}
    />
  );
}
