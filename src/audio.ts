// Small audio helpers shared by lessons and conversations.

import { useMemo, useRef, useState } from 'react';
import { setAudioModeAsync, useAudioPlayer, type AudioPlayer, type AudioSource } from 'expo-audio';
import { speakUrl } from './api';
import { standInVoices } from './config';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function playbackMode() {
  await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
}

// Starts a player once its audio has loaded (up to 3 s).
export async function playWhenReady(player: AudioPlayer) {
  for (let i = 0; i < 30 && !player.isLoaded; i++) await wait(100);
  await player.seekTo(0);
  player.play();
}

// Plays to the end and resolves (up to `max` ms).
export async function playToEnd(player: AudioPlayer, max = 8000) {
  await playWhenReady(player);
  const start = Date.now();
  await wait(250);
  while (player.playing && Date.now() - start < max) await wait(100);
}

// Plays one-off clips (single words, related phrases, conversation lines).
export function useClipPlayer() {
  const player = useAudioPlayer(null);
  const play = async (text: string, opts?: { voice?: string; audio?: AudioSource }) => {
    await playbackMode();
    player.replace(opts?.audio ?? { uri: speakUrl(text, opts?.voice) });
    await playWhenReady(player);
  };
  return { player, play };
}

// A phrase heard from several speakers. Native recordings win; otherwise the
// stand-in voices are used. Each play moves to the next speaker.
export function useSpeakers(text: string, recordings?: AudioSource[]) {
  const native = !!recordings && recordings.length > 0;
  // Same text, same objects: keeps the players from being rebuilt on every render.
  const { sources, labels } = useMemo(
    () => ({
      sources: (native ? recordings! : standInVoices.map((v) => ({ uri: speakUrl(text, v.id) }))) as AudioSource[],
      labels: native ? recordings!.map(() => '') : standInVoices.map((v) => v.label),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, native],
  );

  // Four fixed players (hooks can't be created in a loop that changes size).
  const p0 = useAudioPlayer(sources[0] ?? null);
  const p1 = useAudioPlayer(sources[1] ?? null);
  const p2 = useAudioPlayer(sources[2] ?? null);
  const p3 = useAudioPlayer(sources[3] ?? null);
  const players = [p0, p1, p2, p3].slice(0, Math.min(4, sources.length));

  const [index, setIndex] = useState(0);
  const nextIndex = useRef(0);

  const stopAll = () => players.forEach((p) => p.pause());

  // Plays the next speaker.
  const play = async () => {
    await playbackMode();
    stopAll();
    const i = nextIndex.current;
    nextIndex.current = (i + 1) % players.length;
    setIndex(i);
    await playWhenReady(players[i]);
  };

  // Plays the same speaker again (used by "Say it with me").
  const current = () => players[index];

  return {
    play,
    stopAll,
    current,
    count: players.length,
    index,
    label: labels[index] ?? '',
  };
}
