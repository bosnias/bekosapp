// Sends the learner's recording to Azure speech-to-text (Bosnian) and returns
// what it heard. The app compares that to the target phrase.

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return new Response('Speech key not set', { status: 500 });

  const incoming = await req.formData();
  const audio = incoming.get('audio');
  if (!(audio instanceof Blob)) return new Response('Missing audio', { status: 400 });
  if (audio.size > 2_000_000) return new Response('Recording too long', { status: 413 });

  const form = new FormData();
  form.append('audio', audio, (audio as File).name || 'attempt');
  form.append('definition', JSON.stringify({ locales: ['bs-BA'], profanityFilterMode: 'None' }));

  const res = await fetch(
    `https://${region}.api.cognitive.microsoft.com/speechtotext/transcriptions:transcribe?api-version=2024-11-15`,
    { method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': key }, body: form },
  );
  if (!res.ok) return new Response(await res.text(), { status: 502 });

  const data = await res.json();
  const text = data.combinedPhrases?.[0]?.text ?? '';
  return Response.json({ text });
};

export const config = { path: '/api/score' };
