import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { C, F, display, money, num } from '../theme';
import { BottomCTA, Button, Card, Enter, Icon, LineChart, Logo, Pill, Progress, RoundButton, T, WatchArt, WatchThumb } from '../ui';
import { Answers, BRANDS, MODELS, planSlots } from '../data';
import { useStore } from '../store';
import { t } from '../i18n';

// Demo switch between the classic and navy themes.
export function ThemeToggle() {
  const { theme, setTheme } = useStore();
  return <RoundButton icon="contrast" label={theme === 'navy' ? t('Switch to classic theme') : t('Switch to navy theme')} onPress={() => { Haptics.selectionAsync(); setTheme(theme === 'navy' ? 'classic' : 'navy'); }} />;
}

export function TopBar({ step, onBack }: { step: number; onBack?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, height: 44 }}>
      {onBack ? <RoundButton icon="back" onPress={onBack} label={t("Back")} /> : null}
      <Progress step={step} />
    </View>
  );
}

// ---------- 1. Intro: three slides that show how Crown works ----------
const SLIDES = [
  { title: 'Know what your watch is worth.', sub: 'One photo of the dial. Crown finds the exact reference in seconds.' },
  { title: 'An honest range, not a guess.', sub: '12 months of listed prices, adjusted for box and papers. Unsure? We ask before we show a price.' },
  { title: 'Your collection, watched for you.', sub: 'See your total every week, and get told when a watch moves.' },
];

function SlideScan({ y }: { y: Animated.AnimatedInterpolation<number> }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: C.halo }} />
      <Animated.View style={{ transform: [{ translateY: y }, { rotate: '-8deg' }] }}>
        <WatchArt size={170} />
      </Animated.View>
      <View style={{ position: 'absolute', width: 220, height: 220, borderRadius: 30, borderWidth: 2, borderColor: C.brass, borderStyle: 'dashed', opacity: 0.8 }} />
      <Enter delay={500} style={{ position: 'absolute', right: 20, bottom: '12%' }}>
        <View style={[tag(), { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9 }]}>
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={14} color={C.onPrimary} w={2.4} /></View>
          <Text style={{ fontFamily: F.bold, fontSize: 13, color: C.ink }}>{t("Rolex 126610LN · 94%")}</Text>
        </View>
      </Enter>
    </View>
  );
}

function SlideValue({ width }: { width: number }) {
  const data = [14150, 14260, 14090, 14300, 14200, 14330, 14220, 14390, 14280, 14450, 14400, 14560, 14750];
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: C.halo }} />
      <View style={[tag(), { width: Math.min(width - 64, 300), padding: 18 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={T.label}>{t("WORTH TODAY")}</Text>
            <Text style={{ fontFamily: F.serif, ...display(28), lineHeight: 34, color: C.ink }}>{money(13900)}–{num(15600)}</Text>
            <Text style={[T.small, { fontSize: 12 }]}>{t("Full box and papers")}</Text>
          </View>
          <Pill text="▲ 4.2%" bg={C.upSoft} fg={C.up} />
        </View>
        <View style={{ marginTop: 12 }}><LineChart data={data} width={Math.min(width - 64, 300) - 36} height={64} color={C.up} /></View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
          <Text style={[T.small, { fontSize: 11 }]}>{t("12 months ago")}</Text>
          <Text style={[T.small, { fontSize: 11 }]}>{t("Today")}</Text>
        </View>
      </View>
      <Enter delay={400} style={{ position: 'absolute', left: 22, top: '10%' }}>
        <View style={[tag(), { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9 }]}>
          <Icon name="box" size={16} color={C.brassInk} />
          <Text style={{ fontFamily: F.bold, fontSize: 12.5, color: C.ink }}>{t("Box & papers +6%")}</Text>
        </View>
      </Enter>
      <Enter delay={700} style={{ position: 'absolute', right: 22, bottom: '10%' }}>
        <View style={[tag(), { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9 }]}>
          <Icon name="chart" size={16} color={C.green} />
          <Text style={{ fontFamily: F.bold, fontSize: 12.5, color: C.ink }}>{t("1,840 listings checked")}</Text>
        </View>
      </Enter>
    </View>
  );
}

function SlideCollection({ width }: { width: number }) {
  const rows = [
    { b: 'Rolex', n: 'Submariner Date', v: 15650, c: '▲ 4.2%' },
    { b: 'Omega', n: 'Speedmaster', v: 6680, c: '▲ 4.1%' },
    { b: 'Cartier', n: 'Santos', v: 7470, c: '▲ 2.2%' },
  ];
  const w = Math.min(width - 64, 300);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: C.halo }} />
      <View style={[tag(), { width: w, padding: 16 }]}>
        <Text style={T.label}>{t("YOUR COLLECTION")}</Text>
        <Text style={{ fontFamily: F.serif, ...display(34), lineHeight: 40, color: C.ink }}>{money(29800)}</Text>
        {rows.map(r => (
          <View key={r.b} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <WatchThumb brand={r.b} size={34} radius={10} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.bold, fontSize: 13, color: C.ink }} numberOfLines={1}>{r.b} {r.n}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontFamily: F.bold, fontSize: 13, color: C.ink }}>{money(r.v)}</Text>
              <Text style={{ fontFamily: F.bold, fontSize: 11, color: C.up }}>{r.c}</Text>
            </View>
          </View>
        ))}
      </View>
      <Enter delay={500} style={{ position: 'absolute', left: 18, top: '9%' }}>
        <View style={[tag(), { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9 }]}>
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.brass, alignItems: 'center', justifyContent: 'center' }}><Icon name="bell" size={13} color="#FFFFFF" w={2} /></View>
          <Text style={{ fontFamily: F.bold, fontSize: 12.5, color: C.ink }}>{t("Submariner is up 5%")}</Text>
        </View>
      </Enter>
    </View>
  );
}

