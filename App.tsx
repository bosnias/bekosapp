import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { phrases, type Phrase } from './src/lessons';
import { scorePhrase, type ScoreResult } from './src/score';
import { speakUrl, transcribe } from './src/api';

const C = {
  red: '#B33A1B',
  redDark: '#7E2611',
  gold: '#DDA048',
  ink: '#141414',
  body: '#4B4B4B',
  muted: '#6B6B6B',
  line: '#E2E2E2',
  soft: '#F4F4F2',
  white: '#FFFFFF',
  good: '#2F7A3B',
};

type Step = 'hear' | 'understand' | 'say';
const MAX_SECONDS = 8;

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });
  const [index, setIndex] = useState(0);
  if (!fontsLoaded) return null;

  const phrase = phrases[index];
  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.screen}>
        <StatusBar style="dark" />
        <Lesson
          key={phrase.id}
          phrase={phrase}
          position={`${index + 1} / ${phrases.length}`}
          onNext={() => setIndex((i) => (i + 1) % phrases.length)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function Lesson({ phrase, position, onNext }: { phrase: Phrase; position: string; onNext: () => void }) {
  const [step, setStep] = useState<Step>('hear');
  const [plays, setPlays] = useState(0);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState('');

  const player = useAudioPlayer(phrase.audio ?? { uri: speakUrl(phrase.text) });
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const rec = useAudioRecorderState(recorder, 200);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

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
      setError('Bekos needs your microphone to hear you. Turn it on in your settings.');
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
      setResult(scorePhrase(phrase.text, heard));
    } catch {
      setError("Couldn't check that one. Try again.");
    } finally {
      setChecking(false);
    }
  };

  const stepNumber = step === 'hear' ? 0 : step === 'understand' ? 1 : 2;

  return (
    <View style={s.lesson}>
      <View style={s.top}>
        <Text style={s.wordmark}>bekos</Text>
        <Text style={s.position}>{position}</Text>
      </View>
      <View style={s.progress}>
        {['Hear it', 'Understand it', 'Say it'].map((label, i) => (
          <View key={label} style={s.progressItem}>
            <View style={[s.bar, i <= stepNumber && s.barOn]} />
            <Text style={[s.barLabel, i === stepNumber && s.barLabelOn]}>{label}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        {step === 'hear' && (
          <View style={s.center}>
            <Image source={require('./assets/mascot.png')} style={s.mascot} resizeMode="contain" />
            <Text style={s.title}>Listen first.</Text>
            <Text style={s.sub}>Play it as many times as you like. The words come next.</Text>
          </View>
        )}

        {step === 'understand' && (
          <View>
            <Text style={s.phrase}>{phrase.text}</Text>
            <Text style={s.meaning}>{phrase.meaning}</Text>
            {phrase.literal !== phrase.meaning && (
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
            <Text style={s.note}>{phrase.note}</Text>
          </View>
        )}

        {step === 'say' && (
          <View>
            <Text style={s.phrase}>{phrase.text}</Text>
            <Text style={s.meaning}>{phrase.meaning}</Text>

            {checking && (
              <View style={s.checking}>
                <ActivityIndicator color={C.red} />
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
            <Button label="Now say it" onPress={() => setStep('say')} />
          </>
        )}

        {step === 'say' && !checking && (
          <>
            {rec.isRecording ? (
              <Button
                label={`Done  ${Math.floor(rec.durationMillis / 1000)}s`}
                onPress={stopRecording}
                kind="recording"
              />
            ) : result ? (
              <>
                <Button label="Hear it again" onPress={play} kind="secondary" />
                <Button label="Try again" onPress={startRecording} kind="secondary" />
                <Button label="Next phrase" onPress={onNext} />
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
            <Text style={[s.chipText, w.status === 'close' && { color: C.ink }]}>{w.word}</Text>
          </View>
        ))}
      </View>
      <Text style={s.heard}>
        We heard: <Text style={s.heardText}>{result.heard || 'nothing clear'}</Text>
      </Text>
    </View>
  );
}

function Button({
  label,
  onPress,
  kind = 'primary',
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'recording';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        kind === 'primary' && s.btnPrimary,
        kind === 'secondary' && s.btnSecondary,
        kind === 'recording' && s.btnRecording,
        pressed && s.btnPressed,
      ]}
    >
      <Text style={[s.btnText, kind === 'secondary' && { color: C.red }, kind === 'recording' && { color: C.ink }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  lesson: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  wordmark: { fontFamily: 'Inter_900Black', fontSize: 28, color: C.red, letterSpacing: -1.5 },
  position: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: C.muted },
  progress: { flexDirection: 'row', gap: 8, paddingHorizontal: 24, paddingTop: 16 },
  progressItem: { flex: 1, gap: 6 },
  bar: { height: 6, borderRadius: 2, backgroundColor: C.line },
  barOn: { backgroundColor: C.red },
  barLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: C.muted },
  barLabelOn: { color: C.ink },
  body: { flexGrow: 1, padding: 24, paddingTop: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  mascot: { width: 140, height: 230, marginBottom: 12 },
  title: { fontFamily: 'Inter_800ExtraBold', fontSize: 30, color: C.ink, letterSpacing: -0.8 },
  sub: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, color: C.body, textAlign: 'center' },
  phrase: { fontFamily: 'Inter_900Black', fontSize: 48, color: C.ink, letterSpacing: -1.5 },
  meaning: { fontFamily: 'Inter_700Bold', fontSize: 22, color: C.red, marginTop: 6 },
  literal: { fontFamily: 'Inter_400Regular', fontSize: 16, color: C.muted, marginTop: 6 },
  words: { marginTop: 28, borderTopWidth: 1, borderColor: C.line },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: C.line,
  },
  wordBs: { fontFamily: 'Inter_700Bold', fontSize: 18, color: C.ink },
  wordEn: { fontFamily: 'Inter_400Regular', fontSize: 18, color: C.body },
  note: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, color: C.body, marginTop: 20 },
  checking: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 40 },
  result: { marginTop: 36 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 12 },
  score: { fontFamily: 'Inter_900Black', fontSize: 72, color: C.ink, letterSpacing: -3 },
  scoreLabel: { fontFamily: 'Inter_700Bold', fontSize: 22, color: C.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  good: { backgroundColor: C.good },
  close: { backgroundColor: C.gold },
  miss: { backgroundColor: C.red },
  chipText: { fontFamily: 'Inter_700Bold', fontSize: 18, color: C.white },
  heard: { fontFamily: 'Inter_400Regular', fontSize: 15, color: C.muted, marginTop: 16 },
  heardText: { fontFamily: 'Inter_600SemiBold', color: C.ink },
  error: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: C.red, marginTop: 24 },
  footer: { padding: 24, paddingTop: 12, gap: 12 },
  btn: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' },
  btnPrimary: { backgroundColor: C.red, borderBottomWidth: 4, borderColor: C.redDark },
  btnSecondary: { backgroundColor: C.white, borderWidth: 2, borderBottomWidth: 4, borderColor: C.line },
  btnRecording: { backgroundColor: C.gold, borderBottomWidth: 4, borderColor: '#A8742C' },
  btnPressed: { transform: [{ translateY: 2 }], borderBottomWidth: 2 },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 16, letterSpacing: 0.3, color: C.white },
});
