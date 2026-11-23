// The journey map. 3D tiles climb up through the country from the bottom; each
// leg of the trip is a place with a companion, its phrases are tiles, and the
// leg ends with a big encounter tile. The mascot stands on your next tile and
// hops forward when you come back from finishing one.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Polygon } from 'react-native-svg';
import { router, useFocusEffect } from 'expo-router';
import { course, stops, units, type Stop, type Unit } from '../../lessons';
import { useProgress } from '../../progress';
import { links } from '../../config';
import { AssetSlot } from '../../components/AssetSlot';
import { Bar, Pop } from '../../components/Motion';
import { Button, IconButton } from '../../components/Button';
import { Check, Chevron, Ear, Flame, ListIcon, Loaf, People, Person } from '../../components/Icons';
import { feel } from '../../feel';
import { font, useColors, type Palette } from '../../theme';

// The grid. Everything on the map sits in a diamond cell of this grid, so the
// perspective stays consistent. RATIO is the one setting for the perspective:
// cell height divided by cell width (0.5 is flat, 1 is looking straight down).
const RATIO = 0.72;
const CW = 120; // cell width
const CH = CW * RATIO; // cell height
const HW = CW / 2; // one step sideways
const HH = CH / 2; // one step up
// Tiles fill most of their cell; encounter tiles fill almost all of it.
const TW = CW * 0.78;
const TH = CH * 0.78;
const ETW = CW * 0.9;
const ETH = CH * 0.9;
const DEPTH = 15;
const R = 7; // corner rounding
// The path moves one cell diagonally per stop, swinging between two cells left
// and two cells right of center (in half-cell columns).
const PATTERN = [0, 1, 2, 1, 0, -1, -2, -1];
const HEADER_H = 92;
const HEADER_ROWS = 4; // rows reserved under each leg for its header
const BOTTOM = 70;
const FINAL_H = 200;
const MASCOT_W = 54;
const MASCOT_H = 88;
const BUBBLE_W = 138;

type Placed = { stop: Stop; x: number; y: number; done: boolean; swing: number; next: number };
type HeaderPlaced = { unit: Unit; y: number; expanded: boolean; progress: number };
type Scenery = { key: string; name: string; x: number; y: number };

