// Small hand-drawn icons used around the app. Placeholders until custom art exists.

import Svg, { Circle, Path, Rect } from 'react-native-svg';

type P = { size?: number; color: string };

// The Pro mark: a loaf of bread with score lines.
export function Loaf({ size = 30, color, shade }: P & { shade: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path d="M4 20 C 4 11, 10 7, 16 7 C 22 7, 28 11, 28 20 C 28 24, 25 26, 16 26 C 7 26, 4 24, 4 20 Z" fill={shade} />
      <Path d="M4 18 C 4 10, 10 6, 16 6 C 22 6, 28 10, 28 18 C 28 22, 25 24, 16 24 C 7 24, 4 22, 4 18 Z" fill={color} />
      <Path d="M10 11 L 13 16 M 15 10 L 18 15 M 20 11 L 23 16" stroke={shade} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function Flame({ size = 26, color, core }: P & { core: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26">
      <Path d="M13 2 C 15 7, 21 9, 21 16 C 21 21, 17 24, 13 24 C 9 24, 5 21, 5 16 C 5 12, 8 10, 9 7 C 10 10, 11 11, 12 11 C 12 8, 12 5, 13 2 Z" fill={color} />
      <Path d="M13 13 C 14 16, 17 17, 17 19.5 C 17 21.5, 15 23, 13 23 C 11 23, 9 21.5, 9 19.5 C 9 17.5, 12 16, 13 13 Z" fill={core} />
    </Svg>
  );
}

export function ListIcon({ size = 26, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26">
      {[6, 13, 20].map((y) => (
        <Path key={y} d={`M5 ${y} L 5.1 ${y} M 10 ${y} L 22 ${y}`} stroke={color} strokeWidth={3.2} strokeLinecap="round" />
      ))}
    </Svg>
  );
}

export function Close({ size = 24, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 5 L 19 19 M 19 5 L 5 19" stroke={color} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}

export function Check({ size = 26, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26">
      <Path d="M5 13.5 L 10.5 19 L 21 7.5" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function Ear({ size = 26, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26">
      <Path d="M8 10 C 8 5.5, 11 3, 14.5 3 C 18.5 3, 21 6, 21 10 C 21 14, 17 15, 16.5 18.5 C 16 22, 14 23, 12 23 C 10 23, 8.5 21.5, 8.5 20" stroke={color} strokeWidth={2.8} strokeLinecap="round" fill="none" />
      <Path d="M12 10.5 C 12 8.5, 13.2 7.5, 14.6 7.5 C 16 7.5, 17 8.6, 17 10" stroke={color} strokeWidth={2.4} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function People({ size = 30, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30">
      <Circle cx={10} cy={9} r={4} fill={color} />
      <Circle cx={20} cy={10} r={3.5} fill={color} />
      <Path d="M3 24 C 3 18, 6 15, 10 15 C 14 15, 17 18, 17 24 Z" fill={color} />
      <Path d="M18.5 24 C 18.5 19.5, 17.8 17.5, 16.5 16 C 17.5 15.3, 18.6 15, 20 15 C 24 15, 27 18, 27 24 Z" fill={color} />
    </Svg>
  );
}

export function Mic({ size = 24, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={8} y={2} width={8} height={13} rx={4} fill={color} />
      <Path d="M4.5 11 C 4.5 15.5, 8 18.5, 12 18.5 C 16 18.5, 19.5 15.5, 19.5 11 M 12 18.5 L 12 22" stroke={color} strokeWidth={2.4} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function Reel({ size = 24, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3} y={3} width={18} height={18} rx={5} fill={color} />
      <Path d="M10 8.5 L 16 12 L 10 15.5 Z" fill="#FFFFFF" />
    </Svg>
  );
}

export function Phone({ size = 24, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6.5 3 L 9.5 3 L 11 8 L 8.8 9.6 C 9.8 11.9, 12.1 14.2, 14.4 15.2 L 16 13 L 21 14.5 L 21 17.5 C 21 19.4, 19.4 21, 17.5 21 C 9.5 21, 3 14.5, 3 6.5 C 3 4.6, 4.6 3, 6.5 3 Z" fill={color} />
    </Svg>
  );
}

export function Globe({ size = 24, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} fill={color} />
      <Path d="M3 12 L 21 12 M 12 3 C 8.5 7, 8.5 17, 12 21 M 12 3 C 15.5 7, 15.5 17, 12 21" stroke="#FFFFFF" strokeWidth={1.6} fill="none" />
    </Svg>
  );
}

export function Hush({ size = 24, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 9 L 7 9 L 12 4.5 L 12 19.5 L 7 15 L 3 15 Z" fill={color} />
      <Path d="M15.5 9.5 C 16.6 10.8, 16.6 13.2, 15.5 14.5" stroke={color} strokeWidth={2.2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function Person({ size = 24, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={4.5} fill={color} />
      <Path d="M3.5 21 C 3.5 15.5, 7.5 13.5, 12 13.5 C 16.5 13.5, 20.5 15.5, 20.5 21 Z" fill={color} />
    </Svg>
  );
}

export function Help({ size = 24, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} fill={color} />
      <Path d="M9 9.5 C 9 7.5, 10.5 6.5, 12 6.5 C 13.8 6.5, 15 7.6, 15 9.2 C 15 11.5, 12 11.5, 12 14" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <Circle cx={12} cy={17.5} r={1.4} fill="#FFFFFF" />
    </Svg>
  );
}

export function Doc({ size = 24, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={4.5} y={2.5} width={15} height={19} rx={3} fill={color} />
      <Path d="M8 8 L 16 8 M 8 12 L 16 12 M 8 16 L 13 16" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function Chevron({ size = 18, color, down = false }: P & { down?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" style={{ transform: [{ rotate: down ? '90deg' : '0deg' }] }}>
      <Path d="M6.5 3.5 L 12 9 L 6.5 14.5" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}
