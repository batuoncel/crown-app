// Launch animation: the crown (left) and the gear with its winding crown (right) each appear
// with "CROWN" under them, glide together into the Crown logo, the winding crown clicks in,
// one "CROWN" wordmark remains, and a gold loading bar fills before the app opens.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { F } from './theme';

// SVG coordinates (from the 800×440 design); this window shows the part where the pieces move.
const VB = { x: 125, y: 40, w: 550, h: 240 };
const SPLIT_X = 150; // how far each piece sits from the centre before merging
const LUX = Easing.bezier(0.22, 1, 0.36, 1);

function gearPath() {
  const cx = 400, cy = 198, teeth = 22, outer = 76, root = 64.5, rim = 52, hub = 22;
  const step = (Math.PI * 2) / teeth;
  const p = (r: number, a: number) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const b = i * step - Math.PI / 2;
    d += `${i ? 'L' : 'M'} ${p(root, b)} L ${p(outer, b + step * 0.14)} L ${p(outer, b + step * 0.44)} L ${p(root, b + step * 0.58)} `;
  }
  d += 'Z ';
  const spokes = 6, sector = (Math.PI * 2) / spokes, half = 0.135;
  for (let s = 0; s < spokes; s++) {
    const a1 = s * sector + half, a2 = (s + 1) * sector - half;
    d += `M ${p(rim, a1)} A ${rim} ${rim} 0 0 1 ${p(rim, a2)} L ${p(hub, a2)} A ${hub} ${hub} 0 0 0 ${p(hub, a1)} Z `;
  }
  const ax = 13.5;
  d += `M ${cx + ax} ${cy} A ${ax} ${ax} 0 1 0 ${cx - ax} ${cy} A ${ax} ${ax} 0 1 0 ${cx + ax} ${cy} Z`;
  return d;
}

// gradients each SVG needs; ids are prefixed because SVG ids are shared across a web page
function Golds({ p }: { p: string }) {
  return (
    <>
      <LinearGradient id={p + 'main'} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#fff4c7" /><Stop offset="0.28" stopColor="#e8c660" /><Stop offset="0.62" stopColor="#c59b27" /><Stop offset="0.86" stopColor="#8f6a14" /><Stop offset="1" stopColor="#d8b24c" />
      </LinearGradient>
      <LinearGradient id={p + 'bright'} x1="0" y1="0" x2="0.8" y2="1">
        <Stop offset="0" stopColor="#fff8dc" /><Stop offset="0.4" stopColor="#f2d479" /><Stop offset="0.78" stopColor="#c89f2c" /><Stop offset="1" stopColor="#9e7719" />
      </LinearGradient>
      <LinearGradient id={p + 'vert'} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#fff3c4" /><Stop offset="0.45" stopColor="#e5c158" /><Stop offset="0.8" stopColor="#b4891e" /><Stop offset="1" stopColor="#7c5a0d" />
      </LinearGradient>
      <LinearGradient id={p + 'rim'} x1="0" y1="0.5" x2="1" y2="0.5">
        <Stop offset="0" stopColor="#9e7618" /><Stop offset="0.25" stopColor="#f5d87e" /><Stop offset="0.5" stopColor="#fff4c7" /><Stop offset="0.75" stopColor="#c59b27" /><Stop offset="1" stopColor="#8a6612" />
      </LinearGradient>
      <LinearGradient id={p + 'navy'} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#17273d" /><Stop offset="0.6" stopColor="#0e1928" /><Stop offset="1" stopColor="#09101b" />
      </LinearGradient>
    </>
  );
}

