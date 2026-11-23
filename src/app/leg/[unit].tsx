import { useMemo } from 'react';
// Story card shown when you reach a new leg of the journey: the place, who
// you're traveling with, and a bit of story. Placeholders until written and drawn.

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { findUnit } from '../../lessons';
import { useProgress } from '../../progress';
import { toMap } from '../../nav';
import { AssetSlot } from '../../components/AssetSlot';
import { Button } from '../../components/Button';
import { font, useColors, type Palette } from '../../theme';

export default function LegIntro() {
  const { color, s } = useStyles();
  const { unit: unitId } = useLocalSearchParams<{ unit: string }>();
  const unit = findUnit(unitId);
  const { markIntroSeen } = useProgress();

  if (!unit) {
    return (
      <SafeAreaView style={s.screen}>
        <View style={s.missing}>
          <Text style={s.place}>Not found.</Text>
          <Button label="Back to the map" onPress={() => router.replace('/')} />
        </View>
      </SafeAreaView>
    );
  }

  const start = () => {
    markIntroSeen(unit.id);
    router.replace(`/lesson/${unit.phrases[0].id}`);
  };

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.wrap}>
        <View style={s.top}>
          <Pressable accessibilityRole="button" onPress={toMap} hitSlop={12}>
            <Text style={s.back}>‹ Map</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
          <AssetSlot name={unit.art} image={unit.image} style={s.backdrop} />
          <Text style={s.label}>Next stop</Text>
          <Text style={s.place}>{unit.place}</Text>

          <View style={s.person}>
            <AssetSlot name={unit.companion.art} image={unit.companion.image} style={s.portrait} compact />
            <View style={{ flex: 1 }}>
              <Text style={s.personName}>{unit.companion.name}</Text>
              <Text style={s.personRole}>{unit.companion.role}</Text>
            </View>
          </View>

          <Text style={s.story}>{unit.story}</Text>
        </ScrollView>
        <View style={s.footer}>
          <Button label="Hit the road" onPress={start} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (color: Palette) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  missing: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  wrap: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  top: { paddingHorizontal: 24, paddingTop: 12 },
  back: { fontFamily: font.bold, fontSize: 16, color: color.red },
  body: { padding: 24, paddingTop: 16 },
  backdrop: { width: '100%', aspectRatio: 4 / 3, marginBottom: 20 },
  label: { fontFamily: font.bold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: color.red },
  place: { fontFamily: font.black, fontSize: 40, lineHeight: 46, color: color.ink, letterSpacing: -1.2 },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: color.line,
  },
  portrait: { width: 56, height: 56 },
  personName: { fontFamily: font.extrabold, fontSize: 18, color: color.ink },
  personRole: { fontFamily: font.regular, fontSize: 15, color: color.muted },
  story: { fontFamily: font.regular, fontSize: 17, lineHeight: 26, color: color.body, marginTop: 20 },
  footer: { padding: 24, paddingTop: 12 },
});

function useStyles() {
  const color = useColors();
  const s = useMemo(() => makeStyles(color), [color]);
  return { color, s };
}
