import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { C, F, display } from '../theme';
import { Button, Card, Enter, Icon, Logo, Progress, RoundButton, T, WatchArt } from '../ui';
import { Answers, BRANDS, MODELS, planSlots } from '../data';
import { useStore } from '../store';

// Demo switch between the classic and navy themes.
export function ThemeToggle() {
  const { theme, setTheme } = useStore();
  return <RoundButton icon="contrast" label={theme === 'navy' ? 'Switch to classic theme' : 'Switch to navy theme'} onPress={() => { Haptics.selectionAsync(); setTheme(theme === 'navy' ? 'classic' : 'navy'); }} />;
}

export function TopBar({ step, onBack }: { step: number; onBack?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, height: 44 }}>
      {onBack ? <RoundButton icon="back" onPress={onBack} label="Back" /> : null}
      <Progress step={step} />
    </View>
  );
}

// ---------- 1. Promise ----------
export function Promise_() {
  const { go, reset } = useStore();
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, []);
  const y = float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo onLongPress={reset} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <ThemeToggle />
          <View style={{ width: 90, flexDirection: 'row' }}><Progress step={1} /></View>
        </View>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: C.halo }} />
        <Animated.View style={{ transform: [{ translateY: y }, { rotate: '-8deg' }] }}>
          <WatchArt size={200} />
        </Animated.View>
        <Enter delay={500} style={{ position: 'absolute', left: 22, top: '18%' }}>
          <View style={tag()}>
            <Text style={T.label}>WORTH TODAY</Text>
            <Text style={{ fontFamily: F.serif, ...display(30), lineHeight: 34, color: C.ink }}>$14,750</Text>
            <Text style={{ fontFamily: F.bold, fontSize: 12.5, color: C.up }}>▲ 4.2% · 12 months</Text>
          </View>
        </Enter>
        <Enter delay={900} style={{ position: 'absolute', right: 20, bottom: '14%' }}>
          <View style={[tag(), { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9 }]}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={14} color={C.onPrimary} w={2.4} /></View>
            <Text style={{ fontFamily: F.bold, fontSize: 13, color: C.ink }}>High match · 94%</Text>
          </View>
        </Enter>
      </View>
      <View style={{ paddingHorizontal: 24 }}>
        <Text style={T.h1}>Know what your watch is worth.</Text>
        <Text style={T.sub}>One photo. No account. An honest value range in under a minute.</Text>
      </View>
      <View style={{ padding: 24, paddingBottom: 12 }}>
        <Button title="Get started" onPress={() => go('goal')} />
        <Text style={[T.small, { textAlign: 'center', marginTop: 10, fontSize: 12 }]}>Takes about 60 seconds</Text>
      </View>
    </View>
  );
}
const tag = () => ({ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#15140F', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 }) as const;

// ---------- 2. Goal ----------
const GOALS: { key: NonNullable<Answers['goal']>; icon: string; title: string; sub: string }[] = [
  { key: 'track', icon: 'chart', title: "Track my collection's value", sub: 'See what my watches are worth, week by week' },
  { key: 'sell', icon: 'tag', title: 'Sell at the right moment', sub: 'Get told when prices are high' },
  { key: 'buy', icon: 'bag', title: 'Buy my next watch', sub: 'Know a fair price before I pay' },
];
export function Goal() {
  const { go, answers, setAnswers } = useStore();
  return (
    <View style={{ flex: 1 }}>
      <TopBar step={2} onBack={() => go('promise')} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Text style={T.eyebrow}>Your goal</Text>
        <Text style={[T.h2, { marginTop: 10 }]}>What brings you to Crown?</Text>
        <Text style={[T.sub, { marginBottom: 24 }]}>We'll shape your plan around it.</Text>
        {GOALS.map((g, i) => {
          const sel = answers.goal === g.key;
          return (
            <Enter key={g.key} delay={80 * i}>
              <Pressable onPress={() => { Haptics.selectionAsync(); setAnswers({ goal: g.key }); }} accessibilityRole="radio" accessibilityState={{ selected: sel }}>
                <Card selected={sel} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: sel ? 17 : 18, marginBottom: 12 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: sel ? C.greenSoft : C.paper, alignItems: 'center', justifyContent: 'center' }}><Icon name={g.icon} size={24} color={sel ? C.green : C.ink} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={T.b}>{g.title}</Text>
                    <Text style={[T.small, { fontSize: 13.5 }]}>{g.sub}</Text>
                  </View>
                  <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: sel ? 7 : 2, borderColor: sel ? C.green : C.line }} />
                </Card>
              </Pressable>
            </Enter>
          );
        })}
      </View>
      <View style={{ padding: 24, paddingBottom: 12 }}>
        <Button title="Continue" disabled={!answers.goal} onPress={() => go('about')} />
      </View>
    </View>
  );
}

