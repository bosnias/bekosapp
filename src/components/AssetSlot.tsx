// Shows a piece of art, or a placeholder naming the file that still needs to be made.

import { Image, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { color, font } from '../theme';

export function AssetSlot({
  name,
  image,
  style,
  compact = false,
}: {
  name: string;
  image?: number;
  style?: ViewStyle;
  compact?: boolean;
}) {
  if (image) {
    return (
      <View style={[s.frame, style]}>
        <Image source={image} style={s.image} resizeMode="cover" />
      </View>
    );
  }
  return (
    <View style={[s.frame, s.missing, style]}>
      {!compact && <Text style={s.label}>Missing art</Text>}
      <Text style={[s.name, compact && s.nameCompact]} numberOfLines={2}>
        {name}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  frame: { borderRadius: 10, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  missing: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C9BFAF',
    backgroundColor: '#F6F1E8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 4,
  },
  label: { fontFamily: font.bold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted },
  name: { fontFamily: font.semibold, fontSize: 13, color: color.body, textAlign: 'center' },
  nameCompact: { fontSize: 10 },
});
