// What you've finished, which story intros you've seen, and where the mascot
// last stood on the map. Kept on this device only (no accounts yet).

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

// speak: hear + say (default, no text)
// noTalk: can't talk, hear + think it (no text)
// noListen: can't listen, the only mode that shows Bosnian text
export type Mode = 'speak' | 'noTalk' | 'noListen';

type Progress = {
  done: Record<string, number>;
  markDone: (id: string, score: number) => void;
  introsSeen: Record<string, boolean>;
  markIntroSeen: (unitId: string) => void;
  mascotAt: string | null; // stop id where the mascot last stood on the map
  setMascotAt: (id: string) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
};

const Ctx = createContext<Progress | null>(null);
const KEY = 'bekos-progress-v3';

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
  const [introsSeen, setIntrosSeen] = useState<Record<string, boolean>>(() => load()?.introsSeen ?? {});
  const [mascotAt, setMascotAt] = useState<string | null>(() => load()?.mascotAt ?? null);
  // Speaking is the default every time; the other modes are a temporary fallback.
  const [mode, setMode] = useState<Mode>('speak');

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      globalThis.localStorage?.setItem(KEY, JSON.stringify({ done, introsSeen, mascotAt }));
    } catch {}
  }, [done, introsSeen, mascotAt]);

  const markDone = (id: string, score: number) =>
    setDone((d) => ({ ...d, [id]: Math.max(d[id] ?? 0, score) }));
  const markIntroSeen = (unitId: string) => setIntrosSeen((m) => ({ ...m, [unitId]: true }));

  return (
    <Ctx.Provider
      value={{ done, markDone, introsSeen, markIntroSeen, mascotAt, setMascotAt, mode, setMode }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useProgress() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProgress outside ProgressProvider');
  return v;
}
