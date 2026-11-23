// Small text links that only appear if the learner hasn't done anything for a
// few seconds, e.g. "Can't talk right now?". Speaking is always the default.

import { useMemo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { font, useColors, type Palette } from '../theme';

const IDLE_MS = 6000;

export type Hint = { label: string; onPress: () => void };

// `resetKey` changes whenever the learner does something; the timer starts over.
export function IdleHint({ hints, resetKey, active = true }: { hints: Hint[]; resetKey: unknown; active?: boolean }) {
  const { color, s } = useStyles();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(false);
    if (!active || hints.length === 0) return;
    const t = setTimeout(() => setShow(true), IDLE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, active, hints.length]);

  if (!show) return null;
  return (
    <View style={s.row}>
      {hints.map((h) => (
        <Pressable key={h.label} accessibilityRole="button" onPress={h.onPress} hitSlop={10}>
          <Text style={s.link}>{h.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// Always-visible small link, used to switch back once a learner has opted out of sound or speaking.
export function SmallLink({ label, onPress }: Hint) {
  const { color, s } = useStyles();
  return (
    <View style={s.row}>
      <Pressable accessibilityRole="button" onPress={onPress} hitSlop={10}>
        <Text style={s.link}>{label}</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (color: Palette) =>
  StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 4 },
  link: {
    fontFamily: font.semibold,
    fontSize: 14,
    color: color.muted,
    textDecorationLine: 'underline',
  },
});

function useStyles() {
  const color = useColors();
  const s = useMemo(() => makeStyles(color), [color]);
  return { color, s };
}
