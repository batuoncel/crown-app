import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { C, F, display, money, setPalette, ThemeName, isNavy } from './theme';
import type { WatchKind } from './data';

// ---------- icons (Phosphor-style strokes) ----------
const P: Record<string, string> = {
  chart: 'M4 20h16M6 16l4-5 3 3 5-7',
  tag: 'M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9z',
  bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2',
  back: 'M15 5l-7 7 7 7',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5h4',
  cal: 'M4 7.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10h16M8 3.5v4M16 3.5v4',
  box: 'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  lock: 'M5 12.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM8 10.5V8a4 4 0 0 1 8 0v2.5',
  scan: 'M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7',
  watch: 'M12 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11M9 6.8L9.8 3h4.4l.8 3.8M9 17.2l.8 3.8h4.4l.8-3.8M12 9.5V12l1.6 1',
  phone: 'M9.5 3h5A2.5 2.5 0 0 1 17 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-5A2.5 2.5 0 0 1 7 18.5v-13A2.5 2.5 0 0 1 9.5 3',
  info: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17M12 11v5M12 8v.1',
  plus: 'M12 5v14M5 12h14',
  search: 'M11 4.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13M16 16l4 4',
  image: 'M4 6.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 16l5-5 4 4 3-3 4 4',
  flash: 'M13 3L6 13h5l-1 8 7-10h-5z',
  alert: 'M12 4l9 16H3zM12 10v4M12 17v.1',
  refresh: 'M19 8a8 8 0 1 0 1 6M19 3v5h-5',
  trash: 'M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6',
  medal: 'M8.5 3h7l-1.8 5.2M8.5 3l1.8 5.2M12 8.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12M12 11.5l1.1 2.2 2.4.3-1.7 1.7.4 2.4-2.2-1.2-2.2 1.2.4-2.4-1.7-1.7 2.4-.3z',
  drop: 'M12 3.5s6 6.6 6 10.5a6 6 0 0 1-12 0c0-3.9 6-10.5 6-10.5z',
  shield: 'M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6zM9 12l2 2 4-4',
  wrench: 'M14.5 4.5a4 4 0 0 0-4.9 5.2L4 15.3 6.7 18l5.6-5.6a4 4 0 0 0 5.2-4.9l-2.4 2.4-2.3-.6-.6-2.3z',
  wave: 'M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  heart: 'M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z',
  flame: 'M12 21c-3.6 0-6.5-2.6-6.5-6.2 0-3.4 2.6-5.3 3.6-8.3 1.6 1.2 2.4 2.8 2.4 4.6 1.2-.8 1.9-2.3 2-3.9 2.4 1.8 5 4.6 5 7.6 0 3.6-2.9 6.2-6.5 6.2z',
  thumb: 'M7 11v9H4.5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1zM7 11l3.5-7a2 2 0 0 1 2 2v3.5h5.3a2 2 0 0 1 2 2.3l-1.2 7a2 2 0 0 1-2 1.7H7',
  sliders: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',
  share: 'M12 14.5V3.5M7.5 8L12 3.5 16.5 8M5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7',
  chevron: 'M9.5 5.5L16 12l-6.5 6.5',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  contrast: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17M12 3.5v17M12 7h4.5M12 10.5h7.5M12 14h7.5M12 17.5h4.5',
};
export function Icon({ name, size = 22, color = C.ink, w = 1.8 }: { name: keyof typeof P | string; size?: number; color?: string; w?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={P[name]} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ---------- typography ----------
const makeT = () => StyleSheet.create({
  h1: { fontFamily: F.serif, lineHeight: 44, color: C.ink, letterSpacing: -0.4, ...display(40) },
  h2: { fontFamily: F.serif, lineHeight: 36, color: C.ink, letterSpacing: -0.3, ...display(32) },
  sub: { fontFamily: F.regular, fontSize: 16, lineHeight: 24, color: C.stone, marginTop: 10 },
  eyebrow: { fontFamily: F.bold, fontSize: 12, letterSpacing: 1.4, color: C.green, textTransform: 'uppercase' },
  body: { fontFamily: F.medium, fontSize: 15, color: C.ink },
  b: { fontFamily: F.bold, fontSize: 16, color: C.ink },
  small: { fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: C.stone },
  label: { fontFamily: F.bold, fontSize: 11.5, letterSpacing: 1.2, color: C.stone },
});
export const T = makeT();

// Swaps the palette and rebuilds the text styles; the app remounts after this.
export function applyTheme(name: ThemeName) {
  setPalette(name);
  Object.assign(T, makeT());
}

// ---------- buttons ----------
export function Button({ title, onPress, icon, kind = 'primary', disabled, style }: { title: string; onPress: () => void; icon?: string; kind?: 'primary' | 'ghost' | 'light'; disabled?: boolean; style?: ViewStyle }) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  const bg = kind === 'primary' ? C.green : kind === 'light' ? C.paper : 'transparent';
  const fg = kind === 'primary' ? C.onPrimary : kind === 'light' ? C.ink : kind === 'ghost' ? C.ink : C.ink;
  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => to(0.97)}
      onPressOut={() => to(1)}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Animated.View style={[{ height: kind === 'ghost' ? 44 : 56, borderRadius: 16, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: disabled ? 0.4 : 1, transform: [{ scale }] }, style]}>
        {icon ? <Icon name={icon} size={20} color={fg} /> : null}
        <Text style={{ fontFamily: kind === 'ghost' ? F.semibold : F.bold, fontSize: kind === 'ghost' ? 15 : 17, color: fg }}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function RoundButton({ icon, onPress, dark, label }: { icon: string; onPress: () => void; dark?: boolean; label: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel={label}
      style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: dark ? 'rgba(255,255,255,.14)' : C.line, backgroundColor: dark ? 'rgba(255,255,255,.08)' : C.surface }}>
      <Icon name={icon} size={18} color={dark ? C.nightText : C.ink} w={2} />
    </Pressable>
  );
}

