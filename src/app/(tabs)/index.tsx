// The journey map. The road starts at the bottom and climbs; each leg of the
// trip is a place with a companion, its phrases are stops along the road, and
// the leg ends with an encounter. The mascot stands on your next stop and hops
// forward when you come back from finishing one.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { router, useFocusEffect } from 'expo-router';
import { stops, units, type Stop, type Unit } from '../../lessons';
import { useProgress } from '../../progress';
import { links } from '../../config';
import { AssetSlot } from '../../components/AssetSlot';
import { Bar, Pop } from '../../components/Motion';
import { feel } from '../../feel';
import { font, useColors, type Palette } from '../../theme';

const NODE = 72;
const ENCOUNTER_W = 132;
const ROW = 118;
const HEADER_H = 104;
const GAP = 36;
const FINAL_H = 190;
const ZIGZAG = [0, 58, 88, 58, 0, -58, -88, -58];
const MASCOT_W = 54;
const MASCOT_H = 88;

type Placed = { stop: Stop; x: number; y: number; done: boolean };
type HeaderPlaced = { unit: Unit; y: number; expanded: boolean; progress: number };

export default function Map() {
  const { color, s } = useStyles();
  const { done, introsSeen, mascotAt, setMascotAt, mode } = useProgress();
  const showText = mode === 'noListen';
  const [width, setWidth] = useState(0);
  const [viewH, setViewH] = useState(0);
  const scroll = useRef<ScrollViewInstance>(null);
  const scrolledOnce = useRef(false);

  const isDone = (s: Stop) => done[s.id] !== undefined;
  const current = stops.find((s) => !isDone(s)) ?? stops[stops.length - 1];

  // The leg you're on is open; the rest start closed. Tap a leg to open or close it.
  const [open, setOpen] = useState<Record<string, boolean>>({ [current.unit.id]: true });
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  // Lay everything out from the bottom up.
  const layout = useMemo(() => {
    const cx = width / 2;
    let y = 32; // distance from the bottom
    const headers: { unit: Unit; yb: number; expanded: boolean; progress: number }[] = [];
    const nodes: { stop: Stop; x: number; yb: number; done: boolean }[] = [];
    for (const unit of units) {
      const legStops = stops.filter((s) => s.unit.id === unit.id);
      const expanded = !!open[unit.id];
      const progress = legStops.filter(isDone).length / legStops.length;
      headers.push({ unit, yb: y, expanded, progress });
      y += HEADER_H + 26;
      if (expanded) {
        legStops.forEach((stop, i) => {
          nodes.push({ stop, x: cx + ZIGZAG[i % ZIGZAG.length], yb: y + NODE / 2, done: isDone(stop) });
          y += ROW;
        });
      }
      y += GAP;
    }
    const height = y + FINAL_H;
    const top = (yb: number) => height - yb;
    return {
      height,
      headers: headers.map((h): HeaderPlaced => ({ unit: h.unit, y: top(h.yb) - HEADER_H, expanded: h.expanded, progress: h.progress })),
      nodes: nodes.map((n): Placed => ({ stop: n.stop, x: n.x, y: top(n.yb), done: n.done })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, open, done]);

  const nodeOf = (id: string | null) => layout.nodes.find((n) => n.stop.id === id);

  // The road: one curvy line per open leg, from its header up through its stops.
  const roads = useMemo(() => {
    if (!width) return [];
    return layout.headers
      .filter((h) => h.expanded)
      .map((h) => {
        const pts = [{ x: width / 2, y: h.y + 10 }, ...layout.nodes.filter((n) => n.stop.unit.id === h.unit.id).map((n) => ({ x: n.x, y: n.y }))];
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1];
          const b = pts[i];
          const my = (a.y + b.y) / 2;
          d += ` C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;
        }
        return { id: h.unit.id, d };
      });
  }, [layout, width]);

  // Mascot position and hop.
  const pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lift = useRef(new Animated.Value(0)).current;
  const squash = useRef(new Animated.Value(1)).current;
  const bob = useRef(new Animated.Value(0)).current;

  // A gentle idle bob while the mascot waits on its stop.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);
  const [mascotVisible, setMascotVisible] = useState(false);
  const mascotSpot = (n: Placed) => ({ x: n.x - MASCOT_W / 2, y: n.y - NODE / 2 - MASCOT_H + 14 });

  const placeMascot = useCallback(() => {
    const target = nodeOf(current.id);
    if (!target) {
      setMascotVisible(false);
      return;
    }
    setMascotVisible(true);
    const from = mascotAt && mascotAt !== current.id ? nodeOf(mascotAt) : undefined;
    const end = mascotSpot(target);
    if (!from) {
      pos.setValue(end);
      if (mascotAt !== current.id) setMascotAt(current.id);
      return;
    }
    pos.setValue(mascotSpot(from));
    lift.setValue(0);
    Animated.parallel([
      Animated.timing(pos, { toValue: end, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(lift, { toValue: 1, duration: 325, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(lift, { toValue: 0, duration: 325, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start(() => {
      // Land: squash, then spring back.
      feel.land();
      squash.setValue(0.78);
      Animated.spring(squash, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 16 }).start();
      setMascotAt(current.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, current.id, mascotAt]);

  // Each time the map comes back into view, the mascot hops to your next stop.
  useFocusEffect(
    useCallback(() => {
      if (width) placeMascot();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, current.id, open]),
  );

  // Start scrolled to where you are.
  useEffect(() => {
    if (!width || !viewH || scrolledOnce.current) return;
    const target = nodeOf(current.id);
    if (!target) return;
    scrolledOnce.current = true;
    requestAnimationFrame(() => scroll.current?.scrollTo({ y: Math.max(0, target.y - viewH * 0.55), animated: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, viewH, layout]);

  const openStop = (stop: Stop) => {
    // The very first stop opens the course intro (the flight in) the first time.
    if (stop.id === stops[0].id && !introsSeen.course) return router.push('/begin');
    if (stop.kind === 'encounter') return router.push(`/talk/${stop.unit.id}`);
    const first = stop.unit.phrases[0]?.id === stop.id;
    if (first && !introsSeen[stop.unit.id]) return router.push(`/leg/${stop.unit.id}`);
    router.push(`/lesson/${stop.id}`);
  };

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.top}>
        <Text style={s.wordmark}>bekos</Text>
      </View>
      <ScrollView
        ref={scroll}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        onLayout={(e: LayoutChangeEvent) => setViewH(e.nativeEvent.layout.height)}
      >
        <View
          style={[s.canvas, { height: layout.height }]}
          onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
        >
          {!!width && (
            <Svg width={width} height={layout.height} style={StyleSheet.absoluteFill}>
              {roads.map((r) => (
                <Path key={`${r.id}-road`} d={r.d} stroke={color.road} strokeWidth={22} strokeLinecap="round" fill="none" />
              ))}
              {roads.map((r) => (
                <Path
                  key={`${r.id}-line`}
                  d={r.d}
                  stroke={color.bg}
                  strokeWidth={3}
                  strokeDasharray="10 12"
                  strokeLinecap="round"
                  fill="none"
                />
              ))}
            </Svg>
          )}

          <FinalStop />

          {layout.headers.map((h) => (
            <LegHeader key={h.unit.id} header={h} onPress={() => toggle(h.unit.id)} />
          ))}

          {!!width &&
            layout.nodes.map((n) => (
              <StopNode
                key={n.stop.id}
                node={n}
                isCurrent={n.stop.id === current.id}
                showText={showText}
                onPress={() => openStop(n.stop)}
              />
            ))}

          {mascotVisible && (
            <Animated.View
              pointerEvents="none"
              style={[
                s.mascot,
                {
                  transform: [
                    { translateX: pos.x },
                    {
                      translateY: Animated.add(
                        Animated.add(pos.y, lift.interpolate({ inputRange: [0, 1], outputRange: [0, -70] })),
                        bob.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }),
                      ),
                    },
                    { translateY: MASCOT_H / 2 },
                    { scaleY: squash },
                    { scaleX: squash.interpolate({ inputRange: [0.78, 1], outputRange: [1.15, 1] }) },
                    { translateY: -MASCOT_H / 2 },
                  ],
                },
              ]}
            >
              <Image source={require('../../../assets/mascot.png')} style={{ width: MASCOT_W, height: MASCOT_H }} resizeMode="contain" />
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LegHeader({ header, onPress }: { header: HeaderPlaced; onPress: () => void }) {
  const { color, s } = useStyles();
  const { unit, expanded, progress } = header;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        feel.select();
        onPress();
      }}
      style={({ pressed }) => [s.leg, { top: header.y }, pressed && { backgroundColor: color.cardPressed }]}
    >
      <AssetSlot name={unit.companion.art} image={unit.companion.image} style={s.legArt} compact />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={s.legPlace}>{unit.place}</Text>
        <Text style={s.legSub} numberOfLines={1}>
          {unit.title} · with {unit.companion.name}
        </Text>
        <Bar value={progress} fill={color.gold} track={color.track} style={{ marginTop: 6, height: 7 }} />
      </View>
      <Text style={s.legToggle}>{expanded ? 'Hide' : 'Show'}</Text>
    </Pressable>
  );
}

function StopNode({
  node,
  isCurrent,
  showText,
  onPress,
}: {
  node: Placed;
  isCurrent: boolean;
  score?: number;
  showText: boolean;
  onPress: () => void;
}) {
  const { color, s } = useStyles();
  const { stop, done } = node;
  const encounter = stop.kind === 'encounter';
  const w = encounter ? ENCOUNTER_W : NODE;
  const caption =
    stop.kind === 'encounter' ? stop.unit.encounter.name : showText ? stop.phrase.text : stop.phrase.meaning;
  const sink = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isCurrent) return;
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [isCurrent, pulse]);

  const tone = done ? s.nodeDone : isCurrent ? s.nodeCurrent : s.nodeAhead;
  const base = done ? color.goldDark : isCurrent ? color.redDark : color.raised;

  return (
    <View style={[s.nodeWrap, { left: node.x - 80, top: node.y - NODE / 2 }]}>
      <Pop>
        {isCurrent && (
          <Animated.View
            pointerEvents="none"
            style={[
              s.pulse,
              { width: w + 18, left: (160 - w) / 2 - 9 },
              {
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.25] }) }],
              },
            ]}
          />
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={caption}
          onPress={() => {
            feel.press();
            onPress();
          }}
          onPressIn={() => Animated.spring(sink, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 0 }).start()}
          onPressOut={() => Animated.spring(sink, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 10 }).start()}
          style={[s.nodeBase, { width: w, backgroundColor: base, borderRadius: encounter ? 16 : 20 }]}
        >
          <Animated.View
            style={[
              s.node,
              { width: w, borderRadius: encounter ? 16 : 20 },
              tone,
              { transform: [{ translateY: sink.interpolate({ inputRange: [0, 1], outputRange: [-7, 0] }) }] },
            ]}
          >
            {encounter ? <Text style={[s.nodeText, (done || isCurrent) && s.nodeTextOn]}>Encounter</Text> : null}
          </Animated.View>
        </Pressable>
      </Pop>
      <Text style={[s.caption, (done || isCurrent) && s.captionOn]} numberOfLines={2}>
        {caption}
      </Text>
    </View>
  );
}

function FinalStop() {
  const { color, s } = useStyles();
  return (
    <View style={s.final}>
      <Text style={s.finalLabel}>End of the road</Text>
      <Text style={s.finalTitle}>Talk to a native speaker</Text>
      <LinkRow title="Final conversation test" url={links.finalTest} />
      <LinkRow title="Practice calls" url={links.practiceCalls} />
    </View>
  );
}

function LinkRow({ title, url }: { title: string; url: string }) {
  const { color, s } = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={!url}
      onPress={() => Linking.openURL(url)}
      style={({ pressed }) => [s.linkRow, pressed && { backgroundColor: color.soft }]}
    >
      <Text style={s.linkTitle}>{title}</Text>
      <Text style={[s.linkTag, !url && { color: color.muted }]}>{url ? 'Book' : 'Coming soon'}</Text>
    </Pressable>
  );
}

const makeStyles = (color: Palette) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  top: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8, width: '100%', maxWidth: 520, alignSelf: 'center' },
  wordmark: { fontFamily: font.black, fontSize: 28, color: color.red, letterSpacing: -1.5 },
  canvas: { width: '100%', maxWidth: 520, alignSelf: 'center' },

  leg: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: HEADER_H,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: color.cardBorder,
    backgroundColor: color.card,
  },
  legArt: { width: 64, height: 64 },
  legPlace: { fontFamily: font.extrabold, fontSize: 22, color: color.ink, letterSpacing: -0.5 },
  legSub: { fontFamily: font.semibold, fontSize: 14, color: color.body },
  legBar: { height: 6, borderRadius: 2, backgroundColor: color.track, marginTop: 6, overflow: 'hidden' },
  legBarFill: { height: 6, backgroundColor: color.gold },
  legToggle: { fontFamily: font.bold, fontSize: 14, color: color.red },

  nodeWrap: { position: 'absolute', width: 160, alignItems: 'center' },
  nodeBase: { height: NODE, marginTop: 7 },
  node: { height: NODE, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  nodeAhead: { backgroundColor: color.bg, borderColor: color.raised },
  nodeCurrent: { backgroundColor: color.red, borderColor: color.redDark },
  nodeDone: { backgroundColor: color.gold, borderColor: color.goldDark },
  pulse: { position: 'absolute', top: -2, height: NODE + 18, borderRadius: 24, borderWidth: 4, borderColor: color.red },
  nodeText: { fontFamily: font.extrabold, fontSize: 15, color: color.muted },
  nodeTextOn: { color: color.onAccent },
  caption: { marginTop: 6, fontFamily: font.semibold, fontSize: 13, lineHeight: 16, color: color.muted, textAlign: 'center' },
  captionOn: { color: color.ink },

  mascot: { position: 'absolute', left: 0, top: 0 },

  final: { position: 'absolute', top: 16, left: 20, right: 20, gap: 4 },
  finalLabel: { fontFamily: font.bold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: color.red },
  finalTitle: { fontFamily: font.extrabold, fontSize: 22, color: color.ink, marginBottom: 8, letterSpacing: -0.5 },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderColor: color.line,
  },
  linkTitle: { fontFamily: font.bold, fontSize: 16, color: color.ink },
  linkTag: { fontFamily: font.bold, fontSize: 14, color: color.red },
});

function useStyles() {
  const color = useColors();
  const s = useMemo(() => makeStyles(color), [color]);
  return { color, s };
}
