import { Pressable, StyleSheet, Text } from 'react-native';
import { color, font } from '../theme';

type Kind = 'primary' | 'secondary' | 'gold';

export function Button({ label, onPress, kind = 'primary' }: { label: string; onPress: () => void; kind?: Kind }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.btn, s[kind], pressed && s.pressed]}
    >
      <Text style={[s.text, kind === 'secondary' && { color: color.red }, kind === 'gold' && { color: color.ink }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' },
  primary: { backgroundColor: color.red, borderBottomWidth: 4, borderColor: color.redDark },
  secondary: { backgroundColor: color.white, borderWidth: 2, borderBottomWidth: 4, borderColor: color.line },
  gold: { backgroundColor: color.gold, borderBottomWidth: 4, borderColor: color.goldDark },
  pressed: { transform: [{ translateY: 2 }], borderBottomWidth: 2 },
  text: { fontFamily: font.bold, fontSize: 16, letterSpacing: 0.3, color: color.white },
});
