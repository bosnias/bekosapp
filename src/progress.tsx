// Which phrases you've finished and whether you're in listen-only mode.
// Kept on this device only (no accounts yet).

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

type Progress = {
  done: Record<string, number>;
  markDone: (id: string, score: number) => void;
  listenOnly: boolean;
  setListenOnly: (v: boolean) => void;
};

const Ctx = createContext<Progress | null>(null);
const KEY = 'bekos-progress-v1';

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
  const [listenOnly, setListenOnly] = useState<boolean>(() => load()?.listenOnly ?? false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      globalThis.localStorage?.setItem(KEY, JSON.stringify({ done, listenOnly }));
    } catch {}
  }, [done, listenOnly]);

  const markDone = (id: string, score: number) =>
    setDone((d) => ({ ...d, [id]: Math.max(d[id] ?? 0, score) }));

  return <Ctx.Provider value={{ done, markDone, listenOnly, setListenOnly }}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProgress outside ProgressProvider');
  return v;
}
