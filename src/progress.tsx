// Which phrases you've finished and which situation you're in.
// Kept on this device only (no accounts yet).

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

// speak: hear + say (default, no text)
// noTalk: can't talk, hear + think it (no text)
// noListen: can't listen, the only mode that shows Bosnian text
export type Mode = 'speak' | 'noTalk' | 'noListen';

type Progress = {
  done: Record<string, number>;
  markDone: (id: string, score: number) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
};

const Ctx = createContext<Progress | null>(null);
const KEY = 'bekos-progress-v2';

// Web keeps progress between visits. On phones it lasts until the app closes,
// until we add device storage with accounts.
const load = () => {
  if (Platform.OS !== 'web') return null;
  try {
    return JSON.parse(globalThis.localStorage?.getItem(KEY) ?? 'null');
  } catch {
    return null;
  }
};

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState<Record<string, number>>(() => load()?.done ?? {});
  // Speaking is the default every time; the other modes are a temporary fallback.
  const [mode, setMode] = useState<Mode>('speak');

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      globalThis.localStorage?.setItem(KEY, JSON.stringify({ done }));
    } catch {}
  }, [done]);

  const markDone = (id: string, score: number) =>
    setDone((d) => ({ ...d, [id]: Math.max(d[id] ?? 0, score) }));

  return <Ctx.Provider value={{ done, markDone, mode, setMode }}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProgress outside ProgressProvider');
  return v;
}
