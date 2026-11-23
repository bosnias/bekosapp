// More: the Pro upgrade banner, then account and app links.

import { useMemo, useRef, type ReactNode } from 'react';
import { Animated, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Chevron, Doc, Help, Loaf, Person, Phone } from '../../components/Icons';
import { links } from '../../config';
import { feel } from '../../feel';
import { font, useColors, type Palette } from '../../theme';

export default function More() {
  const { color, s } = useStyles();
  const sink = useRef(new Animated.Value(0)).current;

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
        <Text style={s.wordmark}>bekos</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            feel.press();
            router.push('/pro');
          }}
          onPressIn={() => Animated.spring(sink, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 0 }).start()}
          onPressOut={() => Animated.spring(sink, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 10 }).start()}
          style={s.bannerBase}
        >
          <Animated.View style={[s.banner, { transform: [{ translateY: sink.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }] }]}>
            <Loaf size={64} color="#FFF4DF" shade={color.goldDark} />
            <View style={{ flex: 1 }}>
              <Text style={s.bannerTitle}>Get Bekos Pro</Text>
              <Text style={s.bannerSub}>Unlimited speaking and real calls</Text>
            </View>
          </Animated.View>
        </Pressable>

        <Text style={s.section}>Account</Text>
        <Row icon={<Loaf size={28} color={color.gold} shade={color.goldDark} />} label="Membership" onPress={() => router.push('/pro')} />
        <Row icon={<Person color="#2F6FB3" size={26} />} label="Profile" onPress={() => router.navigate('/profile')} />
        <Row icon={<Phone color={color.good} size={26} />} label="Practice calls" url={links.practiceCalls} />

        <Text style={s.section}>App</Text>
        <Row icon={<Help color={color.good} size={26} />} label="Support" url={links.support} />
        <Row icon={<Doc color={color.faint} size={26} />} label="Terms and privacy" url={links.privacy || links.terms} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, label, onPress, url }: { icon: ReactNode; label: string; onPress?: () => void; url?: string }) {
  const { color, s } = useStyles();
  const soon = !onPress && !url;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={soon}
      onPress={() => {
        feel.select();
        if (onPress) onPress();
        else if (url) Linking.openURL(url);
      }}
      style={({ pressed }) => [s.row, pressed && { backgroundColor: color.soft }]}
    >
      <View style={s.rowIcon}>{icon}</View>
      <Text style={[s.rowLabel, soon && { color: color.faint }]}>{label}</Text>
      {soon ? <Text style={s.soon}>Soon</Text> : <Chevron color={color.faint} />}
    </Pressable>
  );
}

const makeStyles = (color: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: color.bg },
    wrap: { paddingHorizontal: 20, paddingBottom: 40, width: '100%', maxWidth: 520, alignSelf: 'center' },
    wordmark: { fontFamily: font.black, fontSize: 28, color: color.red, letterSpacing: -1.5, textAlign: 'center', marginTop: 8, marginBottom: 18 },
    bannerBase: { backgroundColor: color.goldDark, borderRadius: 16, marginTop: 6, marginBottom: 26 },
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      backgroundColor: color.gold,
      borderRadius: 16,
      paddingVertical: 20,
      paddingHorizontal: 18,
    },
    bannerTitle: { fontFamily: font.black, fontSize: 24, color: '#141414', letterSpacing: -0.6 },
    bannerSub: { fontFamily: font.bold, fontSize: 15, color: '#3A2A12', marginTop: 2 },
    section: { fontFamily: font.extrabold, fontSize: 18, color: color.ink, marginTop: 10, marginBottom: 6 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 15, paddingHorizontal: 6, borderRadius: 10 },
    rowIcon: { width: 32, alignItems: 'center' },
    rowLabel: { flex: 1, fontFamily: font.bold, fontSize: 18, color: color.ink },
    soon: { fontFamily: font.semibold, fontSize: 13, color: color.faint },
  });

function useStyles() {
  const color = useColors();
  const s = useMemo(() => makeStyles(color), [color]);
  return { color, s };
}
