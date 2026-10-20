import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { C, F, display, setPalette, ThemeName, isNavy } from './theme';

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

// fades + slides content in when a screen mounts
export function Enter({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: ViewStyle }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 420, delay, useNativeDriver: true }).start();
  }, []);
  return <Animated.View style={[style, { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>{children}</Animated.View>;
}

// ---------- watch illustration ----------
export function WatchArt({ size, dial = C.dial, dialHi = C.dialHi, strap = true, hour = 305, minute = 60, second = 190, date = '19' }: { size: number; dial?: string; dialHi?: string; strap?: boolean; hour?: number; minute?: number; second?: number; date?: string }) {
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 * Math.PI) / 180, r1 = 88, r2 = i % 5 ? 84 : 80;
    ticks.push(<Line key={'t' + i} x1={100 + r1 * Math.sin(a)} y1={100 - r1 * Math.cos(a)} x2={100 + r2 * Math.sin(a)} y2={100 - r2 * Math.cos(a)} stroke="#E9E4D8" strokeWidth={i % 5 ? 0.8 : 1.6} />);
  }
  const markers = [];
  for (let hh = 1; hh < 12; hh++) {
    if (hh === 3) continue;
    const a = (hh * 30 * Math.PI) / 180, x = 100 + 50 * Math.sin(a), y = 100 - 50 * Math.cos(a);
    markers.push(hh === 6 || hh === 9
      ? <Rect key={'m' + hh} x={x - 3.2} y={y - 9} width={6.4} height={18} rx={1.6} fill="#F4EEDD" stroke="#B8B2A2" strokeWidth={0.6} rotation={hh * 30} origin={`${x}, ${y}`} />
      : <Circle key={'m' + hh} cx={x} cy={y} r={5.6} fill="#F4EEDD" stroke="#B8B2A2" strokeWidth={0.6} />);
  }
  const bezel = [];
  for (let m = 10; m < 60; m += 10) {
    const a = (m * 6 * Math.PI) / 180, x = 100 + 95 * Math.sin(a), y = 100 - 95 * Math.cos(a);
    bezel.push(<SvgText key={'b' + m} x={x} y={y + 3.5} fontSize={10} fontWeight="700" fill="#D9B26A" textAnchor="middle" rotation={m * 6} origin={`${x}, ${y}`}>{String(m)}</SvgText>);
  }
  for (let m = 5; m < 60; m += 10) {
    const a = (m * 6 * Math.PI) / 180, x = 100 + 95 * Math.sin(a), y = 100 - 95 * Math.cos(a);
    bezel.push(<Rect key={'bm' + m} x={x - 1.5} y={y - 5} width={3} height={10} rx={1} fill="#D9B26A" rotation={m * 6} origin={`${x}, ${y}`} />);
  }
  const vb = strap ? '-8 -60 216 320' : '-8 -8 216 216';
  return (
    <Svg width={size} height={strap ? size * 1.6 : size} viewBox={vb}>
      <Defs>
        <LinearGradient id="s" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#C9C6BE" /><Stop offset="0.5" stopColor="#F1EFEA" /><Stop offset="1" stopColor="#B7B3A9" /></LinearGradient>
        <LinearGradient id="c" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#F4F2EE" /><Stop offset="0.55" stopColor="#C3C0B8" /><Stop offset="1" stopColor="#8F8B82" /></LinearGradient>
        <RadialGradient id="d" cx="0.4" cy="0.35" r="0.75"><Stop offset="0" stopColor={dialHi} /><Stop offset="1" stopColor={dial} /></RadialGradient>
      </Defs>
      {strap ? (
        <G>
          <Path d="M62 30 L70 -60 H130 L138 30Z" fill="url(#s)" stroke="#9A968C" strokeWidth={0.6} />
          <Path d="M62 170 L70 260 H130 L138 170Z" fill="url(#s)" stroke="#9A968C" strokeWidth={0.6} />
          <G stroke="#8E8A80" strokeWidth={0.8} opacity={0.7}>
            {[-40, -15, 10, 190, 215, 240].map(y => <Line key={y} x1={66} y1={y} x2={134} y2={y} />)}
            <Line x1={86} y1={-60} x2={88} y2={30} /><Line x1={114} y1={-60} x2={112} y2={30} />
            <Line x1={88} y1={170} x2={86} y2={260} /><Line x1={112} y1={170} x2={114} y2={260} />
          </G>
        </G>
      ) : null}
      <Rect x={196} y={91} width={13} height={18} rx={3} fill="url(#c)" stroke="#8E8A80" strokeWidth={0.6} />
      <Circle cx={100} cy={100} r={108} fill="url(#c)" stroke="#8E8A80" strokeWidth={0.8} />
      <Circle cx={100} cy={100} r={101} fill="#14201A" />
      {bezel}
      <Path d="M100 2 l7 11 h-14z" fill="#E9E4D8" />
      <Circle cx={100} cy={100} r={86} fill="#C9C6BE" />
      <Circle cx={100} cy={100} r={84} fill="url(#d)" />
      {ticks}
      <Path d="M100 41 l8 -13 h-16z" fill="#F4EEDD" stroke="#B8B2A2" strokeWidth={0.6} />
      {markers}
      <Rect x={139} y={92} width={20} height={16} rx={2} fill="#FBFAF6" />
      <SvgText x={149} y={104} fontSize={11} fontWeight="700" textAnchor="middle" fill="#15140F">{date}</SvgText>
      <SvgText x={100} y={140} fontSize={6.2} fontWeight="700" letterSpacing={1.4} textAnchor="middle" fill="#E9E4D8" opacity={0.85}>AUTOMATIC</SvgText>
      <G rotation={hour} origin="100, 100"><Path d="M97 104 L98 62 L94 58 L100 46 L106 58 L102 62 L103 104Z" fill="#F4EEDD" stroke="#B8B2A2" strokeWidth={0.6} /></G>
      <G rotation={minute} origin="100, 100"><Path d="M98 106 L98.5 30 L100 24 L101.5 30 L102 106Z" fill="#F4EEDD" stroke="#B8B2A2" strokeWidth={0.6} /></G>
      <G rotation={second} origin="100, 100"><Line x1={100} y1={120} x2={100} y2={22} stroke="#D9B26A" strokeWidth={1.4} /><Circle cx={100} cy={44} r={4} fill="none" stroke="#D9B26A" strokeWidth={1.4} /></G>
      <Circle cx={100} cy={100} r={3.6} fill="#D9B26A" />
      <Ellipse cx={72} cy={60} rx={42} ry={22} fill="#fff" opacity={0.06} rotation={-30} origin="72, 60" />
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
export function CountUp({ to, style, prefix = '$', duration = 900 }: { to: number; style: TextStyle; prefix?: string; duration?: number }) {
  const a = useRef(new Animated.Value(0)).current;
  const [v, setV] = React.useState(0);
  useEffect(() => {
    const id = a.addListener(({ value }) => setV(value));
    Animated.timing(a, { toValue: to, duration, useNativeDriver: false }).start();
    return () => a.removeListener(id);
  }, [to]);
  return <Text style={style}>{prefix + Math.round(v).toLocaleString('en-US')}</Text>;
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
