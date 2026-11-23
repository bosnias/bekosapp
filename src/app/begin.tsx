import { useMemo } from 'react';
// The opening of the course: the mascot on the plane, landing in the country.
// The animation is a placeholder until it's made.

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { course, units } from '../lessons';
import { useProgress } from '../progress';
import { toMap } from '../nav';
import { AssetSlot } from '../components/AssetSlot';
import { Button } from '../components/Button';
import { font, useColors, type Palette } from '../theme';

export default function Begin() {
  const { color, s } = useStyles();
  const { markIntroSeen } = useProgress();

  const begin = () => {
    markIntroSeen('course');
    router.replace(`/leg/${units[0].id}`);
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
          <AssetSlot name={course.intro.art} style={s.animation} />
          <Text style={s.label}>{course.language}</Text>
          <Text style={s.title}>{course.intro.title}</Text>
          <Text style={s.text}>{course.intro.text}</Text>
        </ScrollView>
        <View style={s.footer}>
          <Button label="Begin journey" onPress={begin} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (color: Palette) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  wrap: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  top: { paddingHorizontal: 24, paddingTop: 12 },
  back: { fontFamily: font.bold, fontSize: 16, color: color.red },
  body: { padding: 24, paddingTop: 16 },
  animation: { width: '100%', aspectRatio: 9 / 12, marginBottom: 20 },
  label: { fontFamily: font.bold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: color.red },
  title: { fontFamily: font.black, fontSize: 34, lineHeight: 40, color: color.ink, letterSpacing: -1 },
  text: { fontFamily: font.regular, fontSize: 17, lineHeight: 26, color: color.body, marginTop: 14 },
  footer: { padding: 24, paddingTop: 12 },
});

function useStyles() {
  const color = useColors();
  const s = useMemo(() => makeStyles(color), [color]);
  return { color, s };
}
