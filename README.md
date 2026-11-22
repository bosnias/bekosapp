# Bekos app

Speaking-first language learning. One codebase (Expo) for iPhone, Android and web.

- `src/app/index.tsx`: lesson map (units, phrases, Speaking / Listen only)
- `src/app/lesson/[id].tsx`: one lesson (Hear it, Understand it, Say it)
- `src/lessons.ts`: units, phrases, meanings, word breakdowns
- `src/app/talk/[unit].tsx`: end-of-unit conversation (they say a line, you answer)
- `src/config.ts`: booking links for practice calls and the final test, stand-in voices
- `src/theme.ts`: brand colors and fonts (fonts are placeholders)
- `RECORDINGS.md`: what to record (several speakers per phrase, conversation lines) and the pictures to draw
- `src/score.ts`: compares what was heard with the target phrase
- `netlify/functions/speak.mts`: stand-in Bosnian voice (Azure, bs-BA Vesna)
- `netlify/functions/score.mts`: Bosnian speech-to-text (Azure, bs-BA)

Netlify needs two environment variables: `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`.
