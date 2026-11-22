# Bekos app

Speaking-first language learning. One codebase (Expo) for iPhone, Android and web.

- `App.tsx`: the lesson screen (Hear it, Understand it, Say it)
- `src/lessons.ts`: phrases, meanings, word breakdowns
- `src/score.ts`: compares what was heard with the target phrase
- `netlify/functions/speak.mts`: stand-in Bosnian voice (Azure, bs-BA Vesna)
- `netlify/functions/score.mts`: Bosnian speech-to-text (Azure, bs-BA)

Netlify needs two environment variables: `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`.
