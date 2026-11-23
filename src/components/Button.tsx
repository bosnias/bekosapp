// Chunky 3D button: a darker base with a face that sinks into it when pressed.

import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { feel } from '../feel';
import { color, font } from '../theme';

type Kind = 'primary' | 'secondary' | 'gold';

const DEPTH = 5;

const look: Record<Kind, { face: string; base: string; text: string; border?: string }> = {
  primary: { face: color.red, base: color.redDark, text: color.white },
  secondary: { face: color.white, base: '#D9D2C5', text: color.red, border: '#D9D2C5' },
  gold: { face: color.gold, base: color.goldDark, text: color.ink },
};

export function Button({ label, onPress, kind = 'primary' }: { label: string; onPress: () => void; kind?: Kind }) {
  const sink = useRef(new Animated.Value(0)).current;
  const l = look[kind];

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
