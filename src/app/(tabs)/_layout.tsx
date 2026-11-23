import { useMemo } from 'react';
// The bottom bar: Journey, Practice, Profile, More.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabIcon, type TabName } from '../../components/TabIcon';
import { feel } from '../../feel';
import { font, useColors, type Palette } from '../../theme';

const LABELS: Record<TabName, string> = { index: 'Journey', practice: 'Practice', profile: 'Profile', more: 'More' };

function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const { color, s } = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, i) => {
        const active = state.index === i;
        const name = route.name as TabName;
        if (!(name in LABELS)) return null;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              feel.select();
              if (!active) navigateToTab(route.key);
            }}
            style={s.item}
          >
            <View style={[s.mark, active && s.markOn]} />
            <TabIcon name={name} tint={active ? color.red : color.faint} />
            <Text style={[s.label, active && s.labelOn]}>{LABELS[name]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const { color, s } = useStyles();
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.bg } }} tabBar={(p) => <TabBar {...p} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="practice" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}

const makeStyles = (color: Palette) =>
  StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: color.bg,
    borderTopWidth: 2,
    borderTopColor: color.line,
    paddingTop: 0,
  },
  item: { flex: 1, alignItems: 'center', gap: 3, paddingTop: 8 },
  mark: { position: 'absolute', top: -2, width: 36, height: 3, borderRadius: 1, backgroundColor: 'transparent' },
  markOn: { backgroundColor: color.red },
  label: { fontFamily: font.bold, fontSize: 12, color: color.faint },
  labelOn: { color: color.ink },
});

function useStyles() {
  const color = useColors();
  const s = useMemo(() => makeStyles(color), [color]);
  return { color, s };
}
