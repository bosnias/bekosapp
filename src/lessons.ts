// Lesson content. To swap in a real native recording later, drop the file in
// assets/audio/ and set `audio: require('../assets/audio/sta-ima.m4a')`.
// Until then the stand-in voice (Azure, bs-BA Vesna) reads `text`.

export type Word = { word: string; meaning: string };

export type Phrase = {
  id: string;
  text: string;
  meaning: string;
  literal: string;
  note: string;
  words: Word[];
  audio?: number;
};

export const phrases: Phrase[] = [
  {
    id: 'sta-ima',
    text: 'Šta ima?',
    meaning: "What's up?",
    literal: 'What is there?',
    note: 'The everyday way to greet a friend. A common answer is "Evo, ništa" (Nothing much).',
    words: [
      { word: 'šta', meaning: 'what' },
      { word: 'ima', meaning: 'there is' },
    ],
  },
  {
    id: 'kako-si',
    text: 'Kako si?',
    meaning: 'How are you?',
    literal: 'How are you?',
    note: 'Informal, for friends and family. With someone older or a stranger, say "Kako ste?"',
    words: [
      { word: 'kako', meaning: 'how' },
      { word: 'si', meaning: 'you are' },
    ],
  },
  {
    id: 'hvala-lijepa',
    text: 'Hvala lijepa.',
    meaning: 'Thank you very much.',
    literal: 'Thanks, beautiful.',
    note: '"Lijepa" means beautiful. Together it is a warm, polite thank you.',
    words: [
      { word: 'hvala', meaning: 'thanks' },
      { word: 'lijepa', meaning: 'beautiful' },
    ],
  },
];
