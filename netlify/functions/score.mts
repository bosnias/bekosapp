// Sends the learner's recording to Azure speech-to-text (Bosnian) and returns
// what it heard. The app compares that to the target phrase.

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });
  const key = process.env.AZURE_SPEECH_KEY;
  // Accepts "westus2", "West US 2" or " westus2 " alike.
  const raw = (process.env.AZURE_SPEECH_REGION ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  // Azure regions are short names like westus2. Anything long is a mistake (e.g. a pasted key).
  const region = /^[a-z0-9]{4,24}$/.test(raw) ? raw : '';
  if (!key) return new Response('Speech key not set', { status: 500 });
  if (!region) return new Response('AZURE_SPEECH_REGION must be a region like westus2', { status: 500 });

  const incoming = await req.formData();
  const audio = incoming.get('audio');
  if (!(audio instanceof Blob)) return new Response('Missing audio', { status: 400 });
  if (audio.size > 2_000_000) return new Response('Recording too long', { status: 413 });

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
    return new Response("Could not reach Azure. Check that AZURE_SPEECH_REGION in Netlify is just the region, like westus2.", { status: 502 });
  }
  if (!res.ok) return new Response(await res.text(), { status: 502 });

  const data = await res.json();
  const text = data.combinedPhrases?.[0]?.text ?? '';
  return Response.json({ text });
};

export const config = { path: '/api/score' };
