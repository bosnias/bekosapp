// Small motion pieces used across the app.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { color } from '../theme';

// Slides and fades its children in when it first appears.
export function Appear({ children, delay = 0, from = 14, style }: { children: ReactNode; delay?: number; from?: number; style?: ViewStyle }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 320, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [v, delay]);
  return (
    <Animated.View
      style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }] }]}
    >
      {children}
    </Animated.View>
  );
}

// Pops in with a little overshoot.
export function Pop({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: ViewStyle }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(v, { toValue: 1, delay, useNativeDriver: true, speed: 14, bounciness: 14 }).start();
  }, [v, delay]);
  return <Animated.View style={[style, { opacity: v, transform: [{ scale: v }] }]}>{children}</Animated.View>;
}

// Counts a number up from zero.
export function CountUp({ to, style, duration = 700 }: { to: number; style?: TextStyle; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const v = new Animated.Value(0);
    const id = v.addListener(({ value }) => setN(Math.round(value)));
    Animated.timing(v, { toValue: to, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => v.removeListener(id);
  }, [to, duration]);
  return <Text style={style}>{n}</Text>;
}

// A progress bar whose fill slides to its new value.
export function Bar({ value, style, fill = color.red, track = color.line }: { value: number; style?: ViewStyle; fill?: string; track?: string }) {
  const v = useRef(new Animated.Value(value)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: value, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [v, value]);
  return (
    <View style={[s.track, { backgroundColor: track }, style]}>
      <Animated.View
        style={[s.fill, { backgroundColor: fill, width: v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
      />
    </View>
  );
}

// A burst of little squares in the brand colors, for a great attempt.
const PIECES = 16;
const BURST_COLORS = [color.red, color.gold, color.ink, color.good];
export function Burst() {
  const v = useRef(new Animated.Value(0)).current;
  const pieces = useRef(
    Array.from({ length: PIECES }, (_, i) => {
      const angle = (i / PIECES) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 70 + Math.random() * 70;
      return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist - 30, spin: (Math.random() - 0.5) * 540, c: BURST_COLORS[i % 4], size: 7 + Math.random() * 6 };
    }),
  ).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [v]);
  return (
    <View pointerEvents="none" style={s.burst}>
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: 2,
            backgroundColor: p.c,
            opacity: v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
            transform: [
              { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] }) },
              { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, p.dy + 40] }) },
              { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  track: { height: 8, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  burst: { position: 'absolute', left: 60, top: 40, width: 0, height: 0 },
});