function CrownPiece({ w, h }: { w: number; h: number }) {
  const u = (id: string) => `url(#c${id})`;
  return (
    <Svg width={w} height={h} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}>
      <Defs><Golds p="c" /></Defs>
      <Path d="M 332 162 L 343 92 L 368 148 Z" fill={u('navy')} stroke={u('main')} strokeWidth={2.6} strokeLinejoin="round" />
      <Path d="M 343 85 L 349 98 L 343 108 L 337 98 Z" fill={u('bright')} />
      <Path d="M 468 162 L 457 92 L 432 148 Z" fill={u('navy')} stroke={u('main')} strokeWidth={2.6} strokeLinejoin="round" />
      <Path d="M 457 85 L 463 98 L 457 108 L 451 98 Z" fill={u('bright')} />
      <Path d="M 326 184 L 302 100 Q 348 164 400 94 L 400 179 Q 362 178 326 184 Z" fill={u('bright')} stroke={u('main')} strokeWidth={2.4} strokeLinejoin="round" />
      <Path d="M 311 114 Q 344 162 374 156 L 366 178 Q 345 179 329 182 Z" fill={u('navy')} opacity={0.95} />
      <Path d="M 474 184 L 498 100 Q 452 164 400 94 L 400 179 Q 438 178 474 184 Z" fill={u('navy')} stroke={u('main')} strokeWidth={2.6} strokeLinejoin="round" />
      <Path d="M 400 54 L 390 77 L 400 100 Z" fill="#fff4c7" />
      <Path d="M 400 54 L 410 77 L 400 100 Z" fill={u('main')} />
      <Path d="M 400 54 L 410 77 L 400 100 L 390 77 Z" fill="none" stroke="#fff6d4" strokeWidth={0.9} strokeLinejoin="round" />
      <Path d="M 324 182 Q 400 171 476 182 L 474 191 Q 400 180 326 191 Z" fill={u('navy')} stroke={u('rim')} strokeWidth={2.4} strokeLinejoin="round" />
      <Path d="M 332 184.5 Q 400 174.5 468 184.5" fill="none" stroke="#fff6d4" strokeWidth={1} opacity={0.65} />
    </Svg>
  );
}

function GearPiece({ w, h, angle, clicked }: { w: number; h: number; angle: number; clicked: boolean }) {
  const d = useMemo(gearPath, []);
  const u = (id: string) => `url(#g${id})`;
  const ribs = [189.5, 194.2, 198.8, 203.2, 207.8, 212.5, 216.8];
  return (
    <Svg width={w} height={h} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}>
      <Defs>
        <Golds p="g" />
        <ClipPath id="glower"><Rect x={290} y={205} width={220} height={125} /></ClipPath>
      </Defs>
      <G clipPath="url(#glower)">
        <G rotation={angle} origin="400, 198">
          <Path d={d} fill={u('vert')} fillRule="evenodd" stroke="#fff4c7" strokeWidth={0.6} strokeLinejoin="round" />
          <Circle cx={400} cy={198} r={61.5} fill="none" stroke="#8a6612" strokeWidth={1.5} opacity={0.65} />
          <Circle cx={400} cy={198} r={53.5} fill="none" stroke="#fff4c7" strokeWidth={0.9} opacity={0.55} />
          <Circle cx={400} cy={198} r={19} fill="none" stroke={u('main')} strokeWidth={7.5} />
        </G>
      </G>
      <Path d="M 326 196 Q 400 185 474 196 L 474 210 Q 400 202 326 210 Z" fill={u('navy')} />
      <Path d="M 326 196 Q 400 185 474 196" fill="none" stroke={u('rim')} strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M 326 210 Q 400 202 474 210" fill="none" stroke={u('main')} strokeWidth={1.6} strokeLinecap="round" opacity={0.85} />
      {/* winding crown: pulled out, then clicks in when the pieces lock */}
      <G x={clicked ? 0 : 11}>
        <Rect x={473} y={195.5} width={9} height={15} rx={1} fill={u('vert')} stroke="#6e500a" strokeWidth={0.7} />
        <Rect x={481} y={185} width={18} height={36} rx={3.2} fill={u('vert')} stroke="#8a6612" strokeWidth={1} />
        {ribs.map(y => <Line key={y} x1={482.5} y1={y} x2={497.5} y2={y} stroke="#0e1726" strokeWidth={1.6} strokeLinecap="round" />)}
        <Path d="M 499 189.5 C 505.5 192.5, 505.5 213.5, 499 216.5 Z" fill={u('bright')} stroke="#8a6612" strokeWidth={0.9} />
      </G>
    </Svg>
  );
}

