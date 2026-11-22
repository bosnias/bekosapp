import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { course, units, allPhrases } from '../lessons';
import { useProgress } from '../progress';
import { color, font } from '../theme';

export default function Home() {
  const { done, listenOnly, setListenOnly } = useProgress();
  const finished = allPhrases.filter((p) => done[p.id] !== undefined).length;

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.wrap}>
        <View style={s.top}>
          <Text style={s.wordmark}>bekos</Text>
          <Text style={s.count}>
            {finished} / {allPhrases.length}
          </Text>
        </View>

        <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
          <Text style={s.course}>{course.language}</Text>

          <View style={s.modes}>
            {[
              { label: 'Speaking', value: false },
              { label: 'Listen only', value: true },
            ].map((m) => (
              <Pressable
                key={m.label}
                accessibilityRole="button"
                onPress={() => setListenOnly(m.value)}
                style={[s.mode, listenOnly === m.value && s.modeOn]}
              >
                <Text style={[s.modeText, listenOnly === m.value && s.modeTextOn]}>{m.label}</Text>
              </Pressable>
            ))}
          </View>
          {listenOnly && <Text style={s.modeNote}>For when you can't talk out loud. You'll hear and learn each phrase, then say it in your head.</Text>}

          {units.map((unit, u) => (
            <View key={unit.id} style={s.unit}>
              <Text style={s.unitLabel}>Unit {u + 1}</Text>
              <Text style={s.unitTitle}>{unit.title}</Text>
              <View style={s.list}>
                {unit.phrases.map((p) => {
                  const score = done[p.id];
                  return (
                    <Pressable
                      key={p.id}
                      accessibilityRole="button"
                      onPress={() => router.push(`/lesson/${p.id}`)}
                      style={({ pressed }) => [s.row, pressed && { backgroundColor: color.soft }]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={s.rowBs}>{p.text}</Text>
                        <Text style={s.rowEn}>{p.meaning}</Text>
                      </View>
                      {score !== undefined && (
                        <View style={[s.badge, score >= 85 ? s.badgeGood : s.badgeDone]}>
                          <Text style={[s.badgeText, score < 85 && { color: color.ink }]}>
                            {score > 0 ? score : 'Heard'}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.white },
  wrap: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  wordmark: { fontFamily: font.black, fontSize: 28, color: color.red, letterSpacing: -1.5 },
  count: { fontFamily: font.semibold, fontSize: 14, color: color.muted },
  body: { padding: 24, paddingTop: 16, paddingBottom: 48 },
  course: { fontFamily: font.black, fontSize: 40, color: color.ink, letterSpacing: -1.2 },
  modes: {
    flexDirection: 'row',
    marginTop: 16,
    borderWidth: 2,
    borderColor: color.line,
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  mode: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 7 },
  modeOn: { backgroundColor: color.ink },
  modeText: { fontFamily: font.bold, fontSize: 15, color: color.muted },
  modeTextOn: { color: color.white },
  modeNote: { fontFamily: font.regular, fontSize: 14, lineHeight: 20, color: color.body, marginTop: 10 },
  unit: { marginTop: 36 },
  unitLabel: { fontFamily: font.bold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: color.red },
  unitTitle: { fontFamily: font.extrabold, fontSize: 24, color: color.ink, letterSpacing: -0.5, marginTop: 2 },
  list: { marginTop: 12, borderTopWidth: 1, borderColor: color.line },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: color.line,
    gap: 12,
  },
  rowBs: { fontFamily: font.bold, fontSize: 18, color: color.ink },
  rowEn: { fontFamily: font.regular, fontSize: 15, color: color.muted, marginTop: 2 },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, minWidth: 40, alignItems: 'center' },
  badgeGood: { backgroundColor: color.good },
  badgeDone: { backgroundColor: color.gold },
  badgeText: { fontFamily: font.bold, fontSize: 14, color: color.white },
});