export default function Map() {
  const { color, s } = useStyles();
  const { done, introsSeen, mascotAt, setMascotAt, mode, streak } = useProgress();
  const showText = mode === 'noListen';
  const [width, setWidth] = useState(0);
  const [viewH, setViewH] = useState(0);
  const [sheet, setSheet] = useState(false);
  const scroll = useRef<ScrollViewInstance>(null);
  const scrolledOnce = useRef(false);
  const pendingLeg = useRef<string | null>(null);

  const isDone = (s: Stop) => done[s.id] !== undefined;
  const current = stops.find((s) => !isDone(s)) ?? stops[stops.length - 1];
  const started = stops.some(isDone) || !!introsSeen.course;

  // The leg you're on is open; the rest start closed. Tap a leg to open or close it.
  const [open, setOpen] = useState<Record<string, boolean>>({ [current.unit.id]: true });
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  // Lay everything out on the grid, from the bottom up. A cell is (row, col) in
  // half-cell steps; real cells are where row + col is even.
  const layout = useMemo(() => {
    const headers: { unit: Unit; row: number; expanded: boolean; progress: number }[] = [];
    const nodes: { stop: Stop; row: number; col: number; done: boolean; next: number }[] = [];
    const scenery: { key: string; name: string; row: number; col: number }[] = [];
    let row = 0;
    const even = (n: number) => (n % 2 === 0 ? n : n + 1);
    units.forEach((unit, u) => {
      const legStops = stops.filter((s) => s.unit.id === unit.id);
      const expanded = !!open[unit.id];
      const progress = legStops.filter(isDone).length / legStops.length;
      headers.push({ unit, row, expanded, progress });
      row += HEADER_ROWS;
      if (expanded) {
        let count = 0;
        legStops.forEach((stop, i) => {
          const col = PATTERN[i % PATTERN.length];
          const next = i + 1 < legStops.length ? PATTERN[(i + 1) % PATTERN.length] - col : 0;
          nodes.push({ stop, row, col, done: isDone(stop), next });
          // Scenery gets its own cell on the open side when the path swings far over.
          if (Math.abs(col) === 2 && stop.kind !== 'encounter') {
            count++;
            scenery.push({ key: `${unit.id}-${i}`, name: `leg-${u + 1}-scenery-${count}.png`, row, col: -col });
          }
          row += 1;
        });
      }
      row = even(row) + 2;
    });
    const height = BOTTOM + row * HH + FINAL_H;
    const cx = width / 2;
    const xOf = (col: number) => cx + col * HW;
    const yOf = (r: number) => height - BOTTOM - r * HH;
    return {
      height,
      rows: row,
      yOf,
      headers: headers.map((h): HeaderPlaced => ({ unit: h.unit, y: yOf(h.row + 1) - HEADER_H / 2, expanded: h.expanded, progress: h.progress })),
      nodes: nodes.map((n): Placed => ({ stop: n.stop, x: xOf(n.col), y: yOf(n.row), done: n.done, swing: n.col, next: n.next })),
      scenery: scenery.map((sc): Scenery => ({ key: sc.key, name: sc.name, x: xOf(sc.col), y: yOf(sc.row) })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, open, done]);

  const nodeOf = (id: string | null) => layout.nodes.find((n) => n.stop.id === id);

  // The ground: a checkerboard of the same diamond cells the tiles sit in.
  const grid = useMemo(() => {
    if (!width) return '';
    const cols = Math.ceil(width / HW / 2) + 2;
    let d = '';
    for (let r = -Math.ceil(BOTTOM / HH) - 1; r <= layout.rows + Math.ceil(FINAL_H / HH) + 1; r++) {
      if (Math.abs(r) % 2 !== 1) continue;
      const y = layout.yOf(r);
      for (let c = -cols; c <= cols; c++) {
        if (Math.abs(r + c) % 2 !== 0) continue;
        const x = width / 2 + c * HW;
        d += `M ${x - HW} ${y} L ${x} ${y - HH} L ${x + HW} ${y} L ${x} ${y + HH} Z `;
      }
    }
    return d;
  }, [width, layout]);

  // Mascot position and hop.
  const pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lift = useRef(new Animated.Value(0)).current;
  const squash = useRef(new Animated.Value(1)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const [landed, setLanded] = useState(true);

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
  const mascotSpot = (n: Placed) => ({ x: n.x - MASCOT_W / 2, y: n.y - DEPTH - MASCOT_H + 4 });

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
      setLanded(true);
      if (mascotAt !== current.id) setMascotAt(current.id);
      return;
    }
    setLanded(false);
    pos.setValue(mascotSpot(from));
    lift.setValue(0);
    Animated.parallel([
      Animated.timing(pos, { toValue: end, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(lift, { toValue: 1, duration: 325, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(lift, { toValue: 0, duration: 325, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start(() => {
      feel.land();
      squash.setValue(0.78);
      Animated.spring(squash, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 16 }).start();
      setMascotAt(current.id);
      setLanded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, current.id, mascotAt]);

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
    requestAnimationFrame(() => scroll.current?.scrollTo({ y: Math.max(0, target.y - viewH * 0.6), animated: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, viewH, layout]);

  // After picking a leg from the list, scroll so its tiles fill the screen.
  useEffect(() => {
    const id = pendingLeg.current;
    if (!id) return;
    const h = layout.headers.find((x) => x.unit.id === id);
    if (!h) return;
    pendingLeg.current = null;
    requestAnimationFrame(() => scroll.current?.scrollTo({ y: Math.max(0, h.y + HEADER_H - viewH + 30), animated: true }));
  }, [layout, viewH]);

  const openStop = (stop: Stop) => {
    if (stop.id === stops[0].id && !introsSeen.course) return router.push('/begin');
    if (stop.kind === 'encounter') return router.push(`/talk/${stop.unit.id}`);
    const first = stop.unit.phrases[0]?.id === stop.id;
    if (first && !introsSeen[stop.unit.id]) return router.push(`/leg/${stop.unit.id}`);
    router.push(`/lesson/${stop.id}`);
  };

  const mainLabel = !started
    ? 'Begin journey'
    : current.kind === 'encounter'
      ? `Meet ${current.unit.encounter.name}`
      : 'Continue';

  // Draw tiles from the top down so nearer (lower) tiles overlap farther ones.
  const drawOrder = useMemo(() => [...layout.nodes].sort((a, b) => a.y - b.y), [layout]);
  const currentNode = nodeOf(current.id);

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Profile" onPress={() => router.navigate('/profile')} style={s.avatar}>
          <Person color={color.faint} size={26} />
        </Pressable>
        <View style={s.streak} accessibilityLabel={`${streak} days on the road`}>
          <Flame color={streak ? color.gold : color.faint} core={streak ? color.red : color.raised} />
          <Text style={[s.streakText, !streak && { color: color.faint }]}>{streak}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bekos Pro"
          onPress={() => {
            feel.tap();
            router.push('/pro');
          }}
          style={({ pressed }) => [s.proBtn, pressed && { transform: [{ scale: 0.92 }] }]}
        >
          <Loaf size={34} color={color.gold} shade={color.goldDark} />
        </Pressable>
      </View>

      <ScrollView
        ref={scroll}
        style={{ flex: 1, backgroundColor: color.ground }}
        showsVerticalScrollIndicator={false}
        onLayout={(e: LayoutChangeEvent) => setViewH(e.nativeEvent.layout.height)}
      >
        <View style={[s.canvas, { height: layout.height }]} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
          {!!width && (
            <View style={s.fill} pointerEvents="none">
              <Svg width={width} height={layout.height}>
                <Path d={grid} fill={color.groundLine} />
              </Svg>
            </View>
          )}

          <FinalStop />

          {layout.scenery.map((sc) => (
            <SceneryCell key={sc.key} spot={sc} />
          ))}

          {layout.headers.map((h) => (
            <LegHeader key={h.unit.id} header={h} onPress={() => toggle(h.unit.id)} />
          ))}

          {!!width &&
            drawOrder.map((n) => (
              <Tile key={n.stop.id} node={n} isCurrent={n.stop.id === current.id} onPress={() => openStop(n.stop)} />
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
                        bob.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }),
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

          {mascotVisible && landed && currentNode && (
            <NextBubble node={currentNode} width={width} showText={showText} onPress={() => openStop(current)} />
          )}
        </View>
      </ScrollView>

      <View style={s.actions}>
        <IconButton label="All places" onPress={() => setSheet(true)}>
          <ListIcon color={color.muted} />
        </IconButton>
        <View style={{ flex: 1 }}>
          <Button label={mainLabel} onPress={() => openStop(current)} />
        </View>
      </View>

      <LegSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        onPick={(id) => {
          setSheet(false);
          pendingLeg.current = id;
          setOpen((o) => ({ ...o, [id]: true }));
        }}
      />
    </SafeAreaView>
  );
}

// Diamond outlines, inset by the corner radius so a same-colored stroke rounds them.
const diamond = (w: number, h: number) => `${R},${h / 2} ${w / 2},${R} ${w - R},${h / 2} ${w / 2},${h - R}`;
const edge = (w: number, h: number) =>
  `${R},${h / 2} ${w / 2},${h - R} ${w - R},${h / 2} ${w - R},${h / 2 + DEPTH} ${w / 2},${h - R + DEPTH} ${R},${h / 2 + DEPTH}`;
const rightEdge = (w: number, h: number) => `${w / 2},${h - R} ${w - R},${h / 2} ${w - R},${h / 2 + DEPTH} ${w / 2},${h - R + DEPTH}`;
const ring = (w: number, h: number, k: number) => {
  const cx = w / 2;
  const cy = h / 2;
  return `${cx - (w / 2 - R) * k},${cy} ${cx},${cy - (h / 2 - R) * k} ${cx + (w / 2 - R) * k},${cy} ${cx},${cy + (h / 2 - R) * k}`;
};

function Tile({ node, isCurrent, onPress }: { node: Placed; isCurrent: boolean; onPress: () => void }) {
  const { color, s } = useStyles();
  const { stop, done } = node;
  const encounter = stop.kind === 'encounter';
  const w = encounter ? ETW : TW;
  const h = encounter ? ETH : TH;
  const top = done ? color.gold : isCurrent ? color.red : color.tileTop;
  const side = done ? color.goldDark : isCurrent ? color.redDark : color.tileSide;
  const glyph = done ? color.onAccent : isCurrent ? color.onAccent : color.faint;
  const sink = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isCurrent) return;
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1500, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [isCurrent, pulse]);

  return (
    // The block's base sits in its cell; the top face is raised by its thickness.
    <View style={{ position: 'absolute', left: node.x - w / 2, top: node.y - h / 2 - DEPTH, width: w, height: h + DEPTH }}>
      <Pop>
        {isCurrent && (
          <Animated.View
            pointerEvents="none"
            style={[
              { position: 'absolute', left: 0, top: 0, width: w, height: h },
              {
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) }],
              },
            ]}
          >
            <Svg width={w} height={h}>
              <Polygon points={diamond(w, h)} fill="none" stroke={color.red} strokeWidth={4} strokeLinejoin="round" />
            </Svg>
          </Animated.View>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={stop.kind === 'encounter' ? `Encounter: ${stop.unit.encounter.name}` : stop.phrase.meaning}
          onPress={() => {
            feel.press();
            onPress();
          }}
          onPressIn={() => Animated.spring(sink, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 0 }).start()}
          onPressOut={() => Animated.spring(sink, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 10 }).start()}
          style={{ width: w, height: h + DEPTH }}
        >
          <View style={s.fill} pointerEvents="none">
            <Svg width={w} height={h + DEPTH}>
              <Polygon points={edge(w, h)} fill={side} stroke={side} strokeWidth={R * 2} strokeLinejoin="round" />
              <Polygon points={rightEdge(w, h)} fill="#000000" opacity={0.14} />
            </Svg>
          </View>
          <Animated.View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: w,
              height: h,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ translateY: sink.interpolate({ inputRange: [0, 1], outputRange: [0, DEPTH * 0.6] }) }],
            }}
          >
            <View style={s.fill} pointerEvents="none">
              <Svg width={w} height={h}>
                <Polygon points={diamond(w, h)} fill={top} stroke={top} strokeWidth={R * 2} strokeLinejoin="round" />
                <Polygon points={ring(w, h, 0.72)} fill="none" stroke="#000000" strokeOpacity={0.07} strokeWidth={2} strokeLinejoin="round" />
                <Polygon points={ring(w, h, 0.42)} fill="none" stroke="#000000" strokeOpacity={0.07} strokeWidth={2} strokeLinejoin="round" />
              </Svg>
            </View>
            <View pointerEvents="none">
              {done ? <Check color={glyph} size={28} /> : encounter ? <People color={glyph} size={32} /> : <Ear color={glyph} size={24} />}
            </View>
          </Animated.View>
        </Pressable>
      </Pop>
    </View>
  );
}

// A cell waiting for scenery art (a cabin, a bench, a luggage cart...).
function SceneryCell({ spot }: { spot: Scenery }) {
  const { color, s } = useStyles();
  const w = CW * 0.92;
  const h = CH * 0.92;
  return (
    <View pointerEvents="none" style={[s.scenery, { left: spot.x - w / 2, top: spot.y - h / 2, width: w, height: h }]}>
      <View style={s.fill}>
        <Svg width={w} height={h}>
          <Polygon points={diamond(w, h)} fill={color.slotBg} stroke={color.slotBorder} strokeWidth={2} strokeDasharray="6 5" strokeLinejoin="round" />
        </Svg>
      </View>
      <Text style={s.sceneryText} numberOfLines={2}>
        {spot.name.replace('.png', '')}
      </Text>
    </View>
  );
}

// "Next" label beside your tile, on whichever side has room.
function NextBubble({ node, width, showText, onPress }: { node: Placed; width: number; showText: boolean; onPress: () => void }) {
  const { s } = useStyles();
  const stop = node.stop;
  const right = node.swing < 0 || (node.swing === 0 && node.next < 0);
  const w = stop.kind === 'encounter' ? ETW : TW;
  let left = right ? node.x + w / 2 - 8 : node.x - w / 2 - BUBBLE_W + 8;
  left = Math.max(8, Math.min(width - BUBBLE_W - 8, left));
  const text = stop.kind === 'encounter' ? `Meet ${stop.unit.encounter.name}` : showText ? stop.phrase.text : stop.phrase.meaning;
  return (
    <View style={[s.bubbleWrap, { left, top: node.y - 34 }]}>
      <Pop>
        <Pressable onPress={onPress} style={s.bubble} accessibilityRole="button">
          <Text style={s.bubbleLabel}>Next</Text>
          <Text style={s.bubbleText} numberOfLines={2}>
            {text}
          </Text>
        </Pressable>
      </Pop>
    </View>
  );
}

function LegHeader({ header, onPress }: { header: HeaderPlaced; onPress: () => void }) {
  const { color, s } = useStyles();
  const { unit, expanded, progress } = header;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={() => {
        feel.select();
        onPress();
      }}
      style={[s.leg, { top: header.y }]}
    >
      {({ pressed }) => (
        <>
          <AssetSlot name={unit.companion.art} image={unit.companion.image} style={s.legArt} compact />
          <View style={[s.legBubble, pressed && { backgroundColor: color.cardPressed }]}>
            <View style={[s.legTail, pressed && { borderRightColor: color.cardPressed }]} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.legPlace}>{unit.place}</Text>
              <Text style={s.legSub} numberOfLines={1}>
                {unit.title} with {unit.companion.name}
              </Text>
              <Bar value={progress} fill={color.gold} track={color.track} style={{ marginTop: 6, height: 7 }} />
            </View>
            <Chevron color={color.muted} down={expanded} />
          </View>
        </>
      )}
    </Pressable>
  );
}

