// Hand-made tab icons: a winding road, a microphone, a passport, three lines.

import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type TabName = 'index' | 'practice' | 'profile' | 'more';

export function TabIcon({ name, tint, size = 28 }: { name: TabName; tint: string; size?: number }) {
  const common = { stroke: tint, strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      {name === 'index' && (
        <>
          <Path d="M8 25 C 8 18, 20 17, 20 11 C 20 7, 14 6, 14 3" {...common} />
          <Circle cx={14} cy={3.5} r={0.6} fill={tint} stroke={tint} strokeWidth={2} />
          <Path d="M20 4 L 20 9 M 20 4 L 25 5.5 L 20 7" {...common} strokeWidth={2} />
        </>
      )}
      {name === 'practice' && (
        <>
          <Rect x={10} y={3} width={8} height={14} rx={4} {...common} />
          <Path d="M6 13 C 6 18, 9.5 21, 14 21 C 18.5 21, 22 18, 22 13 M 14 21 L 14 25 M 10 25 L 18 25" {...common} />
        </>
      )}
      {name === 'profile' && (
        <>
          <Rect x={5} y={3} width={18} height={22} rx={3} {...common} />
          <Circle cx={14} cy={12} r={4} {...common} />
          <Path d="M10 20 L 18 20" {...common} />
        </>
      )}
      {name === 'more' && <Path d="M5 8 L 23 8 M 5 14 L 23 14 M 5 20 L 23 20" {...common} strokeWidth={2.8} />}
    </Svg>
  );
}
