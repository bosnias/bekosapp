// Course content. To swap in a real native recording, drop the file in
// assets/audio/ and add `audio: require('../assets/audio/<id>.m4a')` to the phrase.
// Until then the stand-in voice (Azure, bs-BA Vesna) reads `text`.

export type Word = { word: string; meaning: string };

// Extra related phrases mentioned in a note (heard, not read, in the first half).
export type Extra = { text: string; meaning: string; audio?: number };

// The first half of the course is listening and speaking only: Bosnian text is
// shown only when the learner switches to "Can't listen". Notes stay in English.
export type Phrase = {
  id: string;
  text: string;
  meaning: string;
  literal?: string;
  note?: string;
  extras?: Extra[];
  words: Word[];
  audio?: number;
};

export type Unit = { id: string; title: string; phrases: Phrase[] };

export const course = { language: 'Bosnian', locale: 'bs-BA' };

export const units: Unit[] = [
  {
    id: 'hi',
    title: 'Saying hi',
    phrases: [
      {
        id: 'zdravo',
        text: 'Zdravo!',
        meaning: 'Hello!',
        literal: 'Healthy!',
        note: 'Comes from the word for healthy. Works with anyone.',
        words: [{ word: 'zdravo', meaning: 'hello' }],
      },
      {
        id: 'sta-ima',
        text: 'Šta ima?',
        meaning: "What's up?",
        literal: 'What is there?',
        note: 'The everyday way to greet a friend.',
        extras: [{ text: 'Evo, ništa.', meaning: 'Nothing much. (a common answer)' }],
        words: [
          { word: 'šta', meaning: 'what' },
          { word: 'ima', meaning: 'there is' },
        ],
      },
      {
        id: 'kako-si',
        text: 'Kako si?',
        meaning: 'How are you?',
        note: 'Informal, for friends and family. With someone older or a stranger, use the polite form.',
        extras: [{ text: 'Kako ste?', meaning: 'How are you? (polite)' }],
        words: [
          { word: 'kako', meaning: 'how' },
          { word: 'si', meaning: 'you are' },
        ],
      },
      {
        id: 'dobro-sam',
        text: 'Dobro sam.',
        meaning: "I'm good.",
        literal: 'Good I am.',
        words: [
          { word: 'dobro', meaning: 'good, well' },
          { word: 'sam', meaning: 'I am' },
        ],
      },
      {
        id: 'hvala-lijepa',
        text: 'Hvala lijepa.',
        meaning: 'Thank you very much.',
        literal: 'Thanks, beautiful.',
        note: 'The second word means beautiful. Together it is a warm, polite thank you.',
        words: [
          { word: 'hvala', meaning: 'thanks' },
          { word: 'lijepa', meaning: 'beautiful' },
        ],
      },
      {
        id: 'nema-problema',
        text: 'Nema problema.',
        meaning: 'No problem.',
        literal: 'There is no problem.',
        words: [
          { word: 'nema', meaning: 'there is no' },
          { word: 'problema', meaning: 'problem' },
        ],
      },
      {
        id: 'vidimo-se',
        text: 'Vidimo se!',
        meaning: 'See you!',
        literal: 'We see each other.',
        words: [
          { word: 'vidimo', meaning: 'we see' },
          { word: 'se', meaning: 'each other' },
        ],
      },
    ],
  },
  {
    id: 'family',
    title: 'With family',
    phrases: [
      {
        id: 'dobro-jutro',
        text: 'Dobro jutro.',
        meaning: 'Good morning.',
        words: [
          { word: 'dobro', meaning: 'good' },
          { word: 'jutro', meaning: 'morning' },
        ],
      },
      {
        id: 'laku-noc',
        text: 'Laku noć.',
        meaning: 'Good night.',
        literal: 'Light night.',
        words: [
          { word: 'laku', meaning: 'light, easy' },
          { word: 'noć', meaning: 'night' },
        ],
      },
      {
        id: 'volim-te',
        text: 'Volim te.',
        meaning: 'I love you.',
        words: [
          { word: 'volim', meaning: 'I love' },
          { word: 'te', meaning: 'you' },
        ],
      },
      {
        id: 'falis-mi',
        text: 'Fališ mi.',
        meaning: 'I miss you.',
        literal: 'You are missing to me.',
        words: [
          { word: 'fališ', meaning: 'you are missing' },
          { word: 'mi', meaning: 'to me' },
        ],
      },
      {
        id: 'kako-je-nana',
        text: 'Kako je nana?',
        meaning: "How's grandma?",
        note: 'This is the Bosnian word for grandma. In Croatia and Serbia you will also hear another one.',
        extras: [{ text: 'baka', meaning: 'grandma (Croatia, Serbia)' }],
        words: [
          { word: 'kako', meaning: 'how' },
          { word: 'je', meaning: 'is' },
          { word: 'nana', meaning: 'grandma' },
        ],
      },
      {
        id: 'hajmo-jesti',
        text: 'Hajmo jesti!',
        meaning: "Let's eat!",
        words: [
          { word: 'hajmo', meaning: "let's go" },
          { word: 'jesti', meaning: 'to eat' },
        ],
      },
    ],
  },
  {
    id: 'stuck',
    title: "When you're stuck",
    phrases: [
      {
        id: 'ne-razumijem',
        text: 'Ne razumijem.',
        meaning: "I don't understand.",
        words: [
          { word: 'ne', meaning: 'not' },
          { word: 'razumijem', meaning: 'I understand' },
        ],
      },
      {
        id: 'mozes-li-ponoviti',
        text: 'Možeš li ponoviti?',
        meaning: 'Can you repeat that?',
        note: 'The short middle word turns a sentence into a question.',
        words: [
          { word: 'možeš', meaning: 'you can' },
          { word: 'li', meaning: '(question)' },
          { word: 'ponoviti', meaning: 'to repeat' },
        ],
      },
      {
        id: 'polahko',
        text: 'Polahko.',
        meaning: 'Slowly. Take it easy.',
        note: 'A very Bosnian word. Use it when someone talks too fast, or to tell a friend to relax.',
        words: [{ word: 'polahko', meaning: 'slowly, easy' }],
      },
      {
        id: 'sta-to-znaci',
        text: 'Šta to znači?',
        meaning: 'What does that mean?',
        words: [
          { word: 'šta', meaning: 'what' },
          { word: 'to', meaning: 'that' },
          { word: 'znači', meaning: 'means' },
        ],
      },
      {
        id: 'ne-znam',
        text: 'Ne znam.',
        meaning: "I don't know.",
        words: [
          { word: 'ne', meaning: 'not' },
          { word: 'znam', meaning: 'I know' },
        ],
      },
    ],
  },
  {
    id: 'food',
    title: 'At the table',
    phrases: [
      {
        id: 'prijatno',
        text: 'Prijatno!',
        meaning: 'Enjoy your meal!',
        literal: 'Pleasant!',
        note: 'Said before eating. Also a polite goodbye.',
        words: [{ word: 'prijatno', meaning: 'pleasant' }],
      },
      {
        id: 'hoces-kahvu',
        text: 'Hoćeš kahvu?',
        meaning: 'Want some coffee?',
        note: 'This is the Bosnian word for coffee. You will also hear another one.',
        extras: [{ text: 'kafa', meaning: 'coffee (also common)' }],
        words: [
          { word: 'hoćeš', meaning: 'you want' },
          { word: 'kahvu', meaning: 'coffee' },
        ],
      },
      {
        id: 'jos-malo',
        text: 'Još malo.',
        meaning: 'A little more.',
        words: [
          { word: 'još', meaning: 'more' },
          { word: 'malo', meaning: 'a little' },
        ],
      },
      {
        id: 'sit-sam',
        text: 'Sit sam.',
        meaning: "I'm full.",
        words: [
          { word: 'sit', meaning: 'full' },
          { word: 'sam', meaning: 'I am' },
        ],
      },
    ],
  },
];

export const allPhrases = units.flatMap((u) => u.phrases);

export const findPhrase = (id: string) => allPhrases.find((p) => p.id === id);

export const nextPhrase = (id: string) => {
  const i = allPhrases.findIndex((p) => p.id === id);
  return i >= 0 && i < allPhrases.length - 1 ? allPhrases[i + 1] : null;
};
