// Compares what the speech service heard with the target phrase.
//
// The speech service writes down what it heard, and its transcript varies with
// mic quality, background noise and regional accents even for native speakers.
// So scoring is forgiving about how a word is spelled back, and strict about
// whether the right words were said:
// - letters the transcript often swaps are treated as equal (č/ć, dž/đ, š/s...)
// - Bosnian "ije" and the short "je" count as the same, so do words with or without an h
// - each target word is scored on its own; extra words (um, filler) don't count against you
// - a word that is clearly recognizable gets full credit

export type WordResult = { word: string; status: 'good' | 'close' | 'miss' };
export type ScoreResult = { score: number; words: WordResult[]; heard: string };

const FOLD: [RegExp, string][] = [
  [/dž|đ/g, 'dj'],
  [/[čć]/g, 'c'],
  [/š/g, 's'],
  [/ž/g, 'z'],
  [/ije/g, 'je'],
];

const words = (s: string) =>
  s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

const fold = (w: string) => FOLD.reduce((acc, [re, to]) => acc.replace(re, to), w);

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

const ratio = (a: string, b: string) =>
  a.length + b.length === 0 ? 1 : 1 - distance(a, b) / Math.max(a.length, b.length);

// How alike two words sound, 0 to 1.
function wordSimilarity(target: string, heard: string) {
  const t = fold(target);
  const h = fold(heard);
  return Math.max(ratio(t, h), ratio(t.replace(/h/g, ''), h.replace(/h/g, '')));
}

// Turns similarity into credit: clearly recognizable words get full marks.
const credit = (sim: number) => (sim >= 0.8 ? 1 : Math.max(0, (sim - 0.4) / 0.4));

export function scorePhrase(target: string, heard: string): ScoreResult {
  const heardWords = words(heard);
  const targetWords = target.split(/\s+/).filter(Boolean);

  // Heard words can also be two of our words run together (or one split in two).
  const candidates = [
    ...heardWords,
    ...heardWords.slice(1).map((w, i) => heardWords[i] + w),
  ];

  const results = targetWords.map((raw) => {
    const w = words(raw)[0] ?? '';
    const best = candidates.reduce((m, h) => Math.max(m, wordSimilarity(w, h)), 0);
    return { raw, best };
  });

  // The whole phrase run together ("kakojenana") still counts if it matches as a whole.
  const whole = wordSimilarity(words(target).join(''), heardWords.join(''));
  if (whole >= 0.85) results.forEach((r) => (r.best = Math.max(r.best, whole)));

  const score = targetWords.length
    ? Math.round((results.reduce((sum, r) => sum + credit(r.best), 0) / targetWords.length) * 100)
    : 0;

  return {
    score: heardWords.length ? score : 0,
    words: results.map((r) => ({
      word: r.raw,
      status: r.best >= 0.8 ? 'good' : r.best >= 0.55 ? 'close' : 'miss',
    })),
    heard: heard.trim(),
  };
}
