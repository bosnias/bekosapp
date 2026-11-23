// Stand-in voices: reads a phrase with one of a few Azure voices (Bosnian,
// Croatian, Serbian) so learners hear several speakers. Replaced phrase by
// phrase as real native recordings come in.

const VOICES: Record<string, string> = {
  'bs-BA-VesnaNeural': 'bs-BA',
  'bs-BA-GoranNeural': 'bs-BA',
  'hr-HR-GabrijelaNeural': 'hr-HR',
  'sr-Latn-RS-NicholasNeural': 'sr-Latn-RS',
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default async (req: Request) => {
  const params = new URL(req.url).searchParams;
  const text = params.get('text')?.slice(0, 160);
  const voice = VOICES[params.get('voice') ?? ''] ? params.get('voice')! : 'bs-BA-VesnaNeural';
  const key = process.env.AZURE_SPEECH_KEY;
  // Accepts "westus2", "West US 2" or " westus2 " alike.
  const raw = (process.env.AZURE_SPEECH_REGION ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  // Azure regions are short names like westus2. Anything long is a mistake (e.g. a pasted key).
  const region = /^[a-z0-9]{4,24}$/.test(raw) ? raw : '';
  if (!text) return new Response('Missing text', { status: 400 });
  if (!key) return new Response('Speech key not set', { status: 500 });
  if (!region) return new Response('AZURE_SPEECH_REGION must be a region like westus2', { status: 500 });

  const lang = VOICES[voice];
  const ssml = `<speak version="1.0" xml:lang="${lang}"><voice name="${voice}"><prosody rate="-10%">${esc(text)}</prosody></voice></speak>`;

  const host = `${region}.tts.speech.microsoft.com`;
  let res: Response;
  try {
    res = await fetch(`https://${host}/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'bekos',
    },
    body: ssml,
    });
  } catch {
    return new Response("Could not reach Azure. Check that AZURE_SPEECH_REGION in Netlify is just the region, like westus2.", { status: 502 });
  }
  if (!res.ok) return new Response(await res.text(), { status: 502 });

  return new Response(res.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      // Same phrase and voice, same audio: let Netlify's CDN keep it so Azure is only called once.
      'Cache-Control': 'public, max-age=86400',
      'Netlify-CDN-Cache-Control': 'public, max-age=31536000, durable',
    },
  });
};

export const config = { path: '/api/speak' };