export function BrandSplash({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const { width, height } = useWindowDimensions();
  const w = Math.min(width - 16, 520);
  const h = (w * VB.h) / VB.w;
  const s = w / VB.w; // px per SVG unit

  const appear = useRef(new Animated.Value(0)).current;
  const merge = useRef(new Animated.Value(0)).current;
  const word = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const bar = useRef(new Animated.Value(0)).current;
  const out = useRef(new Animated.Value(1)).current;
  const [angle, setAngle] = useState(0);
  const [clicked, setClicked] = useState(false);
  const [barDone, setBarDone] = useState(false);

  useEffect(() => {
    Animated.timing(appear, { toValue: 1, duration: 700, easing: LUX, useNativeDriver: true }).start();
    Animated.timing(bar, { toValue: 1, duration: 3400, easing: Easing.inOut(Easing.quad), useNativeDriver: false }).start(() => setBarDone(true));
    // gear ticks like an escapement while the pieces are apart
    const tick = setInterval(() => setAngle(a => a + 7.5), 280);
    const t1 = setTimeout(() => {
      clearInterval(tick);
      setAngle(0);
      Animated.timing(merge, { toValue: 1, duration: 1250, easing: LUX, useNativeDriver: true }).start();
    }, 1500);
    const t2 = setTimeout(() => {
      setClicked(true);
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.025, duration: 160, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 260, easing: LUX, useNativeDriver: true }),
      ]).start();
      Animated.timing(word, { toValue: 1, duration: 650, easing: LUX, useNativeDriver: true }).start();
    }, 2700);
    return () => { clearInterval(tick); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // open the app once the bar is full and the app has loaded
  useEffect(() => {
    if (!barDone || !ready) return;
    Animated.timing(out, { toValue: 0, duration: 380, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => onDone());
  }, [barDone, ready]);

  const shift = (sign: 1 | -1, dy: number) => ({
    opacity: appear,
    transform: [
      { translateX: merge.interpolate({ inputRange: [0, 1], outputRange: [sign * SPLIT_X * s, 0] }) },
      { translateY: merge.interpolate({ inputRange: [0, 1], outputRange: [dy * s, 0] }) },
      { scale: merge.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
    ],
  });
  const smallWord = (sign: 1 | -1) => ({
    opacity: Animated.multiply(appear, merge.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0.92, 0.6, 0] })),
    transform: [
      { translateX: merge.interpolate({ inputRange: [0, 1], outputRange: [sign * SPLIT_X * s, 0] }) },
      { scale: merge.interpolate({ inputRange: [0, 1], outputRange: [0.76, 1] }) },
    ],
  });
  const wordSize = Math.max(28, w * 0.11);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: out, zIndex: 100 }]} accessibilityLabel="Crown is loading">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="sbg" cx="0.5" cy="0.46" r="0.75">
            <Stop offset="0" stopColor="#16202e" /><Stop offset="0.48" stopColor="#0d141f" /><Stop offset="1" stopColor="#070b11" />
          </RadialGradient>
          <RadialGradient id="sglow" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#d4af37" stopOpacity={0.16} /><Stop offset="0.4" stopColor="#c59b27" stopOpacity={0.05} /><Stop offset="1" stopColor="#c59b27" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#sbg)" />
        <Circle cx={width / 2} cy={height * 0.44} r={Math.min(width, height) * 0.45} fill="url(#sglow)" />
      </Svg>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={{ width: w, height: h, transform: [{ scale: pulse }] }}>
          {/* hairline between the two halves before they merge */}
          <Animated.View style={{ position: 'absolute', left: w / 2, top: h * 0.12, width: 1, height: h * 0.76, backgroundColor: 'rgba(229,193,88,.35)', opacity: Animated.multiply(appear, merge.interpolate({ inputRange: [0, 0.4], outputRange: [1, 0], extrapolate: 'clamp' })) }} />
          <Animated.View style={[StyleSheet.absoluteFill, shift(1, -38)]}><GearPiece w={w} h={h} angle={angle} clicked={clicked} /></Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, shift(-1, 32)]}><CrownPiece w={w} h={h} /></Animated.View>
        </Animated.View>

        <View style={{ width: w, height: wordSize * 1.4, alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
          {([-1, 1] as const).map(sign => (
            <Animated.Text key={sign} style={[styles.word, { fontSize: wordSize * 0.8 }, smallWord(sign)]}>CROWN</Animated.Text>
          ))}
          <Animated.Text style={[styles.word, { fontSize: wordSize, opacity: word, transform: [{ scale: word.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }]}>CROWN</Animated.Text>
        </View>
      </View>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(48, height * 0.08), alignItems: 'center' }}>
        <View style={{ width: Math.min(220, width * 0.5), height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,.12)', overflow: 'hidden' }}>
          <Animated.View style={{ height: 2, backgroundColor: '#e5c158', width: bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  word: { position: 'absolute', fontFamily: F.serif, color: '#eceef2', letterSpacing: 8, textAlign: 'center' },
});
