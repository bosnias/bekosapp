// Course content.
// Native recordings: drop files in assets/audio/ and list them on the phrase, e.g.
//   recordings: [require('../assets/audio/zdravo-1.m4a'), require('../assets/audio/zdravo-2.m4a')]
// Several speakers per phrase is the goal. Until then stand-in voices read `text`.
// Pictures: drop a file in assets/scenes/ and add `image: require('../assets/scenes/<id>.png')`.

export type Word = { word: string; meaning: string };

// Extra related phrases mentioned in a note (heard, not read, in the first half).
export type Extra = { text: string; meaning: string; audio?: number };

// The first half of the course is listening and speaking only: Bosnian text is
// shown only when the learner switches to "Can't listen". Notes stay in English.
export type Phrase = {
  id: string;
  text: string;
  meaning: string;
  // The situation, shown before the meaning so learners guess from context first.
  scene: string;
  image?: number;
  literal?: string;
  note?: string;
  extras?: Extra[];
  words: Word[];
  recordings?: number[];
};

// A conversation: they say a line, you answer. Any accepted answer counts.
export type Turn = {
  they: { text: string; meaning: string; audio?: number };
  you: { hint: string; accept: string[] };
};

export type Unit = { id: string; title: string; phrases: Phrase[]; talk: Turn[] };

export const course = { language: 'Bosnian', locale: 'bs-BA' };

