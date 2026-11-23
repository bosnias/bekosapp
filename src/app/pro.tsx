// Bekos Pro: the premium screen. Buying opens once the App Store build exists
// (Apple in-app purchases through RevenueCat); for now the button explains that.

import { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../components/Button';
import { Appear, Pop } from '../components/Motion';
import { Close, Globe, Hush, Loaf, Mic, Phone, Reel } from '../components/Icons';
import { links, proPrices } from '../config';
import { feel } from '../feel';
import { font, useColors, type Palette } from '../theme';

type Plan = 'yearly' | 'monthly';

export default function Pro() {
  const { color, s } = useStyles();
  const [plan, setPlan] = useState<Plan>('yearly');
  const [notice, setNotice] = useState(false);

  const perks = [
    { icon: <Mic color={color.red} />, text: 'Unlimited speaking' },
    { icon: <Phone color={color.good} />, text: 'Calls with native speakers' },
    { icon: <Reel color="#C13584" />, text: 'Turn any Reel or TikTok into a lesson' },
    { icon: <Globe color="#2F6FB3" />, text: 'Every country, as they open' },
    { icon: <Hush color={color.gold} />, text: 'Whisper and listen-only modes' },
  ];

  const yearlyPerMonth = (proPrices.yearly / 12).toFixed(2);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.top}>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12}>
          <Close color={color.faint} size={26} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
        <Appear>
          <Text style={s.title}>Talk your way through the whole country</Text>
        </Appear>

        <View style={s.cardOuter}>
          <View style={s.card}>
            <Text style={s.cardName}>Bekos Pro</Text>
            <View style={s.perks}>
              {perks.map((p, i) => (
                <Appear key={p.text} delay={120 + i * 70}>
                  <View style={s.perk}>
                    <View style={s.perkIcon}>{p.icon}</View>
                    <Text style={s.perkText}>{p.text}</Text>
                  </View>
                </Appear>
              ))}
            </View>

            <View style={s.price}>
              {plan === 'yearly' ? (
                <>
                  <Text style={s.was}>${proPrices.monthly.toFixed(2)} / month</Text>
                  <Text style={s.amount}>${yearlyPerMonth} / month</Text>
                  <Text style={s.billed}>billed yearly, ${proPrices.yearly.toFixed(2)} / year</Text>
                </>
              ) : (
                <>
                  <Text style={[s.was, { opacity: 0 }]}> </Text>
                  <Text style={s.amount}>${proPrices.monthly.toFixed(2)} / month</Text>
                  <Text style={s.billed}>billed monthly, cancel anytime</Text>
                </>
              )}
            </View>

            <View style={s.toggle}>
              {(['yearly', 'monthly'] as Plan[]).map((p) => (
                <Pressable
                  key={p}
                  accessibilityRole="button"
                  accessibilityState={{ selected: plan === p }}
                  onPress={() => {
                    feel.select();
                    setPlan(p);
                  }}
                  style={[s.toggleItem, plan === p && s.toggleOn]}
                >
                  <Text style={[s.toggleText, plan === p && s.toggleTextOn]}>{p === 'yearly' ? 'Yearly' : 'Monthly'}</Text>
                </Pressable>
              ))}
            </View>

            <Button
              kind="gold"
              label="Go Pro"
              onPress={() => {
                feel.success();
                setNotice(true);
              }}
            />
            {notice && <Text style={s.notice}>Buying opens with the App Store version.</Text>}
          </View>
          <View style={s.badge} pointerEvents="none">
            <Pop>
              <Loaf size={58} color={color.gold} shade={color.goldDark} />
            </Pop>
          </View>
        </View>

        <View style={s.fine}>
          <FineLink label="Restore purchases" />
          <FineLink label="Terms" url={links.terms} />
          <FineLink label="Privacy" url={links.privacy} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FineLink({ label, url }: { label: string; url?: string }) {
  const { s } = useStyles();
  return (
    <Pressable onPress={() => url && Linking.openURL(url)} hitSlop={8}>
      <Text style={s.fineText}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (color: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: color.bg },
    top: { paddingHorizontal: 22, paddingTop: 8, width: '100%', maxWidth: 520, alignSelf: 'center' },
    wrap: { padding: 22, paddingTop: 4, paddingBottom: 40, width: '100%', maxWidth: 520, alignSelf: 'center' },
    title: {
      fontFamily: font.black,
      fontSize: 30,
      lineHeight: 34,
      color: color.ink,
      textAlign: 'center',
      letterSpacing: -1,
      marginBottom: 44,
      paddingHorizontal: 10,
    },
    cardOuter: { borderWidth: 3, borderColor: color.proLine, borderRadius: 22, padding: 6 },
    card: { backgroundColor: color.card, borderRadius: 16, paddingHorizontal: 20, paddingTop: 44, paddingBottom: 20 },
    badge: { position: 'absolute', top: -34, left: 0, right: 0, alignItems: 'center' },
    cardName: { fontFamily: font.black, fontSize: 30, color: color.ink, textAlign: 'center', letterSpacing: -0.8, marginBottom: 22 },
    perks: { gap: 16, marginBottom: 26 },
    perk: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    perkIcon: { width: 28, alignItems: 'center' },
    perkText: { flex: 1, fontFamily: font.bold, fontSize: 17, color: color.ink },
    price: { alignItems: 'center', marginBottom: 18 },
    was: { fontFamily: font.semibold, fontSize: 15, color: color.muted, textDecorationLine: 'line-through' },
    amount: { fontFamily: font.black, fontSize: 32, color: color.ink, letterSpacing: -0.8 },
    billed: { fontFamily: font.semibold, fontSize: 15, color: color.body },
    toggle: {
      flexDirection: 'row',
      backgroundColor: color.bg,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: color.line,
      padding: 4,
      marginBottom: 14,
    },
    toggleItem: { flex: 1, paddingVertical: 11, borderRadius: 8, alignItems: 'center' },
    toggleOn: { backgroundColor: color.raised },
    toggleText: { fontFamily: font.bold, fontSize: 16, color: color.muted },
    toggleTextOn: { color: color.ink },
    notice: { marginTop: 12, textAlign: 'center', fontFamily: font.semibold, fontSize: 14, color: color.muted },
    fine: { flexDirection: 'row', justifyContent: 'center', gap: 22, marginTop: 26 },
    fineText: { fontFamily: font.semibold, fontSize: 13, color: color.faint },
  });

function useStyles() {
  const color = useColors();
  const s = useMemo(() => makeStyles(color), [color]);
  return { color, s };
}