// ---------- onboarding progress ----------
export function Progress({ step, total = 6 }: { step: number; total?: number }) {
  return (
    <View style={{ flex: 1, flexDirection: 'row', gap: 6 }} accessibilityLabel={`Step ${step} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <Seg key={i} on={i < step} />
      ))}
    </View>
  );
}
function Seg({ on }: { on: boolean }) {
  const a = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: on ? 1 : 0, duration: 380, useNativeDriver: false }).start();
  }, [on]);
  return (
    <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: C.line, overflow: 'hidden' }}>
      <Animated.View style={{ height: 4, backgroundColor: C.green, width: a.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}

export function Card({ children, style, selected }: { children: React.ReactNode; style?: ViewStyle; selected?: boolean }) {
  return <View style={[{ backgroundColor: selected ? C.selectedBg : C.surface, borderRadius: 20, borderWidth: selected ? 2 : 1, borderColor: selected ? C.green : C.line }, style]}>{children}</View>;
}

export function Pill({ text, bg, fg, icon }: { text: string; bg: string; fg: string; icon?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 28, paddingHorizontal: 12, borderRadius: 14, backgroundColor: bg, alignSelf: 'flex-start' }}>
      {icon ? <Icon name={icon} size={14} color={fg} w={2.2} /> : null}
      <Text style={{ fontFamily: F.bold, fontSize: 12.5, color: fg }}>{text}</Text>
    </View>
  );
}

// The user's own photo of the watch. There are tens of thousands of references, so there is no
// stock drawing per model: without a photo we show a brand monogram instead.
export function WatchThumb({ photo, brand, size, radius = size * 0.25, style }: { photo?: string; brand: string; size: number; radius?: number; style?: ViewStyle }) {
  if (photo) return <Image source={{ uri: photo }} style={[{ width: size, height: size, borderRadius: radius, backgroundColor: C.line }, style as object]} accessibilityLabel={`Your photo of the ${brand}`} />;
  const initials = brand.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <View style={[{ width: size, height: size, borderRadius: radius, backgroundColor: C.halo, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.line }, style]}>
      <Text style={{ fontFamily: F.serif, fontSize: size * (initials.length > 1 ? 0.34 : 0.44), color: C.brassInk, letterSpacing: 1 }}>{initials}</Text>
      {size >= 90 ? <Text style={{ fontFamily: F.semibold, fontSize: 11.5, color: C.stone, marginTop: 4 }}>No photo yet</Text> : null}
    </View>
  );
}

// Bottom call-to-action with a fixed-height slot under the main button (secondary button or note),
// so the main button sits at the same spot on every onboarding screen and on the paywall.
export function BottomCTA({ children, secondary, note }: { children: React.ReactNode; secondary?: React.ReactNode; note?: string }) {
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 }}>
      {children}
      <View style={{ height: 48, justifyContent: 'center' }}>
        {secondary ?? (note ? <Text style={{ fontFamily: F.regular, fontSize: 12, lineHeight: 16, color: C.stone, textAlign: 'center' }}>{note}</Text> : null)}
      </View>
    </View>
  );
}

// segmented control (theme, currency, papers)
export function Segmented<K extends string>({ options, value, onChange }: { options: { key: K; label: string }[]; value: K | null; onChange: (k: K) => void }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: C.paper, borderRadius: 12, padding: 3, borderWidth: 1, borderColor: C.line }} accessibilityRole="radiogroup">
      {options.map(o => {
        const on = o.key === value;
        return (
          <Pressable key={o.key} style={{ flex: 1 }} onPress={() => { Haptics.selectionAsync(); onChange(o.key); }} accessibilityRole="radio" accessibilityState={{ selected: on }}>
            <View style={{ height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? C.surface : 'transparent', borderWidth: on ? 1 : 0, borderColor: C.line }}>
              <Text style={{ fontFamily: on ? F.bold : F.semibold, fontSize: 13.5, color: on ? C.ink : C.stone }}>{o.label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

// fades + slides content in when a screen mounts
export function Enter({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: ViewStyle }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 420, delay, useNativeDriver: true }).start();
  }, []);
  return <Animated.View style={[style, { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>{children}</Animated.View>;
}

// ---------- watch illustration ----------
// Flat, type-based drawings: each model is drawn as its case type (diver, dress, chronograph, square)
// in its own dial and bezel colours. Not a photo of the real watch.
export type WatchLook = { kind?: WatchKind; dial?: string; dialHi?: string; bezel?: string | [string, string]; fluted?: boolean; date?: boolean; accent?: string };

let watchIds = 0;
const lightHex = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 150;
};
const at = (r: number, deg: number) => [100 + r * Math.sin((deg * Math.PI) / 180), 100 - r * Math.cos((deg * Math.PI) / 180)] as const;
const STEEL_EDGE = '#8E8A81';

function Hands({ R, color, edge, sec, blued }: { R: number; color: string; edge: string; sec?: string; blued?: boolean }) {
  const w1 = blued ? 2.2 : 3.4, w2 = blued ? 1.6 : 2.5;
  const hand = (len: number, w: number, tail: number) =>
    `M${100 - w} ${100 + tail} L${100 - w} ${100 - len + w * 2.4} L100 ${100 - len} L${100 + w} ${100 - len + w * 2.4} L${100 + w} ${100 + tail}Z`;
  return (
    <G>
      <G rotation={305} origin="100, 100"><Path d={hand(R * 0.56, w1, R * 0.1)} fill={color} stroke={edge} strokeWidth={0.7} /></G>
      <G rotation={60} origin="100, 100"><Path d={hand(R * 0.86, w2, R * 0.12)} fill={color} stroke={edge} strokeWidth={0.7} /></G>
      {sec ? <G rotation={196} origin="100, 100"><Line x1={100} y1={100 + R * 0.22} x2={100} y2={100 - R * 0.9} stroke={sec} strokeWidth={1.3} strokeLinecap="round" /></G> : null}
      <Circle cx={100} cy={100} r={3.6} fill={sec ?? color} />
    </G>
  );
}

function Bracelet({ id, wide }: { id: string; wide?: boolean }) {
  const x0 = wide ? 50 : 64, x1 = wide ? 150 : 136, inset = 4;
  const c0 = wide ? 80 : 88, c1 = wide ? 120 : 112;
  const half = (y0: number, y1: number, k: string) => {
    const top = Math.min(y0, y1), bot = Math.max(y0, y1);
    const rows = [];
    for (let y = top + 18; y < bot - 4; y += 19) rows.push(<Line key={k + y} x1={x0 + inset} y1={y} x2={x1 - inset} y2={y} stroke={STEEL_EDGE} strokeWidth={0.7} opacity={0.55} />);
    return (
      <G key={k}>
        <Rect x={x0 + inset} y={top} width={x1 - x0 - inset * 2} height={bot - top} rx={6} fill={`url(#${id}s)`} stroke={STEEL_EDGE} strokeWidth={0.8} />
        <Rect x={c0} y={top} width={c1 - c0} height={bot - top} fill="#F2F0EB" opacity={0.75} />
        <Line x1={c0} y1={top} x2={c0} y2={bot} stroke={STEEL_EDGE} strokeWidth={0.7} opacity={0.6} />
        <Line x1={c1} y1={top} x2={c1} y2={bot} stroke={STEEL_EDGE} strokeWidth={0.7} opacity={0.6} />
        {rows}
      </G>
    );
  };
  return <G>{half(-72, 40, 'top')}{half(160, 272, 'bot')}</G>;
}

export function WatchArt({ size, look, strap = true, dial, dialHi }: { size: number; look?: WatchLook; strap?: boolean; dial?: string; dialHi?: string }) {
  const id = useRef('w' + watchIds++).current; // unique per drawing: SVG ids are shared across the whole web page
  const kind = look?.kind ?? 'diver';
  const d = look?.dial ?? dial ?? C.dial;
  const dh = look?.dialHi ?? dialHi ?? C.dialHi;
  const light = lightHex(d);
  const ink = light ? '#232836' : '#F3F0E8';
  const edge = light ? '#232836' : '#9C988F';
  const idx = look?.accent ?? ink;
  const sec = light ? '#B5462F' : '#D9B26A';
  const showText = size >= 120;
  const vb = strap ? '-10 -72 220 344' : '-10 -10 220 220';
  const h = strap ? (size * 344) / 220 : size;

  const minuteTicks = (r: number, len: number, op = 0.6) =>
    Array.from({ length: 60 }, (_, i) => {
      const [x1, y1] = at(r, i * 6), [x2, y2] = at(r - (i % 5 ? len : len * 1.8), i * 6);
      return <Line key={'mt' + i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={i % 5 ? 0.7 : 1.2} opacity={op} />;
    });
  const dateWindow = (cx: number) => (
    <G>
      <Rect x={cx - 9} y={93} width={18} height={14} rx={2} fill="#FBFAF6" stroke={light ? '#BDB8AC' : 'none'} strokeWidth={0.6} />
      {showText ? <SvgText x={cx} y={104} fontSize={10} fontWeight="700" textAnchor="middle" fill="#15140F">19</SvgText> : null}
    </G>
  );

  let body: React.ReactNode;
  if (kind === 'square') {
    // Santos-style: rounded square case, screwed bezel, blued sword hands
    const screws = [[34, 34], [166, 34], [34, 166], [166, 166], [100, 27], [100, 173], [27, 100], [173, 100]];
    const bars = Array.from({ length: 12 }, (_, i) => {
      const a = i * 30, s = Math.sin((a * Math.PI) / 180), c = Math.cos((a * Math.PI) / 180);
      const k = 1 / Math.max(Math.abs(s), Math.abs(c));
      const p = (r: number) => [100 + r * k * s, 100 - r * k * c];
      const [x1, y1] = p(56), [x2, y2] = p(i % 3 ? 48 : 44);
      return <Line key={'sq' + i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={i % 3 ? 1.6 : 2.6} />;
    });
    body = (
      <G>
        <Rect x={190} y={90} width={10} height={20} rx={2} fill={`url(#${id}c)`} stroke={STEEL_EDGE} strokeWidth={0.8} />
        <Circle cx={203} cy={100} r={5} fill="#2A4FA8" stroke="#1B356F" strokeWidth={0.8} />
        <Rect x={10} y={12} width={180} height={176} rx={30} fill={`url(#${id}c)`} stroke={STEEL_EDGE} strokeWidth={1} />
        <Rect x={20} y={20} width={160} height={160} rx={24} fill="#E7E5DF" stroke={STEEL_EDGE} strokeWidth={0.8} />
        {screws.map(([x, y]) => <Circle key={'s' + x + y} cx={x} cy={y} r={4} fill="#CFCBC2" stroke={STEEL_EDGE} strokeWidth={0.8} />)}
        <Rect x={38} y={38} width={124} height={124} rx={14} fill={`url(#${id}d)`} />
        <Rect x={44} y={44} width={112} height={112} rx={10} fill="none" stroke={ink} strokeWidth={0.8} opacity={0.55} />
        {bars}
        <Hands R={66} color="#2A3F8F" edge="#1B2A63" blued />
      </G>
    );
  } else {
    const caseR = 96;
    const bezelColors = look?.bezel;
    let bezel: React.ReactNode = null;
    let dialR = 80;
    if (kind === 'diver') {
      dialR = 70;
      const marks = [];
      for (let i = 1; i < 12; i++) {
        const [x, y] = at(84, i * 30);
        marks.push(<Rect key={'bz' + i} x={x - 1.6} y={y - 5} width={3.2} height={10} rx={1} fill="#F3F0E8" opacity={0.9} rotation={i * 30} origin={`${x}, ${y}`} />);
      }
      for (let m = 1; m < 15; m++) {
        if (m % 5 === 0) continue;
        const [x1, y1] = at(88, m * 6), [x2, y2] = at(83, m * 6);
        marks.push(<Line key={'bm' + m} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F3F0E8" strokeWidth={1} opacity={0.8} />);
      }
      const [top, bottom] = Array.isArray(bezelColors) ? bezelColors : [bezelColors ?? '#17191A', bezelColors ?? '#17191A'];
      bezel = (
        <G>
          <Circle cx={100} cy={100} r={91} fill="#C7C3BA" stroke={STEEL_EDGE} strokeWidth={0.8} />
          <Path d="M10 100 A90 90 0 0 1 190 100 L176 100 A76 76 0 0 0 24 100Z" fill={top} />
          <Path d="M10 100 A90 90 0 0 0 190 100 L176 100 A76 76 0 0 1 24 100Z" fill={bottom} />
          {marks}
          <Path d="M100 23 L93 13 H107Z" fill="#F3F0E8" />
          <Circle cx={100} cy={100} r={73} fill="#2B2D2C" />
        </G>
      );
    } else if (kind === 'chrono') {
      if (bezelColors) {
        dialR = 74;
        const ticks = Array.from({ length: 60 }, (_, i) => {
          const [x1, y1] = at(89, i * 6), [x2, y2] = at(i % 5 ? 86 : 82, i * 6);
          return <Line key={'tb' + i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F3F0E8" strokeWidth={i % 5 ? 0.8 : 1.6} opacity={0.85} />;
        });
        bezel = <G><Circle cx={100} cy={100} r={91} fill={bezelColors as string} stroke={STEEL_EDGE} strokeWidth={0.8} />{ticks}<Circle cx={100} cy={100} r={76} fill="#2B2D2C" /></G>;
      } else {
        dialR = 84;
        bezel = <Circle cx={100} cy={100} r={88} fill="#E3E1DB" stroke={STEEL_EDGE} strokeWidth={0.8} />;
      }
    } else {
      // dress
      dialR = 80;
      const flutes = look?.fluted
        ? Array.from({ length: 48 }, (_, i) => {
            const [x1, y1] = at(90, i * 7.5), [x2, y2] = at(81, i * 7.5);
            return <Line key={'fl' + i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={STEEL_EDGE} strokeWidth={1.4} opacity={0.7} />;
          })
        : null;
      bezel = <G><Circle cx={100} cy={100} r={91} fill={look?.fluted ? '#EDEBE6' : `url(#${id}b)`} stroke={STEEL_EDGE} strokeWidth={0.8} />{flutes}</G>;
    }

    // dial furniture
    let furniture: React.ReactNode;
    if (kind === 'diver') {
      const ms = [];
      for (let hh = 1; hh < 12; hh++) {
        if (hh === 3 && look?.date) continue;
        const [x, y] = at(56, hh * 30);
        ms.push(hh % 3 === 0
          ? <Rect key={'h' + hh} x={x - 3.2} y={y - 8} width={6.4} height={16} rx={1.6} fill={idx} stroke={edge} strokeWidth={0.5} rotation={hh * 30} origin={`${x}, ${y}`} />
          : <Circle key={'h' + hh} cx={x} cy={y} r={5} fill={idx} stroke={edge} strokeWidth={0.5} />);
      }
      furniture = <G>{minuteTicks(69, 3, 0.55)}<Path d="M100 50 L92 38 H108Z" fill={idx} stroke={edge} strokeWidth={0.5} />{ms}{look?.date ? dateWindow(141) : null}</G>;
    } else if (kind === 'chrono') {
      const sub = (deg: number) => {
        const [x, y] = at(dialR * 0.46, deg), r = dialR * 0.25;
        return (
          <G key={'sd' + deg}>
            <Circle cx={x} cy={y} r={r} fill={dh} stroke={ink} strokeWidth={0.8} opacity={0.95} />
            {Array.from({ length: 12 }, (_, i) => { const a = (i * 30 * Math.PI) / 180; return <Line key={i} x1={x + r * 0.78 * Math.sin(a)} y1={y - r * 0.78 * Math.cos(a)} x2={x + r * 0.95 * Math.sin(a)} y2={y - r * 0.95 * Math.cos(a)} stroke={ink} strokeWidth={0.6} opacity={0.7} />; })}
            <Line x1={x} y1={y} x2={x + r * 0.7 * 0.64} y2={y - r * 0.7 * 0.77} stroke={ink} strokeWidth={1.2} strokeLinecap="round" />
          </G>
        );
      };
      const bars = [];
      for (let hh = 0; hh < 12; hh++) {
        if (hh % 3 === 0 && hh !== 0) continue;
        const [x1, y1] = at(dialR - 6, hh * 30), [x2, y2] = at(dialR - (hh === 0 ? 20 : 16), hh * 30);
        bars.push(<Line key={'cb' + hh} x1={x1} y1={y1} x2={x2} y2={y2} stroke={idx} strokeWidth={hh === 0 ? 4 : 3} strokeLinecap="round" />);
      }
      furniture = <G>{minuteTicks(dialR - 1, 3, 0.55)}{bars}{sub(90)}{sub(180)}{sub(270)}</G>;
    } else {
      const bars = [];
      for (let hh = 0; hh < 12; hh++) {
        if (hh === 3 && look?.date) continue;
        const [x1, y1] = at(dialR - 9, hh * 30), [x2, y2] = at(dialR - 24, hh * 30);
        if (hh === 0) {
          bars.push(<G key="b12" rotation={0} origin="100, 100"><Rect x={95} y={100 - dialR + 9} width={3.4} height={15} rx={1} fill={idx} stroke={edge} strokeWidth={0.4} /><Rect x={101.6} y={100 - dialR + 9} width={3.4} height={15} rx={1} fill={idx} stroke={edge} strokeWidth={0.4} /></G>);
        } else bars.push(<Line key={'db' + hh} x1={x1} y1={y1} x2={x2} y2={y2} stroke={idx} strokeWidth={3.6} strokeLinecap="round" />);
      }
      furniture = <G>{minuteTicks(dialR - 1, 3, 0.5)}{bars}{look?.date ? dateWindow(100 + dialR - 17) : null}</G>;
    }

    const pushers = kind === 'chrono'
      ? [55, 125].map(a => { const [x, y] = at(caseR + 4, a); return <Rect key={'p' + a} x={x - 5} y={y - 8} width={10} height={16} rx={3} fill={`url(#${id}c)`} stroke={STEEL_EDGE} strokeWidth={0.8} rotation={a - 90} origin={`${x}, ${y}`} />; })
      : null;
    body = (
      <G>
        {!strap ? [[62, -2], [120, -2], [62, 172], [120, 172]].map(([x, y]) => <Rect key={'lug' + x + y} x={x} y={y} width={18} height={30} rx={5} fill={`url(#${id}c)`} stroke={STEEL_EDGE} strokeWidth={0.8} />) : null}
        {pushers}
        <Rect x={192} y={90} width={14} height={20} rx={3} fill={`url(#${id}c)`} stroke={STEEL_EDGE} strokeWidth={0.8} />
        <Circle cx={100} cy={100} r={caseR} fill={`url(#${id}c)`} stroke={STEEL_EDGE} strokeWidth={1} />
        {bezel}
        <Circle cx={100} cy={100} r={dialR} fill={`url(#${id}d)`} />
        {furniture}
        <Hands R={dialR} color={ink} edge={edge} sec={sec} />
      </G>
    );
  }

  return (
    <Svg width={size} height={h} viewBox={vb}>
      <Defs>
        <LinearGradient id={id + 's'} x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#BFBBB2" /><Stop offset="0.5" stopColor="#ECEAE5" /><Stop offset="1" stopColor="#B3AFA5" /></LinearGradient>
        <LinearGradient id={id + 'c'} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#F2F0EC" /><Stop offset="0.6" stopColor="#C8C5BD" /><Stop offset="1" stopColor="#9E9A91" /></LinearGradient>
        <LinearGradient id={id + 'b'} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#FAF9F6" /><Stop offset="1" stopColor="#B9B5AC" /></LinearGradient>
        <RadialGradient id={id + 'd'} cx="0.42" cy="0.38" r="0.7"><Stop offset="0" stopColor={dh} /><Stop offset="1" stopColor={d} /></RadialGradient>
      </Defs>
      {strap ? <Bracelet id={id} wide={kind === 'square'} /> : null}
      {body}
    </Svg>
  );
}

// ---------- line chart ----------
export function LineChart({ data, width, height, color = C.green, fill = true }: { data: number[]; width: number; height: number; color?: string; fill?: boolean }) {
  const max = Math.max(...data), min = Math.min(...data), span = max - min || 1;
  const pts = data.map((v, i) => [(i * width) / (data.length - 1), height - 8 - ((v - min) / span) * (height - 18)]);
  const d = 'M' + pts.map(p => p.map(n => n.toFixed(1)).join(' ')).join(' L');
  const last = pts[pts.length - 1];
  return (
    <Svg width={width} height={height} style={{ overflow: 'visible' }}>
      {fill ? <Path d={`${d} L${width} ${height} L0 ${height}Z`} fill={color} opacity={0.08} /> : null}
      <Path d={d} fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
      <Circle cx={last[0]} cy={last[1]} r={10} fill={color} opacity={0.15} />
      <Circle cx={last[0]} cy={last[1]} r={5} fill={color} />
    </Svg>
  );
}

// counts a number up from 0 for the value reveal
export function CountUp({ to, style, duration = 900 }: { to: number; style: TextStyle; duration?: number }) {
  const a = useRef(new Animated.Value(0)).current;
  const [v, setV] = React.useState(0);
  useEffect(() => {
    const id = a.addListener(({ value }) => setV(value));
    Animated.timing(a, { toValue: to, duration, useNativeDriver: false }).start();
    return () => a.removeListener(id);
  }, [to]);
  return <Text style={style}>{money(v)}</Text>;
}

export function Logo({ color = C.ink, onLongPress }: { color?: string; onLongPress?: () => void }) {
  return (
    <Pressable onLongPress={onLongPress} delayLongPress={900} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }} accessibilityLabel="Crown">
      {isNavy()
        ? <Image source={require('../assets/crown-mark.png')} style={{ width: 32, height: 32, borderRadius: 9 }} />
        : <Image source={require('../assets/crown-mark-light.png')} style={{ width: 36, height: 36, marginHorizontal: -2 }} />}
      <Text style={{ fontFamily: F.serif, fontSize: isNavy() ? 20 : 24, letterSpacing: 3, color }}>CROWN</Text>
    </Pressable>
  );
}