export function Promise_() {
  const { go, reset } = useStore();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const sv = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, []);
  const y = float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const to = (i: number) => { setPage(i); sv.current?.scrollTo({ x: i * width, animated: true }); };
  const next = () => (page < SLIDES.length - 1 ? to(page + 1) : go('goal'));
  const last = page === SLIDES.length - 1;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo onLongPress={reset} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <ThemeToggle />
          {!last ? <Pressable onPress={() => go('goal')} hitSlop={10} accessibilityRole="button"><Text style={{ fontFamily: F.semibold, fontSize: 14, color: C.stone }}>{t("Skip")}</Text></Pressable> : null}
        </View>
      </View>
      <ScrollView
        ref={sv}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        onScroll={e => { const p = Math.round(e.nativeEvent.contentOffset.x / width); if (p !== page) setPage(p); }}
        scrollEventThrottle={64}
        style={{ flex: 1 }}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={{ width, flex: 1 }}>
            {i === 0 ? <SlideScan y={y} /> : i === 1 ? <SlideValue width={width} /> : <SlideCollection width={width} />}
            <View style={{ paddingHorizontal: 24, minHeight: 150 }}>
              <Text style={T.h1}>{t(s.title)}</Text>
              <Text style={T.sub}>{t(s.sub)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 10 }} accessibilityLabel={t('Slide {a} of {b}', { a: page + 1, b: SLIDES.length })}>
        {SLIDES.map((_, i) => (
          <Pressable key={i} onPress={() => to(i)} hitSlop={6}>
            <View style={{ width: i === page ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: i === page ? C.green : C.line }} />
          </Pressable>
        ))}
      </View>
      <BottomCTA note={t("Takes about 60 seconds")}>
        <Button title={last ? t('Get started') : t('Continue')} onPress={next} />
      </BottomCTA>
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
        <Text style={T.eyebrow}>{t("Your goal")}</Text>
        <Text style={[T.h2, { marginTop: 10 }]}>{t("What brings you to Crown?")}</Text>
        <Text style={[T.sub, { marginBottom: 24 }]}>{t("We'll shape your plan around it.")}</Text>
        {GOALS.map((g, i) => {
          const sel = answers.goal === g.key;
          return (
            <Enter key={g.key} delay={80 * i}>
              <Pressable onPress={() => { Haptics.selectionAsync(); setAnswers({ goal: g.key }); }} accessibilityRole="radio" accessibilityState={{ selected: sel }}>
                <Card selected={sel} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: sel ? 17 : 18, marginBottom: 12 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: sel ? C.greenSoft : C.paper, alignItems: 'center', justifyContent: 'center' }}><Icon name={g.icon} size={24} color={sel ? C.green : C.ink} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={T.b}>{t(g.title)}</Text>
                    <Text style={[T.small, { fontSize: 13.5 }]}>{t(g.sub)}</Text>
                  </View>
                  <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: sel ? 7 : 2, borderColor: sel ? C.green : C.line }} />
                </Card>
              </Pressable>
            </Enter>
          );
        })}
      </View>
      <BottomCTA>
        <Button title={t("Continue")} disabled={!answers.goal} onPress={() => go('about')} />
      </BottomCTA>
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
              <Text style={{ fontFamily: F.semibold, fontSize: 15, color: s ? C.onPrimary : C.ink }}>{t(it)}</Text>
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
        <Text style={T.eyebrow}>{t("About your watches")}</Text>
        <Text style={[T.h2, { marginTop: 10 }]}>{t("Tell us what you own.")}</Text>
        <Text style={T.sub}>{t("Three quick answers. Each one changes your value.")}</Text>

        <View style={{ marginTop: 26 }}>
          <Text style={[T.b, { fontSize: 15 }]}>{t("How many watches do you have?")}</Text>
          <Text style={[T.small, { fontSize: 12.5 }]}>{t("Sets how many your plan tracks")}</Text>
          <Seg items={['1', '2–3', '4–10', '10+'] as NonNullable<Answers['count']>[]} value={answers.count} onChange={v => setAnswers({ count: v })} />
        </View>

        <View style={{ marginTop: 26 }}>
          <Text style={[T.b, { fontSize: 15 }]}>{t("Which brands?")}</Text>
          <Text style={[T.small, { fontSize: 12.5 }]}>{t("We load their price history first")}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {BRANDS.map(b => {
              const s = answers.brands.includes(b);
              return (
                <Pressable key={b} onPress={() => toggle(b)} accessibilityRole="checkbox" accessibilityState={{ checked: s }}>
                  <View style={{ height: 40, paddingHorizontal: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: s ? C.greenSoft : C.surface, borderWidth: s ? 1.5 : 1, borderColor: s ? C.green : C.line }}>
                    {s ? <Icon name="check" size={14} color={C.green} w={2.4} /> : null}
                    <Text style={{ fontFamily: F.semibold, fontSize: 14.5, color: s ? C.green : C.ink }}>{t(b)}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ marginTop: 26 }}>
          <Text style={[T.b, { fontSize: 15 }]}>{t("Do you keep the box and papers?")}</Text>
          <Text style={[T.small, { fontSize: 12.5 }]}>{t("A full set adds 5–15% to most values")}</Text>
          <Seg items={['Yes', 'Some', 'No'] as NonNullable<Answers['papers']>[]} value={answers.papers} onChange={v => setAnswers({ papers: v })} />
        </View>
      </View>
      <BottomCTA>
        <Button title={t("Build my plan")} disabled={!done} onPress={() => go('planLoading')} />
      </BottomCTA>
    </View>
  );
}

