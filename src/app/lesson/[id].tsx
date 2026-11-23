import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { findPhrase, unitOf, type Phrase } from '../../lessons';
import { scorePhrase, type ScoreResult } from '../../score';
import { useAttempt } from '../../useAttempt';
import { playToEnd, useClipPlayer, useSpeakers } from '../../audio';
import { useProgress } from '../../progress';
import { toMap } from '../../nav';
import { Button } from '../../components/Button';
import { Scene } from '../../components/Scene';
import { IdleHint, SmallLink } from '../../components/IdleHint';
import { Appear, Bar, Burst, CountUp, Pop } from '../../components/Motion';
import { feel } from '../../feel';
import { color, font } from '../../theme';

type Step = 'hear' | 'understand' | 'say';
const SHADOW_TIMES = 3;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const phrase = findPhrase(id);
  if (!phrase) {
    return (
      <SafeAreaView style={s.screen}>
        <View style={s.missing}>
          <Text style={s.title}>Lesson not found.</Text>
          <Button label="Back to the map" onPress={() => router.replace('/')} />
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
  const { mode, setMode, markDone } = useProgress();
  const showText = mode === 'noListen'; // Bosnian text only when you can't listen
  const canSpeak = mode !== 'noTalk';

  const [step, setStep] = useState<Step>('hear');
  const [plays, setPlays] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [shadowing, setShadowing] = useState(0); // 0 = off, else round number
  const [result, setResult] = useState<ScoreResult | null>(null);

  const speakers = useSpeakers(phrase.text, phrase.recordings);
  const clip = useClipPlayer();
  const attempt = useAttempt((heard) => {
    const r = scorePhrase(phrase.text, heard);
    if (r.score >= 85) feel.success();
    else feel.miss();
    setResult(r);
    markDone(phrase.id, r.score);
  });
  const { checking, error } = attempt;
  const alive = useRef(true);

  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );

    const unit = unitOf(phrase.id);
  const lastInUnit = unit?.phrases[unit.phrases.length - 1]?.id === phrase.id;
  // Back to the map after each phrase so you see the mascot hop; the last phrase of a leg leads into its encounter.
  const goNext = () => {
    if (lastInUnit && unit) router.replace(`/talk/${unit.id}`);
    else toMap();
  };
  const nextLabel = lastInUnit && unit ? `Meet ${unit.encounter.name}` : 'Continue';

  const play = async () => {
    clip.player.pause();
    await speakers.play();
    setPlays((n) => n + 1);
  };

  const playClip = (text: string, audio?: number) => {
    speakers.stopAll();
    clip.play(text, { audio });
  };

  // "Say it with me": the same speaker plays a few times while you speak along.
  const shadow = async () => {
    attempt.setError('');
    clip.player.pause();
    if (plays === 0) await speakers.play();
    const player = speakers.current();
    for (let i = 1; i <= SHADOW_TIMES && alive.current; i++) {
      setShadowing(i);
      await playToEnd(player);
      await wait(700);
    }
    if (alive.current) setShadowing(0);
  };

  const startRecording = () => {
    setResult(null);
    attempt.start(phrase.text, () => {
      speakers.stopAll();
      clip.player.pause();
    });
  };

  const stepNumber = step === 'hear' ? 0 : step === 'understand' ? 1 : 2;
  const labels = [showText ? 'Read it' : 'Hear it', 'Understand it', canSpeak ? 'Say it' : 'Think it'];
  const wordLabel = (i: number) => (showText ? phrase.words[i]?.word : phrase.words[i]?.meaning) ?? '';
  const speakerLine =
    plays > 0 && speakers.count > 1
      ? `Speaker ${speakers.index + 1} of ${speakers.count}${speakers.label ? ` · ${speakers.label}` : ''}`
      : '';
  const busy = shadowing > 0;

  return (
    <View style={s.lesson}>
      <View style={s.top}>
        <Pressable accessibilityRole="button" onPress={toMap} hitSlop={12}>
          <Text style={s.back}>‹ Map</Text>
        </Pressable>
        {unit && <Text style={s.position}>{unit.place}</Text>}
      </View>
      <View style={s.progress}>
        {labels.map((label, i) => (
          <View key={label} style={s.progressItem}>
            <Bar value={i <= stepNumber ? 1 : 0} style={{ height: 6 }} />
            <Text style={[s.barLabel, i === stepNumber && s.barLabelOn]}>{label}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <Appear key={`${step}-${revealed}-${mode}`} style={{ flexGrow: 1 }}>
        {step === 'hear' && !showText && (
          <View style={s.center}>
            <Image source={require('../../../assets/mascot.png')} style={s.mascot} resizeMode="contain" />
            <Text style={s.title}>Listen first.</Text>
            <Text style={s.sub}>Each time you play it, a different person says it.</Text>
            {!!speakerLine && <Text style={s.speaker}>{speakerLine}</Text>}
          </View>
        )}

        {step === 'hear' && showText && (
          <View>
            <Text style={s.phrase}>{phrase.text}</Text>
            <Text style={[s.sub, s.left, { marginTop: 16 }]}>Read it slowly and sound it out in your head.</Text>
          </View>
        )}

        {step === 'understand' && (
          <View>
            {showText && <Text style={[s.phrase, { marginBottom: 20 }]}>{phrase.text}</Text>}
            <Scene text={phrase.scene} image={phrase.image} />
            {!revealed ? (
              <Text style={[s.sub, s.left, { marginTop: 20 }]}>
                {showText
                  ? 'What do you think it means here? Guess, then check.'
                  : 'What do you think they said? Play it again, guess, then check.'}
              </Text>
            ) : (
              <View>
                <Text style={[s.phrase, { marginTop: 24 }]}>{phrase.meaning}</Text>
                {phrase.literal && phrase.literal !== phrase.meaning && (
                  <Text style={s.literal}>Word for word: {phrase.literal}</Text>
                )}
                <View style={s.words}>
                  {phrase.words.map((w, i) => (
                    <View key={i} style={s.wordRow}>
                      <Text style={s.wordBs}>{showText ? w.word : `Word ${i + 1}`}</Text>
                      <Text style={s.wordEn}>{w.meaning}</Text>
                      {!showText && <Small label="Play" onPress={() => playClip(w.word)} />}
                    </View>
                  ))}
                </View>
                {phrase.note && <Text style={s.note}>{phrase.note}</Text>}
                {phrase.extras && (
                  <View style={s.words}>
                    {phrase.extras.map((x) => (
                      <View key={x.text} style={s.wordRow}>
                        {showText && <Text style={s.wordBs}>{x.text}</Text>}
                        <Text style={[s.wordEn, !showText && s.extraEn]}>{x.meaning}</Text>
                        {!showText && <Small label="Play" onPress={() => playClip(x.text, x.audio)} />}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {step === 'say' && (
          <View>
            {showText ? (
              <View>
                <Text style={s.phrase}>{phrase.text}</Text>
                <Text style={s.meaning}>{phrase.meaning}</Text>
              </View>
            ) : (
              <Text style={s.phrase}>{phrase.meaning}</Text>
            )}

            {!canSpeak && (
              <Text style={[s.sub, s.left, { marginTop: 32 }]}>
                Say it in your head, or under your breath. Switch to Speaking when you can talk out loud to get scored.
              </Text>
            )}

            {canSpeak && busy && (
              <View style={s.shadowBox}>
                <Text style={s.shadowTitle}>
                  Say it with me · {shadowing} of {SHADOW_TIMES}
                </Text>
                <Text style={[s.sub, s.left]}>Speak along with it, at the same time. Earphones help.</Text>
              </View>
            )}

            {canSpeak && !busy && (
              <View>
                {checking && (
                  <View style={s.checking}>
                    <ActivityIndicator color={color.red} />
                    <Text style={s.sub}>Listening back…</Text>
                  </View>
                )}
                {result && !checking && (
                  <Result
                    result={result}
                    label={wordLabel}
                    showText={showText}
                    onWord={showText ? undefined : (i) => playClip(phrase.words[i]?.word ?? '')}
                  />
                )}
                {!!error && <Text style={s.error}>{error}</Text>}
              </View>
            )}
          </View>
        )}
        </Appear>
      </ScrollView>

      <View style={s.footer}>
        {mode === 'noListen' && <SmallLink label="Sound back on" onPress={() => setMode('speak')} />}
        {mode === 'noTalk' && <SmallLink label="I can talk now" onPress={() => setMode('speak')} />}
        {mode === 'speak' && (
          <IdleHint
            resetKey={`${step}-${plays}-${!!result}-${attempt.isRecording}-${checking}-${busy}-${revealed}`}
            active={
              (step === 'hear' && plays === 0) ||
              (step === 'say' && !result && !attempt.isRecording && !checking && !busy)
            }
            hints={
              step === 'hear'
                ? [{ label: "Can't listen right now?", onPress: () => setMode('noListen') }]
                : [{ label: "Can't talk right now?", onPress: () => setMode('noTalk') }]
            }
          />
        )}
        {step === 'hear' && !showText && (
          <>
            <Button
              label={plays ? 'Play another speaker' : 'Play'}
              onPress={play}
              kind={plays ? 'secondary' : 'primary'}
            />
            {plays > 0 && <Button label="What does it mean?" onPress={() => setStep('understand')} />}
          </>
        )}

        {step === 'hear' && showText && <Button label="What does it mean?" onPress={() => setStep('understand')} />}

        {step === 'understand' && (
          <>
            {!showText && <Button label="Play again" onPress={play} kind="secondary" />}
            {revealed ? (
              <Button label={canSpeak ? 'Now say it' : 'Next'} onPress={() => setStep('say')} />
            ) : (
              <Button label="Show the meaning" onPress={() => setRevealed(true)} />
            )}
          </>
        )}

        {step === 'say' && !canSpeak && (
          <>
            <Button label="Play again" onPress={play} kind="secondary" />
            <Button
              label={nextLabel}
              onPress={() => {
                markDone(phrase.id, 0);
                goNext();
              }}
            />
          </>
        )}

        {step === 'say' && canSpeak && !checking && !busy && (
          <>
            {attempt.isRecording ? (
              <Button label={`Done  ·  ${attempt.secondsLeft}s left`} onPress={attempt.stop} kind="gold" />
            ) : result ? (
              <>
                {!showText && <Button label="Hear it again" onPress={play} kind="secondary" />}
                <Button label="Try again" onPress={startRecording} kind="secondary" />
                <Button label={nextLabel} onPress={goNext} />
              </>
            ) : (
              <>
                {!showText && (
                  <View style={s.pair}>
                    <View style={{ flex: 1 }}>
                      <Button label="Hear it again" onPress={play} kind="secondary" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button label="Say it with me" onPress={shadow} kind="secondary" />
                    </View>
                  </View>
                )}
                <Button label="Tap and speak" onPress={startRecording} />
              </>
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
      hitSlop={8}
      style={({ pressed }) => [s.small, pressed && { backgroundColor: color.soft }]}
    >
      <Text style={s.smallText}>{label}</Text>
    </Pressable>
  );
}

function Result({
  result,
  label,
  showText,
  onWord,
}: {
  result: ScoreResult;
  label: (i: number) => string;
  showText: boolean;
  onWord?: (i: number) => void;
}) {
  const allGood = result.words.every((w) => w.status === 'good');
  const verdict = result.score >= 85 && allGood ? 'Spot on.' : result.score >= 60 ? 'Close.' : 'Not yet.';
  return (
    <View style={s.result}>
      {verdict === 'Spot on.' && <Burst />}
      <View style={s.scoreRow}>
        <CountUp to={result.score} style={s.score} />
        <Pop delay={500}>
          <Text style={s.scoreLabel}>{verdict}</Text>
        </Pop>
      </View>
      <View style={s.chips}>
        {result.words.map((w, i) => (
          <Pop key={i} delay={250 + i * 90}>
            <Pressable disabled={!onWord} onPress={() => onWord?.(i)} style={[s.chip, s[w.status]]}>
              <Text style={[s.chipText, w.status === 'close' && { color: color.ink }]}>{label(i)}</Text>
            </Pressable>
          </Pop>
        ))}
      </View>
      {showText ? (
        <Text style={s.heard}>
          We heard: <Text style={s.heardText}>{result.heard || 'nothing clear'}</Text>
        </Text>
      ) : (
        <Text style={s.heard}>Tap a word to hear it again.</Text>
      )}
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
  body: { flexGrow: 1, padding: 24, paddingTop: 28 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  mascot: { width: 140, height: 230, marginBottom: 12 },
  title: { fontFamily: font.extrabold, fontSize: 30, color: color.ink, letterSpacing: -0.8 },
  sub: { fontFamily: font.regular, fontSize: 16, lineHeight: 24, color: color.body, textAlign: 'center' },
  speaker: { fontFamily: font.semibold, fontSize: 14, color: color.muted },
  left: { textAlign: 'left' },
  phrase: { fontFamily: font.black, fontSize: 40, lineHeight: 46, color: color.ink, letterSpacing: -1.2 },
  meaning: { fontFamily: font.bold, fontSize: 22, color: color.red, marginTop: 6 },
  literal: { fontFamily: font.regular, fontSize: 16, color: color.muted, marginTop: 6 },
  words: { marginTop: 24, borderTopWidth: 1, borderColor: color.line },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: color.line,
    gap: 16,
  },
  wordBs: { fontFamily: font.bold, fontSize: 18, color: color.ink },
  wordEn: { fontFamily: font.regular, fontSize: 18, color: color.body, flex: 1, textAlign: 'right' },
  extraEn: { textAlign: 'left', color: color.ink },
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderBottomWidth: 3,
    borderColor: color.line,
  },
  smallText: { fontFamily: font.bold, fontSize: 14, color: color.red },
  note: { fontFamily: font.regular, fontSize: 16, lineHeight: 24, color: color.body, marginTop: 20 },
  shadowBox: { marginTop: 32, gap: 8 },
  shadowTitle: { fontFamily: font.extrabold, fontSize: 20, color: color.ink },
  checking: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 40 },
  result: { marginTop: 32 },
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
  pair: { flexDirection: 'row', gap: 12 },
});
