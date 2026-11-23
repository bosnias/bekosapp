// End-of-unit conversation: they say a line, you answer. Like talking with a
// native speaker, you have to respond, not repeat.

import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { findUnit, units, type Unit } from '../../lessons';
import { scorePhrase } from '../../score';
import { useAttempt } from '../../useAttempt';
import { useClipPlayer } from '../../audio';
import { conversationVoice } from '../../config';
import { useProgress } from '../../progress';
import { toMap } from '../../nav';
import { Button } from '../../components/Button';
import { AssetSlot } from '../../components/AssetSlot';
import { Appear, Bar, Burst, CountUp, Pop } from '../../components/Motion';
import { feel } from '../../feel';
import { IdleHint, SmallLink } from '../../components/IdleHint';
import { color, font } from '../../theme';


export default function TalkScreen() {
  const { unit: unitId } = useLocalSearchParams<{ unit: string }>();
  const unit = findUnit(unitId);
  return (
    <SafeAreaView style={s.screen}>
      {unit ? (
        <Talk key={unit.id} unit={unit} />
      ) : (
        <View style={s.missing}>
          <Text style={s.big}>Not found.</Text>
          <Button label="Back to lessons" onPress={() => router.replace('/')} />
        </View>
      )}
    </SafeAreaView>
  );
}

type Attempt = { score: number; heard: string };

