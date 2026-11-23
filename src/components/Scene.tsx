import { useMemo } from 'react';
// The situation for a phrase. Shows the picture when there is one; until then,
// a short written scene in the same frame.

import { Image, StyleSheet, Text, View } from 'react-native';
import { font, useColors, type Palette } from '../theme';

export function Scene({ text, image }: { text: string; image?: number }) {
  const { color, s } = useStyles();
  if (image) {
    return (
      <View style={s.frame}>
        <Image source={image} style={s.image} resizeMode="cover" accessibilityLabel={text} />
      </View>
    );
  }
  return (
    <View style={[s.frame, s.textFrame]}>
      <Text style={s.label}>The scene</Text>
      <Text style={s.text}>{text}</Text>
    </View>
  );
}

const makeStyles = (color: Palette) =>
  StyleSheet.create({
  frame: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: color.cardBorder,
    overflow: 'hidden',
    backgroundColor: color.soft,
  },
  image: { width: '100%', aspectRatio: 4 / 3 },
  textFrame: { padding: 20, gap: 8, backgroundColor: color.card },
  label: { fontFamily: font.bold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: color.red },
  text: { fontFamily: font.bold, fontSize: 20, lineHeight: 27, color: color.ink },
});

function useStyles() {
  const color = useColors();
  const s = useMemo(() => makeStyles(color), [color]);
  return { color, s };
}