// ---------- 3. About you ----------
function Seg<T extends string>({ items, value, onChange }: { items: T[]; value: T | null; onChange: (v: T) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
      {items.map(it => {
        const s = it === value;
        return (
          <Pressable key={it} style={{ flex: 1 }} onPress={() => { Haptics.selectionAsync(); onChange(it); }} accessibilityRole="radio" accessibilityState={{ selected: s }}>
            <View style={{ height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: s ? C.green : C.surface, borderWidth: 1, borderColor: s ? C.green : C.line }}>
              <Text style={{ fontFamily: F.semibold, fontSize: 15, color: s ? C.onPrimary : C.ink }}>{it}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
export function About() {
  const { go, answers, setAnswers, toggleBrand } = useStore();
  const toggle = (b: string) => {
    Haptics.selectionAsync();
    toggleBrand(b);
  };
  const done = answers.count && answers.brands.length > 0 && answers.papers;
  return (
    <View style={{ flex: 1 }}>
      <TopBar step={3} onBack={() => go('goal')} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Text style={T.eyebrow}>About your watches</Text>
        <Text style={[T.h2, { marginTop: 10 }]}>Tell us what you own.</Text>
        <Text style={T.sub}>Three quick answers. Each one changes your value.</Text>

        <View style={{ marginTop: 26 }}>
          <Text style={[T.b, { fontSize: 15 }]}>How many watches do you have?</Text>
          <Text style={[T.small, { fontSize: 12.5 }]}>Sets how many your plan tracks</Text>
          <Seg items={['1', '2–3', '4–10', '10+'] as NonNullable<Answers['count']>[]} value={answers.count} onChange={v => setAnswers({ count: v })} />
        </View>

        <View style={{ marginTop: 26 }}>
          <Text style={[T.b, { fontSize: 15 }]}>Which brands?</Text>
          <Text style={[T.small, { fontSize: 12.5 }]}>We load their price history first</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {BRANDS.map(b => {
              const s = answers.brands.includes(b);
              return (
                <Pressable key={b} onPress={() => toggle(b)} accessibilityRole="checkbox" accessibilityState={{ checked: s }}>
                  <View style={{ height: 40, paddingHorizontal: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: s ? C.greenSoft : C.surface, borderWidth: s ? 1.5 : 1, borderColor: s ? C.green : C.line }}>
                    {s ? <Icon name="check" size={14} color={C.green} w={2.4} /> : null}
                    <Text style={{ fontFamily: F.semibold, fontSize: 14.5, color: s ? C.green : C.ink }}>{b}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ marginTop: 26 }}>
          <Text style={[T.b, { fontSize: 15 }]}>Do you keep the box and papers?</Text>
          <Text style={[T.small, { fontSize: 12.5 }]}>A full set adds 5–15% to most values</Text>
          <Seg items={['Yes', 'Some', 'No'] as NonNullable<Answers['papers']>[]} value={answers.papers} onChange={v => setAnswers({ papers: v })} />
        </View>
      </View>
      <View style={{ padding: 24, paddingBottom: 12 }}>
        <Button title="Build my plan" disabled={!done} onPress={() => go('planLoading')} />
      </View>
    </View>
  );
}

// ---------- 4a. Building your plan ----------
const brandList = (b: string[]) => {
  const n = b.filter(x => x !== 'Other');
  if (n.length === 0) return 'your brands';
  if (n.length === 1) return n[0];
  return n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1];
};
const papersLine = (p: Answers['papers']) => (p === 'Yes' ? 'Adding about +6% for a full set' : p === 'Some' ? 'Keeping values as listed for a partial set' : 'Taking about −7% for no box or papers');

export function PlanLoading() {
  const { go, answers } = useStore();
  const [pct, setPct] = useState(0);
  const a = useRef(new Animated.Value(0)).current;
  const refs = MODELS.filter(m => answers.brands.includes(m.brand)).length * 263 + 120;
  useEffect(() => {
    const id = a.addListener(({ value }) => setPct(Math.round(value)));
    Animated.timing(a, { toValue: 100, duration: 2600, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => go('plan'), 250);
    });
    return () => a.removeListener(id);
  }, []);
  const R = 86, CIRC = 2 * Math.PI * R;
  const steps = [
    { t: `Loading ${brandList(answers.brands)} prices`, s: `${refs.toLocaleString('en-US')} references`, at: 30 },
    { t: 'Adjusting for box and papers', s: papersLine(answers.papers), at: 65 },
    { t: `Setting alerts for ${answers.count ?? '1'} watches`, s: 'Alert at ±5%', at: 95 },
  ];
  return (
    <View style={{ flex: 1 }}>
      <TopBar step={4} />
      <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 50 }}>
        <View style={{ width: 200, height: 200 }}>
          <Svg width={200} height={200}>
            <Circle cx={100} cy={100} r={R} stroke={C.line} strokeWidth={10} fill="none" />
            <Circle cx={100} cy={100} r={R} stroke={C.green} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray={`${CIRC}`} strokeDashoffset={CIRC * (1 - pct / 100)} rotation={-90} origin="100, 100" />
          </Svg>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: F.serif, ...display(56), color: C.ink }}>{pct}%</Text>
          </View>
        </View>
        <Text style={[T.h2, { marginTop: 32 }]}>Building your plan…</Text>
        <Card style={{ alignSelf: 'stretch', marginTop: 26 }}>
          {steps.map((st, i) => {
            const done = pct >= st.at, active = !done && (i === 0 || pct >= steps[i - 1].at);
            return (
              <View key={i} style={{ flexDirection: 'row', gap: 14, padding: 16, borderTopWidth: i ? 1 : 0, borderTopColor: C.line, opacity: done || active ? 1 : 0.45 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: done ? C.green : C.paper, alignItems: 'center', justifyContent: 'center' }}>
                  {done ? <Icon name="check" size={18} color={C.onPrimary} w={2.4} /> : <Spinner />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[T.b, { fontSize: 15 }]}>{st.t}</Text>
                  <Text style={T.small}>{st.s}</Text>
                </View>
              </View>
            );
          })}
        </Card>
      </View>
    </View>
  );
}
export function Spinner({ color = C.green, size = 16 }: { color?: string; size?: number }) {
  const r = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(r, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true })).start();
  }, []);
  return <Animated.View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2.5, borderColor: color, borderRightColor: 'transparent', transform: [{ rotate: r.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }} />;
}

