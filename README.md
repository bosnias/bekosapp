# Bekos app

Speaking-first language learning. One codebase (Expo) for iPhone, Android and web.

- `src/app/index.tsx`: lesson map (units, phrases, Speaking / Listen only)
- `src/app/lesson/[id].tsx`: one lesson (Hear it, Understand it, Say it)
- `src/lessons.ts`: units, phrases, meanings, word breakdowns
- `src/theme.ts`: brand colors and fonts (fonts are placeholders)
- `RECORDINGS.md`: the phrase list for the native speaker
- `src/score.ts`: compares what was heard with the target phrase
- `netlify/functions/speak.mts`: stand-in Bosnian voice (Azure, bs-BA Vesna)
- `netlify/functions/score.mts`: Bosnian speech-to-text (Azure, bs-BA)

Netlify needs two environment variables: `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`.