// ---------- 4a. Building your plan ----------
const brandList = (b: string[]) => {
  const n = b.filter(x => x !== 'Other');
  if (n.length === 0) return t('your brands');
  if (n.length === 1) return n[0];
  return n.slice(0, -1).join(', ') + ' ' + t('and') + ' ' + n[n.length - 1];
};
const papersLine = (p: Answers['papers']) => (p === 'Yes' ? t('Adding about +6% for a full set') : p === 'Some' ? t('Keeping values as listed for a partial set') : t('Taking about −7% for no box or papers'));

export function PlanLoading() {
  const { go, answers } = useStore();
  const [pct, setPct] = useState(0);
  const a = useRef(new Animated.Value(0)).current;
  const refs = MODELS.filter(m => answers.brands.includes(m.brand)).length * 263 + 120;
  useEffect(() => {
    const id = a.addListener(({ value }) => setPct(Math.round(value)));
    Animated.timing(a, { toValue: 100, duration: 5200, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => go('plan'), 250);
    });
    return () => a.removeListener(id);
  }, []);
  const R = 86, CIRC = 2 * Math.PI * R;
  const steps = [
    { t: t('Loading {brands} prices', { brands: brandList(answers.brands) }), s: t('{n} references', { n: refs.toLocaleString('en-US') }), at: 30 },
    { t: t('Adjusting for box and papers'), s: papersLine(answers.papers), at: 65 },
    { t: t('Setting alerts for {n} watches', { n: answers.count ?? '1' }), s: t('Alert at ±5%'), at: 95 },
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
        <Text style={[T.h2, { marginTop: 32 }]}>{t("Building your plan…")}</Text>
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
  const goalTitle = answers.goal === 'sell' ? t('Know the right moment to sell.') : answers.goal === 'buy' ? t('Pay a fair price, every time.') : t('Your collection, watched for you.');
  const rows = [
    { icon: 'watch', t: slots > 1 ? t('Track up to {n} watches', { n: slots }) : t('Track 1 watch'), s: t('{brands} price history loaded', { brands: brandList(answers.brands) }) },
    answers.goal === 'buy'
      ? { icon: 'search', t: t('Fair-price check on any listing'), s: t('Scan a watch in a shop window or online') }
      : { icon: 'cal', t: t('Value check every Sunday'), s: t('Your collection total, in one number') },
    answers.goal === 'sell'
      ? { icon: 'bell', t: t('Sell alert when a watch is up 5%'), s: t('We tell you when the market is with you') }
      : { icon: 'bell', t: t('Alert if a watch moves ±5%'), s: t('So a drop never surprises you') },
    { icon: 'box', t: answers.papers === 'Yes' ? t('Adjusted for a full set') : answers.papers === 'Some' ? t('Adjusted for some box and papers') : t('Adjusted for no box or papers'), s: t('Ranges you can actually sell at') },
  ];
  return (
    <View style={{ flex: 1 }}>
      <TopBar step={4} onBack={() => go('about')} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Text style={T.eyebrow}>{t("Your plan")}</Text>
        <Text style={[T.h2, { marginTop: 10 }]}>{goalTitle}</Text>
        <Text style={[T.sub, { marginBottom: 20 }]}>{t("Built from your answers. You can change it any time.")}</Text>
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
          <Text style={[T.small, { flex: 1, fontSize: 12.5 }]}>{t("Values come from 12 months of listed prices, not one shop's asking price. Demo data in this prototype.")}</Text>
        </View>
      </View>
      <BottomCTA>
        <Button title={t("Scan my first watch")} icon="scan" onPress={() => go('priming')} />
      </BottomCTA>
    </View>
  );
}