// ---------- 4b. Your plan ----------
export function Plan() {
  const { go, answers } = useStore();
  const slots = planSlots(answers.count);
  const goalTitle = answers.goal === 'sell' ? 'Know the right moment to sell.' : answers.goal === 'buy' ? 'Pay a fair price, every time.' : 'Your collection, watched for you.';
  const rows = [
    { icon: 'watch', t: `Track up to ${slots} watch${slots > 1 ? 'es' : ''}`, s: `${brandList(answers.brands)} price history loaded` },
    answers.goal === 'buy'
      ? { icon: 'search', t: 'Fair-price check on any listing', s: 'Scan a watch in a shop window or online' }
      : { icon: 'cal', t: 'Value check every Sunday', s: 'Your collection total, in one number' },
    answers.goal === 'sell'
      ? { icon: 'bell', t: 'Sell alert when a watch is up 5%', s: 'We tell you when the market is with you' }
      : { icon: 'bell', t: 'Alert if a watch moves ±5%', s: 'So a drop never surprises you' },
    { icon: 'box', t: `Adjusted for ${answers.papers === 'Yes' ? 'a full set' : answers.papers === 'Some' ? '"some" box and papers' : 'no box or papers'}`, s: 'Ranges you can actually sell at' },
  ];
  return (
    <View style={{ flex: 1 }}>
      <TopBar step={4} onBack={() => go('about')} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Text style={T.eyebrow}>Your plan</Text>
        <Text style={[T.h2, { marginTop: 10 }]}>{goalTitle}</Text>
        <Text style={[T.sub, { marginBottom: 20 }]}>Built from your answers. You can change it any time.</Text>
        <Card>
          {rows.map((r, i) => (
            <Enter key={i} delay={120 * i}>
              <View style={{ flexDirection: 'row', gap: 14, padding: 16, borderTopWidth: i ? 1 : 0, borderTopColor: C.line }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name={r.icon} size={20} color={C.green} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={[T.b, { fontSize: 15.5 }]}>{r.t}</Text>
                  <Text style={T.small}>{r.s}</Text>
                </View>
              </View>
            </Enter>
          ))}
        </Card>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, paddingHorizontal: 4 }}>
          <Icon name="info" size={18} color={C.stone} />
          <Text style={[T.small, { flex: 1, fontSize: 12.5 }]}>Values come from 12 months of listed prices, not one shop's asking price. Demo data in this prototype.</Text>
        </View>
      </View>
      <View style={{ padding: 24, paddingBottom: 12 }}>
        <Button title="Scan my first watch" icon="scan" onPress={() => go('priming')} />
      </View>
    </View>
  );
}
