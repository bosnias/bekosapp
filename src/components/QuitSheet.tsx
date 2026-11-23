// "Are you sure?" sheet that slides up when someone tries to leave mid-lesson.

import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { feel } from '../feel';
import { font, useColors, type Palette } from '../theme';

export function QuitSheet({ open, message, onStay, onQuit }: { open: boolean; message: string; onStay: () => void; onQuit: () => void }) {
  const color = useColors();
  const s = useMemo(() => makeStyles(color), [color]);
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) feel.miss();
    Animated.timing(v, { toValue: open ? 1 : 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [open, v]);

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={onStay}>
      <Animated.View style={[s.backdrop, { opacity: v }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onStay} />
      </Animated.View>
      <Animated.View
        style={[s.sheet, { transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }] }]}
      >
        <Image source={require('../../assets/mascot.png')} style={s.mascot} resizeMode="contain" />
        <Text style={s.message}>{message}</Text>
        <View style={s.actions}>
          <Button label="Keep going" onPress={onStay} />
          <Pressable accessibilityRole="button" onPress={onQuit} hitSlop={10} style={s.quit}>
            <Text style={s.quitText}>Quit</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

const makeStyles = (color: Palette) =>
  StyleSheet.create({
    backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: color.bg,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 24,
      paddingBottom: 36,
      alignItems: 'center',
      gap: 14,
    },
    mascot: { width: 90, height: 140 },
    message: { fontFamily: font.extrabold, fontSize: 24, lineHeight: 30, color: color.ink, textAlign: 'center' },
    actions: { alignSelf: 'stretch', gap: 10, maxWidth: 520, width: '100%', marginHorizontal: 'auto' },
    quit: { alignItems: 'center', paddingVertical: 10 },
    quitText: { fontFamily: font.extrabold, fontSize: 16, color: color.red, letterSpacing: 0.5 },
  });
