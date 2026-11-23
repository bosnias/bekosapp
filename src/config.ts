// Things Kenan fills in. Leave a link empty ('') and the app shows "Coming soon".

export const links = {
  // Booking page for short practice calls with native speakers (Calendly, Cal.com, a form...).
  practiceCalls: '',
  // Booking page for the final conversation test.
  finalTest: '',
  // Where "Support" goes, e.g. 'mailto:hello@bekos.app'.
  support: '',
  terms: '',
  privacy: '',
};

// Bekos Pro prices shown on the premium screen. Placeholders: the real prices
// get set in App Store Connect, and these should match them.
export const proPrices = {
  monthly: 9.99,
  yearly: 59.99,
};

// Stand-in speakers, used until real native recordings exist. Each tap of Play
// uses the next one, so learners hear different people and accents.
// Every name here must also be allowed in netlify/functions/speak.mts.
export const standInVoices = [
  { id: 'bs-BA-VesnaNeural', label: 'Bosnia' },
  { id: 'bs-BA-GoranNeural', label: 'Bosnia' },
  { id: 'hr-HR-GabrijelaNeural', label: 'Croatia' },
  { id: 'sr-Latn-RS-NicholasNeural', label: 'Serbia' },
];

// The voice of the other person in conversations.
export const conversationVoice = 'bs-BA-GoranNeural';
