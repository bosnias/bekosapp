// Sends the learner's recording to Azure speech-to-text (Bosnian) and returns
// what it heard. The app compares that to the target phrase.
//
// Cost guards: recordings over ~6 s worth of audio are refused, tiny files
// (silence) are refused, and each person gets a daily number of attempts.

import { getStore } from '@netlify/blobs';

const DAILY_ATTEMPTS = 200; // per person (per network address) per day
const MAX_BYTES = 300_000; // ~6 s of phone audio with room to spare
const MIN_BYTES = 2_000; // anything smaller is silence or a mis-tap

async function overDailyLimit(ip: string) {
  try {
    const store = getStore('attempts');
    const day = new Date().toISOString().slice(0, 10);
    const key = `${day}/${ip.replace(/[^0-9a-fA-F.:]/g, '')}`;
    const count = ((await store.get(key, { type: 'json' })) as number | null) ?? 0;
    if (count >= DAILY_ATTEMPTS) return true;
    await store.setJSON(key, count + 1);
    return false;
  } catch {
    return false; // if the counter is unavailable, don't block learners
  }
}

export default async (req: Request, context: { ip?: string }) => {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });
  const key = process.env.AZURE_SPEECH_KEY;
  // Accepts the region name in any spelling ("West US 2", extra spaces...).
  const raw = (process.env.AZURE_SPEECH_REGION ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  // Azure regions are short names. Anything long is a mistake (e.g. a pasted key).
  const region = /^[a-z0-9]{4,24}$/.test(raw) ? raw : '';
  if (!key) return new Response('Speech key not set', { status: 500 });
  if (!region) return new Response('AZURE_SPEECH_REGION must be just the region name from Azure', { status: 500 });

  const incoming = await req.formData();
  const audio = incoming.get('audio');
  if (!(audio instanceof Blob)) return new Response('Missing audio', { status: 400 });
  if (audio.size > MAX_BYTES) return new Response('Recording too long', { status: 413 });
  if (audio.size < MIN_BYTES) return Response.json({ text: '' });

  if (await overDailyLimit(context.ip ?? 'unknown')) {
    return new Response('Reached the daily limit', { status: 429 });
  }

  const form = new FormData();
  form.append('audio', audio, (audio as File).name || 'attempt');
  form.append('definition', JSON.stringify({ locales: ['bs-BA'], profanityFilterMode: 'None' }));

  const host = `${region}.api.cognitive.microsoft.com`;
  let res: Response;
  try {
    res = await fetch(`https://${host}/speechtotext/transcriptions:transcribe?api-version=2024-11-15`, {
      method: 'POST',
      headers: { 'Ocp-Apim-Subscription-Key': key },
      body: form,
    });
  } catch {
    return new Response('Could not reach Azure. Check that AZURE_SPEECH_REGION in Netlify is just the region name.', {
      status: 502,
    });
  }
  if (!res.ok) return new Response(await res.text(), { status: 502 });

  const data = await res.json();
  const text = data.combinedPhrases?.[0]?.text ?? '';
  return Response.json({ text });
};

export const config = { path: '/api/score' };