// Every place on the trip, to jump around the map.
function LegSheet({ visible, onClose, onPick }: { visible: boolean; onClose: () => void; onPick: (id: string) => void }) {
  const { color, s } = useStyles();
  const { done } = useProgress();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.sheetShade} onPress={onClose} accessibilityLabel="Close" />
      <View style={s.sheet}>
        <View style={s.grab} />
        <Text style={s.sheetTitle}>{course.country}</Text>
        {units.map((u) => {
          const legStops = stops.filter((x) => x.unit.id === u.id);
          const p = legStops.filter((x) => done[x.id] !== undefined).length / legStops.length;
          return (
            <Pressable
              key={u.id}
              onPress={() => {
                feel.select();
                onPick(u.id);
              }}
              style={({ pressed }) => [s.sheetRow, pressed && { backgroundColor: color.soft }]}
            >
              <AssetSlot name={u.companion.art} image={u.companion.image} style={s.sheetArt} compact />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={s.sheetPlace}>{u.place}</Text>
                <Bar value={p} fill={color.gold} track={color.track} style={{ height: 6 }} />
              </View>
              <Chevron color={color.faint} />
            </Pressable>
          );
        })}
      </View>
    </Modal>
  );
}

function FinalStop() {
  const { s } = useStyles();
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
      style={({ pressed }) => [s.linkRow, pressed && { opacity: 0.7 }]}
    >
      <Text style={s.linkTitle}>{title}</Text>
      <Text style={[s.linkTag, !url && { color: color.muted }]}>{url ? 'Book' : 'Coming soon'}</Text>
    </Pressable>
  );
}

