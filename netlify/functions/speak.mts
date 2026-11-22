// Stand-in voice: reads a Bosnian phrase with Azure's bs-BA Vesna voice.
// Replaced phrase by phrase as real native recordings come in.

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default async (req: Request) => {
  const text = new URL(req.url).searchParams.get('text')?.slice(0, 120);
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!text) return new Response('Missing text', { status: 400 });
  if (!key || !region) return new Response('Speech key not set', { status: 500 });

  const ssml = `<speak version="1.0" xml:lang="bs-BA"><voice name="bs-BA-VesnaNeural"><prosody rate="-10%">${esc(text)}</prosody></voice></speak>`;

  const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'bekos',
    },
    body: ssml,
  });
  if (!res.ok) return new Response(await res.text(), { status: 502 });

  return new Response(res.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      // Same phrase, same audio: let Netlify's CDN keep it so Azure is only called once.
      'Cache-Control': 'public, max-age=86400',
      'Netlify-CDN-Cache-Control': 'public, max-age=31536000, durable',
    },
  });
};

export const config = { path: '/api/speak' };
