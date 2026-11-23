// Practice: phrases you've already met, weakest first, so you can go back and nail them.

import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { allPhrases } from '../../lessons';
import { useProgress } from '../../progress';
import { Appear } from '../../components/Motion';
import { feel } from '../../feel';
import { color, font } from '../../theme';

export default function Practice() {
  const { done, mode } = useProgress();
  const showText = mode === 'noListen';
  const met = allPhrases
    .filter((p) => done[p.id] !== undefined)
    .sort((a, b) => (done[a.id] ?? 0) - (done[b.id] ?? 0));

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.wrap}>
        <Text style={s.title}>Practice</Text>
        {met.length === 0 ? (
          <View style={s.empty}>
            <Image source={require('../../../assets/mascot.png')} style={s.mascot} resizeMode="contain" />
            <Text style={s.emptyTitle}>Nothing here yet.</Text>
            <Text style={s.emptyText}>Every phrase you pick up on the journey shows up here, weakest first.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
            <Text style={s.sub}>Weakest first. Tap one to go again.</Text>
            {met.map((p, i) => {
              const score = done[p.id] ?? 0;
              return (
                <Appear key={p.id} delay={i * 40}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      feel.tap();
                      router.push(`/lesson/${p.id}`);
                    }}
                    style={({ pressed }) => [s.row, pressed && { backgroundColor: color.soft }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={s.rowMain}>{showText ? p.text : p.meaning}</Text>
                    </View>
                    <View style={[s.badge, score >= 85 ? s.good : score > 0 ? s.ok : s.heard]}>
                      <Text style={[s.badgeText, score > 0 && score < 85 && { color: color.ink }]}>
                        {score > 0 ? score : 'Heard'}
                      </Text>
                    </View>
                  </Pressable>
                </Appear>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.white },
  wrap: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 24 },
  title: { fontFamily: font.black, fontSize: 34, color: color.ink, letterSpacing: -1, marginTop: 12, marginBottom: 4 },
  sub: { fontFamily: font.regular, fontSize: 15, color: color.muted, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: color.line,
    gap: 12,
  },
  rowMain: { fontFamily: font.bold, fontSize: 18, color: color.ink },
  badge: { paddingVertical: 5, paddingHorizontal: 9, borderRadius: 6, minWidth: 44, alignItems: 'center' },
  good: { backgroundColor: color.good },
  ok: { backgroundColor: color.gold },
  heard: { backgroundColor: color.muted },
  badgeText: { fontFamily: font.bold, fontSize: 14, color: color.white },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 60 },
  mascot: { width: 110, height: 180 },
  emptyTitle: { fontFamily: font.extrabold, fontSize: 24, color: color.ink },
  emptyText: { fontFamily: font.regular, fontSize: 16, lineHeight: 24, color: color.body, textAlign: 'center' },
});
