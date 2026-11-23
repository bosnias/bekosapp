// Chunky 3D button: a darker base with a face that sinks into it when pressed.

import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { feel } from '../feel';
import { font, useColors, type Palette } from '../theme';

type Kind = 'primary' | 'secondary' | 'gold';

const DEPTH = 5;

const looks = (color: Palette): Record<Kind, { face: string; base: string; text: string; border?: string }> => ({
  primary: { face: color.red, base: color.redDark, text: color.onAccent },
  secondary: { face: color.bg, base: color.raised, text: color.red, border: color.raised },
  gold: { face: color.gold, base: color.goldDark, text: color.onGold },
});

export function Button({ label, onPress, kind = 'primary' }: { label: string; onPress: () => void; kind?: Kind }) {
  const sink = useRef(new Animated.Value(0)).current;
  const l = looks(useColors())[kind];

  const down = () => {
    feel.tap();
    Animated.spring(sink, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  };
  const up = () => Animated.spring(sink, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 10 }).start();

  return (
    <Pressable accessibilityRole="button" onPress={onPress} onPressIn={down} onPressOut={up} style={[s.base, { backgroundColor: l.base }]}>
      <Animated.View
        style={[
          s.face,
          { backgroundColor: l.face },
          l.border ? { borderWidth: 2, borderColor: l.border } : null,
          { transform: [{ translateY: sink.interpolate({ inputRange: [0, 1], outputRange: [-DEPTH, 0] }) }] },
        ]}
      >
        <Text style={[s.text, { color: l.text }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: { borderRadius: 12, marginTop: DEPTH },
  face: { borderRadius: 12, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center' },
  text: { fontFamily: font.extrabold, fontSize: 16, letterSpacing: 0.3 },
});