function Talk({ unit }: { unit: Unit }) {
  const { mode, setMode, markDone } = useProgress();
  const showText = mode === 'noListen';
  const canSpeak = mode !== 'noTalk';

  const [turn, setTurn] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const clip = useClipPlayer();

  const t = unit.talk[turn];
  const rec = useAttempt((heard) => {
    // Any accepted answer counts; keep the best match.
    const best = Math.max(...t.you.accept.map((a) => scorePhrase(a, heard).score));
    if (best >= 85) feel.success();
    else feel.miss();
    setAttempt({ score: best, heard });
  });
  const { checking, error } = rec;
  const unitNumber = units.findIndex((u) => u.id === unit.id) + 1;
  const nextUnit = units[unitNumber]; // the one after this

  const sayTheirLine = () => {
    if (!showText) clip.play(t.they.text, { voice: unit.encounter.voice ?? conversationVoice, audio: t.they.audio });
  };
  const sayGoodAnswer = () => clip.play(t.you.accept[0], { voice: unit.companion.voice ?? conversationVoice });

  // Each new turn starts with them talking.
  useEffect(() => {
    if (!finished) sayTheirLine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, finished]);

  const nextTurn = (score: number) => {
    const all = [...scores, score];
    setScores(all);
    setAttempt(null);
    setRevealed(false);
    rec.setError('');
    if (turn + 1 < unit.talk.length) setTurn(turn + 1);
    else {
      const avg = Math.round(all.reduce((a, b) => a + b, 0) / all.length);
      markDone(`talk-${unit.id}`, canSpeak ? avg : 0);
      setFinished(true);
    }
  };

  const startRecording = () => {
    setAttempt(null);
    rec.start(t.you.accept.reduce((a, b) => (b.length > a.length ? b : a)), () => clip.player.pause());
  };

  if (finished) {
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return (
      <View style={s.wrap}>
        <ScrollView contentContainerStyle={[s.body, s.center]}>
          <Burst />
          <Pop>
            <Image source={require('../../../assets/mascot.png')} style={s.mascot} resizeMode="contain" />
          </Pop>
          <Text style={s.big}>You made it through {unit.place}.</Text>
          {canSpeak ? (
            <Text style={s.sub}>
              Your average: <Text style={s.strong}>{avg}</Text>. Go again any time to beat it.
            </Text>
          ) : (
            <Text style={s.sub}>Do it again in Speaking mode to get scored.</Text>
          )}
        </ScrollView>
        <View style={s.footer}>
          <Button label="Back to the map" onPress={toMap} kind={nextUnit ? 'secondary' : 'primary'} />
          {nextUnit && <Button label={`On to ${nextUnit.place}`} onPress={() => router.replace(`/leg/${nextUnit.id}`)} />}
        </View>
      </View>
    );
  }

  const verdict = (n: number) => (n >= 85 ? 'Spot on.' : n >= 60 ? 'Close.' : 'Not yet.');

  return (
    <View style={s.wrap}>
      <View style={s.top}>
        <Pressable accessibilityRole="button" onPress={toMap} hitSlop={12}>
          <Text style={s.back}>‹ Map</Text>
        </Pressable>
        <Text style={s.position}>{unit.place}</Text>
      </View>
      <View style={s.progress}>
        {unit.talk.map((_, i) => (
          <Bar key={i} value={i <= turn ? 1 : 0} fill={color.gold} style={{ flex: 1, height: 6 }} />
        ))}
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <Appear key={turn}>
        <View style={s.who}>
          <AssetSlot name={unit.encounter.art} image={unit.encounter.image} style={s.portrait} compact />
          <View style={{ flex: 1 }}>
            <Text style={s.whoName}>{unit.encounter.name}</Text>
            <Text style={s.whoRole}>{unit.encounter.role}</Text>
          </View>
        </View>
        <Text style={[s.label, { marginTop: 20 }]}>{unit.encounter.name} says</Text>
        <View style={s.bubble}>
          {showText ? (
            <>
              <Text style={s.line}>{t.they.text}</Text>
              {revealed && <Text style={s.lineMeaning}>{t.they.meaning}</Text>}
            </>
          ) : revealed ? (
            <Text style={s.line}>{t.they.meaning}</Text>
          ) : (
            <Text style={s.linePlaceholder}>Listen to them first.</Text>
          )}
          <View style={s.bubbleActions}>
            {!showText && <Small label="Play again" onPress={sayTheirLine} />}
            {!revealed && <Small label="What did they say?" onPress={() => setRevealed(true)} />}
          </View>
        </View>

        <Text style={[s.label, { marginTop: 28 }]}>Your turn</Text>
        <Text style={s.hint}>{t.you.hint}</Text>

        {checking && (
          <View style={s.checking}>
            <ActivityIndicator color={color.red} />
            <Text style={s.sub}>Listening back…</Text>
          </View>
        )}

        {attempt && !checking && (
          <View style={s.result}>
            {attempt.score >= 85 && <Burst />}
            <View style={s.scoreRow}>
              <CountUp to={attempt.score} style={s.score} />
              <Pop delay={500}>
                <Text style={s.scoreLabel}>{verdict(attempt.score)}</Text>
              </Pop>
            </View>
            {showText && (
              <Text style={s.heard}>
                We heard: <Text style={s.heardText}>{attempt.heard || 'nothing clear'}</Text>
              </Text>
            )}
          </View>
        )}

        {!canSpeak && (
          <Text style={[s.sub, { marginTop: 20 }]}>Answer in your head, then hear a good answer.</Text>
        )}
        {!!error && <Text style={s.error}>{error}</Text>}
        </Appear>
      </ScrollView>

      <View style={s.footer}>
        {mode === 'noListen' && <SmallLink label="Sound back on" onPress={() => setMode('speak')} />}
        {mode === 'noTalk' && <SmallLink label="I can talk now" onPress={() => setMode('speak')} />}
        {mode === 'speak' && (
          <IdleHint
            resetKey={`${turn}-${!!attempt}-${rec.isRecording}-${checking}-${revealed}`}
            active={!attempt && !rec.isRecording && !checking}
            hints={[
              { label: "Can't listen?", onPress: () => setMode('noListen') },
              { label: "Can't talk?", onPress: () => setMode('noTalk') },
            ]}
          />
        )}
        {!canSpeak && (
          <>
            <Button label="Hear an answer" onPress={sayGoodAnswer} kind="secondary" />
            <Button label={turn + 1 < unit.talk.length ? 'Next' : 'Finish'} onPress={() => nextTurn(0)} />
          </>
        )}

        {canSpeak && !checking && (
          <>
            {rec.isRecording ? (
              <Button label={`Done  ·  ${rec.secondsLeft}s left`} onPress={rec.stop} kind="gold" />
            ) : attempt ? (
              <>
                <View style={s.pair}>
                  <View style={{ flex: 1 }}>
                    <Button label="Try again" onPress={startRecording} kind="secondary" />
                  </View>
                  {!showText && (
                    <View style={{ flex: 1 }}>
                      <Button label="Hear an answer" onPress={sayGoodAnswer} kind="secondary" />
                    </View>
                  )}
                </View>
                <Button
                  label={turn + 1 < unit.talk.length ? 'Next' : 'Finish'}
                  onPress={() => nextTurn(attempt.score)}
                />
              </>
            ) : (
              <Button label="Tap and answer" onPress={startRecording} />
            )}
          </>
        )}
      </View>
    </View>
  );
}

