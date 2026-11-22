import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { allPhrases, findPhrase, nextPhrase, type Phrase } from '../../lessons';
import { scorePhrase, type ScoreResult } from '../../score';
import { speakUrl, transcribe } from '../../api';
import { useProgress } from '../../progress';
import { Button } from '../../components/Button';
import { color, font } from '../../theme';

type Step = 'hear' | 'understand' | 'say';
const MAX_SECONDS = 8;

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const phrase = findPhrase(id);
  if (!phrase) {
    return (
      <SafeAreaView style={s.screen}>
        <View style={s.missing}>
          <Text style={s.title}>Lesson not found.</Text>
          <Button label="Back to lessons" onPress={() => router.replace('/')} />
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={s.screen}>
      <Lesson key={phrase.id} phrase={phrase} />
    </SafeAreaView>
  );
}

function Lesson({ phrase }: { phrase: Phrase }) {
  const { listenOnly, markDone } = useProgress();
  const [step, setStep] = useState<Step>('hear');
  const [plays, setPlays] = useState(0);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState('');

  const player = useAudioPlayer(phrase.audio ?? { uri: speakUrl(phrase.text) });
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const rec = useAudioRecorderState(recorder, 200);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const position = allPhrases.findIndex((p) => p.id === phrase.id) + 1;
  const next = nextPhrase(phrase.id);
  const goNext = () => (next ? router.replace(`/lesson/${next.id}`) : router.back());

  const play = async () => {
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
    await player.seekTo(0);
    player.play();
    setPlays((n) => n + 1);
  };

  const startRecording = async () => {
    setError('');
    setResult(null);
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) {
      setError('Bekos needs your microphone to hear you. Turn it on in your settings, or switch to Listen only.');
      return;
    }
    player.pause();
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    timer.current = setTimeout(stopRecording, MAX_SECONDS * 1000);
  };

  const stopRecording = async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    await recorder.stop();
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
    const uri = recorder.uri;
    if (!uri) return;
    setChecking(true);
    try {
      const heard = await transcribe(uri);
      const r = scorePhrase(phrase.text, heard);
      setResult(r);
      markDone(phrase.id, r.score);
    } catch {
      setError("Couldn't check that one. Try again.");
    } finally {
      setChecking(false);
    }
  };

  const stepNumber = step === 'hear' ? 0 : step === 'understand' ? 1 : 2;
  const labels = ['Hear it', 'Understand it', listenOnly ? 'Think it' : 'Say it'];

  return (
    <View style={s.lesson}>
      <View style={s.top}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <Text style={s.back}>‹ Lessons</Text>
        </Pressable>
        <Text style={s.position}>
          {position} / {allPhrases.length}
        </Text>
      </View>
      <View style={s.progress}>
        {labels.map((label, i) => (
          <View key={label} style={s.progressItem}>
            <View style={[s.bar, i <= stepNumber && s.barOn]} />
            <Text style={[s.barLabel, i === stepNumber && s.barLabelOn]}>{label}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        {step === 'hear' && (
          <View style={s.center}>
            <Image source={require('../../../assets/mascot.png')} style={s.mascot} resizeMode="contain" />
            <Text style={s.title}>Listen first.</Text>
            <Text style={s.sub}>Play it as many times as you like. The words come next.</Text>
          </View>
        )}

        {step !== 'hear' && (
          <View>
            <Text style={s.phrase}>{phrase.text}</Text>
            <Text style={s.meaning}>{phrase.meaning}</Text>
          </View>
        )}

        {step === 'understand' && (
          <View>
            {phrase.literal && phrase.literal !== phrase.meaning && (
              <Text style={s.literal}>Word for word: {phrase.literal}</Text>
            )}
            <View style={s.words}>
              {phrase.words.map((w) => (
                <View key={w.word} style={s.wordRow}>
                  <Text style={s.wordBs}>{w.word}</Text>
                  <Text style={s.wordEn}>{w.meaning}</Text>
                </View>
              ))}
            </View>
            {phrase.note && <Text style={s.note}>{phrase.note}</Text>}
          </View>
        )}

        {step === 'say' && listenOnly && (
          <Text style={[s.sub, s.left, { marginTop: 32 }]}>
            Say it in your head, or under your breath. Switch to Speaking when you can talk out loud to get scored.
          </Text>
        )}

        {step === 'say' && !listenOnly && (
          <View>
            {checking && (
              <View style={s.checking}>
                <ActivityIndicator color={color.red} />
                <Text style={s.sub}>Listening back…</Text>
              </View>
            )}
            {result && !checking && <Result result={result} />}
            {!!error && <Text style={s.error}>{error}</Text>}
          </View>
        )}
      </ScrollView>

      <View style={s.footer}>
        {step === 'hear' && (
          <>
            <Button label={plays ? 'Play again' : 'Play'} onPress={play} kind={plays ? 'secondary' : 'primary'} />
            {plays > 0 && <Button label="Show me the words" onPress={() => setStep('understand')} />}
          </>
        )}

        {step === 'understand' && (
          <>
            <Button label="Play again" onPress={play} kind="secondary" />
            <Button label={listenOnly ? 'Next' : 'Now say it'} onPress={() => setStep('say')} />
          </>
        )}

        {step === 'say' && listenOnly && (
          <>
            <Button label="Play again" onPress={play} kind="secondary" />
            <Button
              label={next ? 'Next phrase' : 'Back to lessons'}
              onPress={() => {
                markDone(phrase.id, 0);
                goNext();
              }}
            />
          </>
        )}

        {step === 'say' && !listenOnly && !checking && (
          <>
            {rec.isRecording ? (
              <Button label={`Done  ${Math.floor(rec.durationMillis / 1000)}s`} onPress={stopRecording} kind="gold" />
            ) : result ? (
              <>
                <Button label="Hear it again" onPress={play} kind="secondary" />
                <Button label="Try again" onPress={startRecording} kind="secondary" />
                <Button label={next ? 'Next phrase' : 'Back to lessons'} onPress={goNext} />
              </>
            ) : (
              <>
                <Button label="Hear it again" onPress={play} kind="secondary" />
                <Button label="Tap and speak" onPress={startRecording} />
              </>
            )}
          </>
        )}
      </View>
    </View>
  );
}

function Result({ result }: { result: ScoreResult }) {
  const allGood = result.words.every((w) => w.status === 'good');
  const label = result.score >= 85 && allGood ? 'Spot on.' : result.score >= 60 ? 'Close.' : 'Not yet.';
  return (
    <View style={s.result}>
      <View style={s.scoreRow}>
        <Text style={s.score}>{result.score}</Text>
        <Text style={s.scoreLabel}>{label}</Text>
      </View>
      <View style={s.chips}>
        {result.words.map((w, i) => (
          <View key={i} style={[s.chip, s[w.status]]}>
            <Text style={[s.chipText, w.status === 'close' && { color: color.ink }]}>{w.word}</Text>
          </View>
        ))}
      </View>
      <Text style={s.heard}>
        We heard: <Text style={s.heardText}>{result.heard || 'nothing clear'}</Text>
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.white },
  missing: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  lesson: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
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
  progressItem: { flex: 1, gap: 6 },
  bar: { height: 6, borderRadius: 2, backgroundColor: color.line },
  barOn: { backgroundColor: color.red },
  barLabel: { fontFamily: font.semibold, fontSize: 12, color: color.muted },
  barLabelOn: { color: color.ink },
  body: { flexGrow: 1, padding: 24, paddingTop: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  mascot: { width: 140, height: 230, marginBottom: 12 },
  title: { fontFamily: font.extrabold, fontSize: 30, color: color.ink, letterSpacing: -0.8 },
  sub: { fontFamily: font.regular, fontSize: 16, lineHeight: 24, color: color.body, textAlign: 'center' },
  left: { textAlign: 'left' },
  phrase: { fontFamily: font.black, fontSize: 44, lineHeight: 50, color: color.ink, letterSpacing: -1.4 },
  meaning: { fontFamily: font.bold, fontSize: 22, color: color.red, marginTop: 6 },
  literal: { fontFamily: font.regular, fontSize: 16, color: color.muted, marginTop: 6 },
  words: { marginTop: 28, borderTopWidth: 1, borderColor: color.line },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: color.line,
    gap: 16,
  },
  wordBs: { fontFamily: font.bold, fontSize: 18, color: color.ink },
  wordEn: { fontFamily: font.regular, fontSize: 18, color: color.body, flexShrink: 1, textAlign: 'right' },
  note: { fontFamily: font.regular, fontSize: 16, lineHeight: 24, color: color.body, marginTop: 20 },
  checking: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 40 },
  result: { marginTop: 36 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 12 },
  score: { fontFamily: font.black, fontSize: 72, color: color.ink, letterSpacing: -3 },
  scoreLabel: { fontFamily: font.bold, fontSize: 22, color: color.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  good: { backgroundColor: color.good },
  close: { backgroundColor: color.gold },
  miss: { backgroundColor: color.red },
  chipText: { fontFamily: font.bold, fontSize: 18, color: color.white },
  heard: { fontFamily: font.regular, fontSize: 15, color: color.muted, marginTop: 16 },
  heardText: { fontFamily: font.semibold, color: color.ink },
  error: { fontFamily: font.semibold, fontSize: 15, color: color.red, marginTop: 24 },
  footer: { padding: 24, paddingTop: 12, gap: 12 },
});