export const units: Unit[] = [
  {
    id: 'hi',
    title: 'Saying hi',
    talk: [
      { they: { text: 'Zdravo! Šta ima?', meaning: "Hi! What's up?" }, you: { hint: 'Say: nothing much.', accept: ['Evo, ništa.', 'Ništa.'] } },
      { they: { text: 'Kako si?', meaning: 'How are you?' }, you: { hint: "Say you're good.", accept: ['Dobro sam.'] } },
      { they: { text: 'Hvala lijepa.', meaning: 'Thank you very much.' }, you: { hint: 'Say: no problem.', accept: ['Nema problema.'] } },
      { they: { text: 'Vidimo se!', meaning: 'See you!' }, you: { hint: 'Say it back.', accept: ['Vidimo se!'] } },
    ],
    phrases: [
      {
        id: 'zdravo',
        text: 'Zdravo!',
        meaning: 'Hello!',
        scene: "You walk into your aunt's house.",
        literal: 'Healthy!',
        note: 'Comes from the word for healthy. Works with anyone.',
        words: [{ word: 'zdravo', meaning: 'hello' }],
      },
      {
        id: 'sta-ima',
        text: 'Šta ima?',
        meaning: "What's up?",
        scene: 'You run into a friend on the street.',
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
        scene: "You haven't seen your cousin in a while.",
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
        scene: 'Someone just asked how you are.',
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
        scene: 'Your neighbor hands you a plate of baklava.',
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
        scene: 'A friend thanks you for helping them move.',
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
        scene: "You're heading out of a friend's place.",
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
    talk: [
      { they: { text: 'Dobro jutro!', meaning: 'Good morning!' }, you: { hint: 'Say good morning back.', accept: ['Dobro jutro.'] } },
      { they: { text: 'Nana te pozdravlja.', meaning: 'Grandma says hi.' }, you: { hint: 'Ask how grandma is.', accept: ['Kako je nana?'] } },
      { they: { text: 'Dobro je. Volim te.', meaning: "She's good. I love you." }, you: { hint: 'Say it back.', accept: ['Volim te.'] } },
      { they: { text: 'Laku noć!', meaning: 'Good night!' }, you: { hint: 'Say good night back.', accept: ['Laku noć.'] } },
    ],
    phrases: [
      {
        id: 'dobro-jutro',
        text: 'Dobro jutro.',
        meaning: 'Good morning.',
        scene: "You walk into the kitchen. Everyone's already up.",
        words: [
          { word: 'dobro', meaning: 'good' },
          { word: 'jutro', meaning: 'morning' },
        ],
      },
      {
        id: 'laku-noc',
        text: 'Laku noć.',
        meaning: 'Good night.',
        scene: "Everyone's heading to bed.",
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
        scene: 'You hug your mom before you leave.',
        words: [
          { word: 'volim', meaning: 'I love' },
          { word: 'te', meaning: 'you' },
        ],
      },
      {
        id: 'falis-mi',
        text: 'Fališ mi.',
        meaning: 'I miss you.',
        scene: 'You call your grandpa from far away.',
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
        scene: 'You call your uncle and want news about grandma.',
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
        scene: "Dinner is on the table and everyone's still talking.",
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
    talk: [
      { they: { text: 'Odakle si?', meaning: 'Where are you from?' }, you: { hint: "You didn't get that. Say so.", accept: ['Ne razumijem.'] } },
      { they: { text: 'Odakle si ti?', meaning: 'Where are you from?' }, you: { hint: 'Ask them to repeat it, or to slow down.', accept: ['Možeš li ponoviti?', 'Polahko.'] } },
      { they: { text: 'Burek ili pita?', meaning: 'Burek or pita?' }, you: { hint: "You can't decide. Say you don't know.", accept: ['Ne znam.'] } },
    ],
    phrases: [
      {
        id: 'ne-razumijem',
        text: 'Ne razumijem.',
        meaning: "I don't understand.",
        scene: "Someone says something you didn't catch at all.",
        words: [
          { word: 'ne', meaning: 'not' },
          { word: 'razumijem', meaning: 'I understand' },
        ],
      },
      {
        id: 'mozes-li-ponoviti',
        text: 'Možeš li ponoviti?',
        meaning: 'Can you repeat that?',
        scene: 'You almost caught it. You need to hear it once more.',
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
        scene: 'Your uncle is talking way too fast.',
        note: 'A very Bosnian word. Use it when someone talks too fast, or to tell a friend to relax.',
        words: [{ word: 'polahko', meaning: 'slowly, easy' }],
      },
      {
        id: 'sta-to-znaci',
        text: 'Šta to znači?',
        meaning: 'What does that mean?',
        scene: "Someone uses a word you've never heard.",
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
        scene: "Someone asks you something you can't answer.",
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
    talk: [
      { they: { text: 'Hoćeš kahvu?', meaning: 'Want some coffee?' }, you: { hint: 'Say thank you.', accept: ['Hvala lijepa.', 'Hvala.'] } },
      { they: { text: 'Prijatno!', meaning: 'Enjoy your meal!' }, you: { hint: 'Say it back.', accept: ['Prijatno!'] } },
      { they: { text: 'Hoćeš još?', meaning: 'Want more?' }, you: { hint: 'Ask for a little more.', accept: ['Još malo.'] } },
      { they: { text: 'Još?', meaning: 'More?' }, you: { hint: "Say you're full.", accept: ['Sit sam.'] } },
    ],
    phrases: [
      {
        id: 'prijatno',
        text: 'Prijatno!',
        meaning: 'Enjoy your meal!',
        scene: "The food is served and everyone's about to eat.",
        literal: 'Pleasant!',
        note: 'Said before eating. Also a polite goodbye.',
        words: [{ word: 'prijatno', meaning: 'pleasant' }],
      },
      {
        id: 'hoces-kahvu',
        text: 'Hoćeš kahvu?',
        meaning: 'Want some coffee?',
        scene: 'Grandma is making coffee and looks at you.',
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
        scene: 'Grandma asks if you want more, and you do.',
        words: [
          { word: 'još', meaning: 'more' },
          { word: 'malo', meaning: 'a little' },
        ],
      },
      {
        id: 'sit-sam',
        text: 'Sit sam.',
        meaning: "I'm full.",
        scene: 'Grandma tries to give you a third plate.',
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

export const findUnit = (id: string) => units.find((u) => u.id === id);

export const unitOf = (phraseId: string) => units.find((u) => u.phrases.some((p) => p.id === phraseId));

export const nextPhrase = (id: string) => {
  const i = allPhrases.findIndex((p) => p.id === id);
  return i >= 0 && i < allPhrases.length - 1 ? allPhrases[i + 1] : null;
};
