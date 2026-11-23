// The bottom bar: Journey, Practice, Profile.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabIcon, type TabName } from '../../components/TabIcon';
import { feel } from '../../feel';
import { color, font } from '../../theme';

const LABELS: Record<TabName, string> = { index: 'Journey', practice: 'Practice', profile: 'Profile' };

function TabBar({ state, navigateToTab }: BottomTabBarProps) {
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
            <TabIcon name={name} tint={active ? color.red : '#9C958A'} />
            <Text style={[s.label, active && s.labelOn]}>{LABELS[name]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.white } }} tabBar={(p) => <TabBar {...p} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="practice" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: color.white,
    borderTopWidth: 2,
    borderTopColor: color.line,
    paddingTop: 0,
  },
  item: { flex: 1, alignItems: 'center', gap: 3, paddingTop: 8 },
  mark: { position: 'absolute', top: -2, width: 36, height: 3, borderRadius: 1, backgroundColor: 'transparent' },
  markOn: { backgroundColor: color.red },
  label: { fontFamily: font.bold, fontSize: 12, color: '#9C958A' },
  labelOn: { color: color.ink },
});