function Small({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [s.small, pressed && { backgroundColor: color.soft }]}
    >
      <Text style={s.smallText}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.white },
  missing: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  wrap: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  back: { fontFamily: font.bold, fontSize: 16, color: color.red },
  position: { fontFamily: font.semibold, fontSize: 14, color: color.muted },
  progress: { flexDirection: 'row', gap: 8, paddingHorizontal: 24, paddingTop: 16 },
  bar: { flex: 1, height: 6, borderRadius: 2, backgroundColor: color.line },
  barOn: { backgroundColor: color.gold },
  body: { flexGrow: 1, padding: 24, paddingTop: 28 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  mascot: { width: 120, height: 200, marginBottom: 8 },
  big: { fontFamily: font.extrabold, fontSize: 30, color: color.ink, letterSpacing: -0.8 },
  sub: { fontFamily: font.regular, fontSize: 16, lineHeight: 24, color: color.body, textAlign: 'center' },
  strong: { fontFamily: font.bold, color: color.ink },
  who: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  portrait: { width: 56, height: 56 },
  whoName: { fontFamily: font.extrabold, fontSize: 18, color: color.ink },
  whoRole: { fontFamily: font.regular, fontSize: 14, color: color.muted },
  label: { fontFamily: font.bold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: color.red },
  bubble: {
    marginTop: 10,
    borderWidth: 2,
    borderColor: color.ink,
    borderRadius: 10,
    padding: 18,
    gap: 6,
    backgroundColor: '#FBF3E6',
  },
  line: { fontFamily: font.black, fontSize: 30, lineHeight: 36, color: color.ink, letterSpacing: -0.8 },
  lineMeaning: { fontFamily: font.bold, fontSize: 18, color: color.red },
  linePlaceholder: { fontFamily: font.bold, fontSize: 20, color: color.body },
  bubbleActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  hint: { fontFamily: font.extrabold, fontSize: 26, lineHeight: 32, color: color.ink, marginTop: 8, letterSpacing: -0.5 },
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderBottomWidth: 3,
    borderColor: color.line,
    backgroundColor: color.white,
  },
  smallText: { fontFamily: font.bold, fontSize: 14, color: color.red },
  checking: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 32 },
  result: { marginTop: 24 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 12 },
  score: { fontFamily: font.black, fontSize: 64, color: color.ink, letterSpacing: -3 },
  scoreLabel: { fontFamily: font.bold, fontSize: 22, color: color.ink },
  heard: { fontFamily: font.regular, fontSize: 15, color: color.muted, marginTop: 8 },
  heardText: { fontFamily: font.semibold, color: color.ink },
  error: { fontFamily: font.semibold, fontSize: 15, color: color.red, marginTop: 24 },
  footer: { padding: 24, paddingTop: 12, gap: 12 },
  pair: { flexDirection: 'row', gap: 12 },
});
