// Compares what the speech service heard with the target phrase.
// Bosnian is written the way it is spoken, so letter-level similarity is a fair
// stand-in for "how close did that sound" until we add sound-level scoring.

export type WordResult = { word: string; status: 'good' | 'close' | 'miss' };
export type ScoreResult = { score: number; words: WordResult[]; heard: string };

const clean = (s: string) =>
  s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

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

const similarity = (a: string, b: string) =>
  a.length + b.length === 0 ? 1 : 1 - distance(a, b) / Math.max(a.length, b.length);

export function scorePhrase(target: string, heard: string): ScoreResult {
  const t = clean(target);
  const h = clean(heard);
  const heardWords = h ? h.split(' ') : [];

  const words: WordResult[] = target
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const w = clean(raw);
      const best = heardWords.reduce((m, hw) => Math.max(m, similarity(w, hw)), 0);
      return { word: raw, status: best >= 0.8 ? 'good' : best >= 0.5 ? 'close' : 'miss' };
    });

  return { score: h ? Math.round(similarity(t, h) * 100) : 0, words, heard: heard.trim() };
}
