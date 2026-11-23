import { useMemo } from 'react';
// Profile: your avatar, how far you've come, and a passport stamped at every
// place you make it through. Finishing a language unlocks its bread as an avatar.

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { course, stops, units } from '../../lessons';
import { useProgress } from '../../progress';
import { AssetSlot } from '../../components/AssetSlot';
import { Pop } from '../../components/Motion';
import { font, useColors, type Palette } from '../../theme';

// Breads you can wear once you finish that language. Art is a placeholder.
const AVATARS = [
  { bread: course.mascot.name, language: course.language, art: course.mascot.art, available: true },
  { bread: 'Baguette', language: 'French', art: 'avatar-baguette.png', available: false },
  { bread: 'Pretzel', language: 'German', art: 'avatar-pretzel.png', available: false },
  { bread: 'Simit', language: 'Turkish', art: 'avatar-simit.png', available: false },
];

export default function Profile() {
  const { color, s } = useStyles();
  const { done } = useProgress();
  const stopsDone = stops.filter((s) => done[s.id] !== undefined).length;
  const scored = stops.map((s) => done[s.id]).filter((v): v is number => !!v && v > 0);
  const average = scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : 0;
  const placesReached = units.filter((u) => done[`talk-${u.id}`] !== undefined);
  const finished = placesReached.length === units.length;

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
        <View style={s.head}>
          <AssetSlot name={course.mascot.art} style={s.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={s.name}>Traveler</Text>
            <Text style={s.meta}>Learning {course.language}</Text>
          </View>
        </View>

        <View style={s.stats}>
          <Stat value={stopsDone} label="Stops" />
          <Stat value={placesReached.length} label="Places" />
          <Stat value={average} label="Avg score" />
        </View>

        <Text style={s.section}>Passport</Text>
        <Text style={s.sectionSub}>A stamp for every place you talk your way through.</Text>
        <View style={s.passport}>
          {units.map((u, i) => {
            const stamped = done[`talk-${u.id}`] !== undefined;
            return stamped ? (
              <Pop key={u.id} delay={i * 80} style={s.stampCell}>
                <View style={[s.stamp, { transform: [{ rotate: `${(i % 2 ? 1 : -1) * (4 + i)}deg` }] }]}>
                  <Text style={s.stampCountry}>{course.country}</Text>
                  <Text style={s.stampPlace}>{u.place}</Text>
                </View>
              </Pop>
            ) : (
              <View key={u.id} style={s.stampCell}>
                <View style={s.stampEmpty}>
                  <Text style={s.stampEmptyText}>{u.place}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={s.section}>Avatars</Text>
        <Text style={s.sectionSub}>Finish a language to wear its bread.</Text>
        <View style={s.avatars}>
          {AVATARS.map((a) => {
            const unlocked = a.available && finished;
            return (
              <View key={a.bread} style={[s.avatarCell, !unlocked && { opacity: 0.45 }]}>
                <AssetSlot name={a.art} style={s.avatarSmall} compact />
                <Text style={s.avatarName}>{a.bread}</Text>
                <Text style={s.avatarLang}>{unlocked ? 'Unlocked' : a.available ? `Finish ${a.language}` : 'Coming later'}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  const { color, s } = useStyles();
  return (
    <View style={s.stat}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const makeStyles = (color: Palette) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  wrap: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 24, paddingBottom: 40 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 16 },
  avatar: { width: 84, height: 84 },
  name: { fontFamily: font.black, fontSize: 30, color: color.ink, letterSpacing: -0.8 },
  meta: { fontFamily: font.semibold, fontSize: 15, color: color.muted },
  stats: { flexDirection: 'row', gap: 10, marginTop: 24 },
  stat: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: color.line,
  },
  statValue: { fontFamily: font.black, fontSize: 26, color: color.ink },
  statLabel: { fontFamily: font.semibold, fontSize: 13, color: color.muted },
  section: { fontFamily: font.extrabold, fontSize: 22, color: color.ink, marginTop: 32, letterSpacing: -0.4 },
  sectionSub: { fontFamily: font.regular, fontSize: 15, color: color.muted, marginTop: 2 },
  passport: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: color.cardBorder,
    backgroundColor: color.card,
  },
  stampCell: { width: '50%', padding: 8, alignItems: 'center' },
  stamp: {
    width: '100%',
    aspectRatio: 1.4,
    borderWidth: 3,
    borderColor: color.red,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  stampCountry: { fontFamily: font.bold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: color.red },
  stampPlace: { fontFamily: font.black, fontSize: 17, color: color.red, textAlign: 'center', marginTop: 2 },
  stampEmpty: {
    width: '100%',
    aspectRatio: 1.4,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: color.stampLine,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  stampEmptyText: { fontFamily: font.semibold, fontSize: 13, color: color.stampText, textAlign: 'center' },
  avatars: { flexDirection: 'row', gap: 10, marginTop: 14 },
  avatarCell: { flex: 1, alignItems: 'center', gap: 4 },
  avatarSmall: { width: '100%', aspectRatio: 1 },
  avatarName: { fontFamily: font.bold, fontSize: 14, color: color.ink },
  avatarLang: { fontFamily: font.regular, fontSize: 12, color: color.muted, textAlign: 'center' },
});

function useStyles() {
  const color = useColors();
  const s = useMemo(() => makeStyles(color), [color]);
  return { color, s };
}