const makeStyles = (color: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: color.bg },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 18,
      paddingTop: 6,
      paddingBottom: 10,
      width: '100%',
      maxWidth: 520,
      alignSelf: 'center',
    },
    avatar: { width: 40, height: 40, borderRadius: 10, backgroundColor: color.soft, borderWidth: 2, borderColor: color.line, alignItems: 'center', justifyContent: 'center' },
    streak: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    streakText: { fontFamily: font.extrabold, fontSize: 18, color: color.ink },
    proBtn: { padding: 2 },
    canvas: { width: '100%', maxWidth: 520, alignSelf: 'center' },
    fill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },

    scenery: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
    sceneryText: { fontFamily: font.semibold, fontSize: 10, color: color.muted, textAlign: 'center', width: 70 },

    leg: { position: 'absolute', left: 16, right: 16, height: HEADER_H, flexDirection: 'row', alignItems: 'center', gap: 14 },
    legArt: { width: 68, height: 68 },
    legBubble: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: color.card,
      borderWidth: 2,
      borderBottomWidth: 4,
      borderColor: color.cardBorder,
    },
    legTail: {
      position: 'absolute',
      left: -9,
      top: 22,
      width: 0,
      height: 0,
      borderTopWidth: 8,
      borderBottomWidth: 8,
      borderRightWidth: 9,
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      borderRightColor: color.card,
    },
    legPlace: { fontFamily: font.extrabold, fontSize: 20, color: color.ink, letterSpacing: -0.5 },
    legSub: { fontFamily: font.semibold, fontSize: 13, color: color.body },

    mascot: { position: 'absolute', left: 0, top: 0 },

    bubbleWrap: { position: 'absolute', width: BUBBLE_W },
    bubble: {
      backgroundColor: color.bubble,
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 2,
      borderBottomWidth: 4,
      borderColor: color.red,
    },
    bubbleLabel: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.red },
    bubbleText: { fontFamily: font.extrabold, fontSize: 15, color: '#141414' },

    actions: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 12,
      backgroundColor: color.bg,
      borderTopWidth: 2,
      borderTopColor: color.line,
    },

    sheetShade: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    sheet: {
      backgroundColor: color.bg,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      paddingHorizontal: 18,
      paddingBottom: 36,
      paddingTop: 10,
      width: '100%',
      maxWidth: 520,
      alignSelf: 'center',
    },
    grab: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: color.line, marginBottom: 14 },
    sheetTitle: { fontFamily: font.extrabold, fontSize: 22, color: color.ink, marginBottom: 8, letterSpacing: -0.5 },
    sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 6, borderRadius: 10 },
    sheetArt: { width: 48, height: 48 },
    sheetPlace: { fontFamily: font.bold, fontSize: 17, color: color.ink },

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
      borderColor: color.groundLine,
    },
    linkTitle: { fontFamily: font.bold, fontSize: 16, color: color.ink },
    linkTag: { fontFamily: font.bold, fontSize: 14, color: color.red },
  });

function useStyles() {
  const color = useColors();
  const s = useMemo(() => makeStyles(color), [color]);
  return { color, s };
}
