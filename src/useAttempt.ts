// Recording one spoken attempt, shared by lessons and conversations.
//
// Keeps Azure costs down:
// - the recording stops on its own after a time sized to the phrase
// - if the mic barely picked up a voice, the attempt is never sent

import { useEffect, useRef, useState } from 'react';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { transcribe } from './api';

// Mic level (dBFS) that counts as someone speaking, and how long speech must last.
const VOICE_DB = -42;
const MIN_VOICE_MS = 300;
const TICK_MS = 100;

// About 2 s plus 0.7 s per word, never more than 6 s.
export const maxSecondsFor = (phrase: string) =>
  Math.min(6, Math.ceil(2 + 0.7 * phrase.split(/\s+/).filter(Boolean).length));

export function useAttempt(onHeard: (heard: string) => void) {
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const rec = useAudioRecorderState(recorder, TICK_MS);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(0);
  const voicedMs = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopping = useRef(false);

  // Count how long the mic actually heard a voice.
  useEffect(() => {
    if (rec.isRecording && (rec.metering ?? -160) > VOICE_DB) voicedMs.current += TICK_MS;
  }, [rec.isRecording, rec.metering, rec.durationMillis]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const start = async (phrase: string, beforeRecording?: () => void) => {
    setError('');
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) {
      setError("Bekos needs your microphone to hear you. Turn it on in your settings, or switch to Can't talk.");
      return false;
    }
    beforeRecording?.();
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    await recorder.prepareToRecordAsync();
    voicedMs.current = 0;
    stopping.current = false;
    const seconds = maxSecondsFor(phrase);
    setLimit(seconds);
    recorder.record();
    timer.current = setTimeout(stop, seconds * 1000);
    return true;
  };

  const stop = async () => {
    if (stopping.current) return;
    stopping.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    await recorder.stop();
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
    const uri = recorder.uri;
    if (!uri) return;

    // Silence, a tap, or a whisper the mic can't make out: don't send it.
    if (voicedMs.current < MIN_VOICE_MS) {
      setError("We couldn't hear you. Speak a little louder, or hold the phone closer.");
      return;
    }

    setChecking(true);
    try {
      onHeard(await transcribe(uri));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      setError(
        msg.includes('daily limit')
          ? "That's today's practice limit. Come back tomorrow."
          : "Couldn't check that one. Try again.",
      );
    } finally {
      setChecking(false);
    }
  };

  const secondsLeft = Math.max(0, limit - Math.floor(rec.durationMillis / 1000));

  return {
    start,
    stop,
    isRecording: rec.isRecording,
    secondsLeft,
    checking,
    error,
    setError,
  };
}
