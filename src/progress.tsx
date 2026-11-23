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
  streak: number; // days in a row with at least one finished stop
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
  const [days, setDays] = useState<string[]>(() => load()?.days ?? []);
  // Speaking is the default every time; the other modes are a temporary fallback.
  const [mode, setMode] = useState<Mode>('speak');

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      globalThis.localStorage?.setItem(KEY, JSON.stringify({ done, introsSeen, mascotAt, days }));
    } catch {}
  }, [done, introsSeen, mascotAt, days]);

  const markDone = (id: string, score: number) => {
    setDone((d) => ({ ...d, [id]: Math.max(d[id] ?? 0, score) }));
    const today = dayKey(0);
    setDays((ds) => (ds.includes(today) ? ds : [...ds.slice(-400), today]));
  };
  const streak = countStreak(days);
  const markIntroSeen = (unitId: string) => setIntrosSeen((m) => ({ ...m, [unitId]: true }));

  return (
    <Ctx.Provider
      value={{ done, markDone, introsSeen, markIntroSeen, mascotAt, setMascotAt, mode, setMode, streak }}
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

// Local date as YYYY-MM-DD, `back` days ago.
function dayKey(back: number) {
  const d = new Date();
  d.setDate(d.getDate() - back);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// Counts back from today (or yesterday, so the streak survives until tonight).
function countStreak(days: string[]) {
  const set = new Set(days);
  let start = set.has(dayKey(0)) ? 0 : set.has(dayKey(1)) ? 1 : -1;
  if (start < 0) return 0;
  let n = 0;
  while (set.has(dayKey(start + n))) n++;
  return n;
}
