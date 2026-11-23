// Brand colors and fonts in one place. The app follows the phone's light/dark
// setting. Fonts are placeholders (Inter): to swap them, change the names below
// and the files loaded in src/app/_layout.tsx.

import { useColorScheme } from 'react-native';

const light = {
  bg: '#FFFFFF',
  card: '#FBF3E6', // cream panels: leg cards, scenes, passport
  cardPressed: '#F6E8D0',
  cardBorder: '#141414',
  ink: '#141414', // strongest text
  body: '#4B4B4B',
  muted: '#6B6B6B',
  faint: '#9C958A',
  line: '#E2E2E2',
  soft: '#F4F4F2',
  raised: '#D9D1C3', // the 3D edge under white buttons and stops
  red: '#B33A1B',
  redDark: '#7E2611',
  gold: '#DDA048',
  goldDark: '#A8742C',
  good: '#2F7A3B',
  onAccent: '#FFFFFF', // text on red or green
  onGold: '#141414', // text on gold
  road: '#ECE4D6',
  roadLine: '#FFFFFF',
  track: '#E8DDCB',
  slotBorder: '#C9BFAF',
  slotBg: '#F6F1E8',
  stampLine: '#D3C8B5',
  stampText: '#B3A893',
  ground: '#E6EDD8', // the journey map's land
  groundLine: '#DAE3C8',
  tileTop: '#FBF7EF',
  tileSide: '#C8BBA2',
  bubble: '#FFFFFF',
  proLine: '#DDA048',
};

export type Palette = typeof light;

const dark: Palette = {
  bg: '#141A1E',
  card: '#1E252A',
  cardPressed: '#262F35',
  cardBorder: '#323C43',
  ink: '#F3EFE7',
  body: '#C7C1B6',
  muted: '#93999D',
  faint: '#6F787E',
  line: '#29323A',
  soft: '#1E252A',
  raised: '#29323A',
  red: '#D04A28',
  redDark: '#8A2C14',
  gold: '#E2A84F',
  goldDark: '#9A6A22',
  good: '#3C9A4B',
  onAccent: '#FFFFFF',
  onGold: '#141414',
  road: '#222B31',
  roadLine: '#36424A',
  track: '#29323A',
  slotBorder: '#3A454C',
  slotBg: '#1A2025',
  stampLine: '#36424A',
  stampText: '#6F787E',
  ground: '#17211B',
  groundLine: '#1E2A23',
  tileTop: '#3A4842',
  tileSide: '#232E29',
  bubble: '#F3EFE7',
  proLine: '#E2A84F',
};

export const palettes = { light, dark };

export function useColors(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export const font = {
  regular: 'Inter_400Regular',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
  black: 'Inter_900Black',
};
