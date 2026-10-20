import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { C, F, display, money, pct } from '../theme';
import { Button, Card, CountUp, Enter, Icon, LineChart, Logo, Pill, RoundButton, T, WatchArt } from '../ui';
import { byId, change12, papersFactor, planSlots, valueOf } from '../data';
import { useStore } from '../store';
import { ThemeToggle } from './Onboarding';

const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// ---------- 8. Paywall ----------
export function Paywall() {
  const { go, answers, setPro } = useStore();
  const [plan, setPlan] = useState<'year' | 'week'>('year');
  const now = new Date();
  const remind = new Date(now.getTime() + 5 * 864e5), charge = new Date(now.getTime() + 7 * 864e5);
  const headline = answers.goal === 'sell' ? 'Know the right moment to sell.' : answers.goal === 'buy' ? 'Never overpay for a watch again.' : "See your collection's value, every week.";
  const perks = [
    'Unlimited watches in your collection',
    answers.goal === 'sell' ? 'Sell alerts when a watch is up 5%' : 'Alerts when a watch moves ±5%',
    'Full 5-year price history',
    'Insurance-ready value report (PDF)',
  ];
  const Plan = ({ id, title, sub, price, unit, best }: { id: 'year' | 'week'; title: string; sub: string; price: string; unit: string; best?: boolean }) => {
    const s = plan === id;
    return (
      <Pressable onPress={() => { Haptics.selectionAsync(); setPlan(id); }} accessibilityRole="radio" accessibilityState={{ selected: s }}>
        <Card selected={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: s ? 15 : 16, marginTop: best ? 20 : 10 }}>
          <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: s ? 7 : 2, borderColor: s ? C.green : C.line }} />
          <View style={{ flex: 1 }}>
            <Text style={T.b}>{title}</Text>
            <Text style={[T.small, { fontSize: 12.5 }]}>{sub}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={T.b}>{price}</Text>
            <Text style={[T.small, { fontSize: 12 }]}>{unit}</Text>
          </View>
          {best ? <View style={{ position: 'absolute', top: -13, right: 14, backgroundColor: C.brass, borderRadius: 12, height: 24, paddingHorizontal: 10, justifyContent: 'center' }}><Text style={{ fontFamily: F.bold, fontSize: 11.5, color: C.ink }}>Best value</Text></View> : null}
        </Card>
      </Pressable>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: 44 }}>
        <RoundButton icon="close" onPress={() => go('home')} label="Close, continue free" />
        <Text style={[T.small, { fontFamily: F.semibold }]}>Free plan: 1 watch</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 10 }} showsVerticalScrollIndicator={false}>
        <Text style={[T.eyebrow, { color: C.brassInk }]}>Crown Pro</Text>
        <Text style={[T.h2, { marginTop: 8 }]}>{headline}</Text>
        <View style={{ gap: 11, marginTop: 18 }}>
          {perks.map(p => (
            <View key={p} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={15} color={C.green} w={2.4} /></View>
              <Text style={[T.body, { fontFamily: F.semibold }]}>{p}</Text>
            </View>
          ))}
        </View>
        {plan === 'year' ? (
          <View style={{ flexDirection: 'row', marginTop: 22 }}>
            <View style={{ position: 'absolute', left: 12, right: 12, top: 11, height: 2, backgroundColor: C.line }} />
            {[
              { d: 'Today', t: 'Full access', c: C.green, i: 'lock', a: 'flex-start' },
              { d: fmtDate(remind), t: 'Reminder sent', c: C.brass, i: 'bell', a: 'center' },
              { d: fmtDate(charge), t: 'Trial ends, $39.99', c: C.stone, i: 'cal', a: 'flex-end' },
            ].map(x => (
              <View key={x.d} style={{ flex: 1, alignItems: x.a as 'center' }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: x.c, alignItems: 'center', justifyContent: 'center' }}><Icon name={x.i} size={13} color={C.onPrimary} /></View>
                <Text style={{ fontFamily: F.bold, fontSize: 12.5, color: C.ink, marginTop: 6 }}>{x.d}</Text>
                <Text style={[T.small, { fontSize: 11.5 }]}>{x.t}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <Plan id="year" title="Yearly" sub="7-day free trial, then $39.99/year" price="$0.77" unit="per week" best />
        <Plan id="week" title="Weekly" sub="No trial, billed weekly" price="$4.99" unit="per week" />
      </ScrollView>
      <View style={{ padding: 24, paddingTop: 12, paddingBottom: 12 }}>
        <Button title={plan === 'year' ? 'Start my 7-day free trial' : 'Subscribe for $4.99/week'} onPress={() => { setPro(true); go('proWelcome'); }} />
        <Text style={[T.small, { fontSize: 12, textAlign: 'center', marginTop: 10 }]}>
          {plan === 'year' ? `No charge today. Cancel anytime in Settings before ${fmtDate(charge)}.` : 'Cancel anytime in Settings.'}{'\n'}Demo prototype, no real payment.
        </Text>
      </View>
    </View>
  );
}

export function ProWelcome() {
  const { go } = useStore();
  return (
    <View style={{ flex: 1, backgroundColor: C.green, padding: 24, justifyContent: 'space-between' }}>
      <View />
      <Enter style={{ alignItems: 'center' }}>
        <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(243,239,230,.12)', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={44} color={C.brass} w={2.4} /></View>
        <Text style={[T.h1, { color: C.onPrimary, textAlign: 'center', marginTop: 28 }]}>Welcome to Pro.</Text>
        <Text style={[T.sub, { color: C.onPrimarySoft, textAlign: 'center' }]}>Your alerts are on and your full price history is unlocked.</Text>
        <View style={{ marginTop: 18, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(243,239,230,.12)' }}>
          <Text style={{ fontFamily: F.semibold, fontSize: 12.5, color: C.onPrimarySoft }}>Demo: no payment was taken</Text>
        </View>
      </Enter>
      <Button title="Go to my collection" kind="light" onPress={() => go('home')} />
    </View>
  );
}

// ---------- 9. Home ----------
export function TabBar({ active }: { active: 'home' | 'alerts' }) {
  const { go } = useStore();
  const Tab = ({ id, icon, label }: { id: 'home' | 'alerts'; icon: string; label: string }) => (
    <Pressable onPress={() => { Haptics.selectionAsync(); go(id); }} style={{ alignItems: 'center', gap: 4, width: 80 }} accessibilityRole="tab" accessibilityState={{ selected: active === id }}>
      <Icon name={icon} size={24} color={active === id ? C.green : C.stone} />
      <Text style={{ fontFamily: F.semibold, fontSize: 11, color: active === id ? C.green : C.stone }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingTop: 10, paddingBottom: 6, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.paper }}>
      <Tab id="home" icon="watch" label="Collection" />
      <Pressable onPress={() => go('priming')} style={{ alignItems: 'center', gap: 4, width: 80 }} accessibilityRole="button" accessibilityLabel="Scan a watch">
        <View style={{ width: 54, height: 54, marginTop: -24, borderRadius: 27, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', shadowColor: C.green, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } }}><Icon name="scan" size={24} color={C.onPrimary} /></View>
        <Text style={{ fontFamily: F.semibold, fontSize: 11, color: C.stone }}>Scan</Text>
      </Pressable>
      <Tab id="alerts" icon="bell" label="Alerts" />
    </View>
  );
}

const RANGES = { '1M': 2, '6M': 7, '1Y': 13 } as const;

export function Home() {
  const { go, collection, answers, pro, reset, removeWatch, restoreWatch } = useStore();
  const { width } = useWindowDimensions();
  const [editing, setEditing] = useState(false);
  const [undo, setUndo] = useState<{ owned: (typeof collection)[number]; index: number; name: string } | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (undoTimer.current) clearTimeout(undoTimer.current); }, []);
  const remove = (i: number) => {
    const owned = collection[i], m = byId(owned.modelId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeWatch(owned.modelId);
    if (collection.length === 1) setEditing(false);
    setUndo({ owned, index: i, name: `${m.brand} ${m.name}` });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 5000);
  };
  const [range, setRange] = useState<'1M' | '6M' | '1Y' | '5Y'>('1Y');
  const models = collection.map(o => byId(o.modelId));
  const slots = pro ? Infinity : 1;
  const series = Array.from({ length: 13 }, (_, i) => models.reduce((s, m) => s + m.history[i] * papersFactor(answers.papers), 0));
  const total = series[12];
  const n = RANGES[range === '5Y' ? '1Y' : range];
  const shown = series.slice(13 - n);
  const delta = total - shown[0];
  const dpct = shown[0] ? (delta / shown[0]) * 100 : 0;
  const canAdd = models.length < slots;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: 44 }}>
        <Logo onLongPress={reset} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <ThemeToggle />
        {pro ? <Pill text="Pro" bg={C.brassSoft} fg={C.brassInk} /> : <Pressable onPress={() => go('paywall')}><Pill text="Try Pro" bg={C.greenSoft} fg={C.green} /></Pressable>}
        </View>
      </View>
      {models.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{ opacity: 0.35 }}><WatchArt size={110} strap={false} /></View>
          <Text style={[T.h2, { textAlign: 'center', marginTop: 20 }]}>Your collection is empty.</Text>
          <Text style={[T.sub, { textAlign: 'center' }]}>Scan your first watch to see what it is worth today.</Text>
          <Button title="Scan a watch" icon="scan" onPress={() => go('priming')} style={{ marginTop: 24, paddingHorizontal: 28 }} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 18, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <Text style={T.label}>YOUR COLLECTION</Text>
          <CountUp to={total} style={{ fontFamily: F.serif, ...display(52), lineHeight: 58, color: C.ink }} />
          <Text style={{ fontFamily: F.bold, fontSize: 14, color: delta >= 0 ? C.up : C.down }}>
            {delta >= 0 ? '▲ ' : '▼ '}{money(Math.abs(delta))} ({Math.abs(dpct).toFixed(1)}%) <Text style={{ fontFamily: F.medium, color: C.stone }}>past {range === '1M' ? 'month' : range === '6M' ? '6 months' : range === '5Y' ? '12 months (demo data covers 1 year)' : '12 months'}</Text>
          </Text>
          <View style={{ marginTop: 18, marginBottom: 8 }}>
            <LineChart data={shown} width={width - 48} height={110} color={C.green} />
          </View>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
            {(['1M', '6M', '1Y', '5Y'] as const).map(t => {
              const locked = t === '5Y' && !pro;
              return (
                <Pressable key={t} style={{ flex: 1 }} onPress={() => { Haptics.selectionAsync(); if (locked) go('paywall'); else setRange(t); }}>
                  <View style={{ height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4, backgroundColor: range === t ? C.ink : 'transparent' }}>
                    {locked ? <Icon name="lock" size={12} color={C.stone} /> : null}
                    <Text style={{ fontFamily: F.bold, fontSize: 13, color: range === t ? C.paper : C.stone }}>{t}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 24 }}>
            <Text style={[T.b, { fontSize: 17 }]}>Watches</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 14 }}>
              <Text style={T.small}>{pro ? `${models.length} of ${planSlots(answers.count)} in your plan` : `${models.length} of 1 on the free plan`}</Text>
              <Pressable onPress={() => { Haptics.selectionAsync(); setEditing(e => !e); }} hitSlop={10} accessibilityRole="button">
                <Text style={{ fontFamily: F.bold, fontSize: 14, color: C.green }}>{editing ? 'Done' : 'Edit'}</Text>
              </Pressable>
            </View>
          </View>
          {models.map((m, i) => {
            const v = valueOf(m, answers.papers), ch = change12(m);
            return (
              <Enter key={m.id} delay={60 * i}>
                <Card style={{ marginTop: 12, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' }}><WatchArt size={46} strap={false} dial={m.dial} dialHi={m.dialHi} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[T.b, { fontSize: 15 }]} numberOfLines={1}>{m.brand} {m.name}</Text>
                    <Text style={[T.small, { fontSize: 12.5 }]}>{m.ref}</Text>
                  </View>
                  {editing ? (
                    <Pressable onPress={() => remove(i)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Remove ${m.brand} ${m.name}`}
                      style={{ height: 40, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.downSoft, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Icon name="trash" size={18} color={C.down} />
                      <Text style={{ fontFamily: F.bold, fontSize: 13, color: C.down }}>Remove</Text>
                    </Pressable>
                  ) : (
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontFamily: F.serif, ...display(20), color: C.ink }}>{money(v.mid)}</Text>
                      <Text style={{ fontFamily: F.bold, fontSize: 12, color: ch >= 0 ? C.up : C.down }}>{pct(ch)}</Text>
                    </View>
                  )}
                </Card>
              </Enter>
            );
          })}
          <Pressable onPress={() => go(canAdd ? 'priming' : 'paywall')}>
            <View style={{ marginTop: 10, height: 64, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.dash, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Icon name={canAdd ? 'plus' : 'lock'} size={18} color={C.green} w={2.2} />
              <Text style={{ fontFamily: F.bold, fontSize: 15, color: C.green }}>{canAdd ? 'Add a watch' : 'Add more watches with Pro'}</Text>
            </View>
          </Pressable>
          <Text style={[T.small, { fontSize: 11.5, textAlign: 'center', marginTop: 18 }]}>Values are demo data for this prototype.</Text>
        </ScrollView>
      )}
      {undo ? (
        <Enter style={{ position: 'absolute', left: 16, right: 16, bottom: 96 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.ink, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16 }}>
            <Text style={{ flex: 1, fontFamily: F.semibold, fontSize: 14, color: C.paper }} numberOfLines={1}>Removed {undo.name}</Text>
            <Pressable onPress={() => { Haptics.selectionAsync(); restoreWatch(undo.owned, undo.index); setUndo(null); }} hitSlop={10} accessibilityRole="button">
              <Text style={{ fontFamily: F.bold, fontSize: 14, color: C.brass }}>Undo</Text>
            </Pressable>
          </View>
        </Enter>
      ) : null}
      <TabBar active="home" />
    </View>
  );
}

// ---------- Alerts ----------
export function Alerts() {
  const { collection, answers, pro, go } = useStore();
  const models = collection.map(o => byId(o.modelId));
  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 24, height: 44, justifyContent: 'center' }}><Text style={{ fontFamily: F.bold, fontSize: 16, color: C.ink }}>Alerts</Text></View>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={T.h2}>{models.length ? 'Quiet week.' : 'Nothing to watch yet.'}</Text>
        <Text style={T.sub}>{models.length ? `No watch has moved more than 5% since you added it. We check every Sunday.` : 'Add a watch and we will tell you when its value moves.'}</Text>
        {models.map(m => (
          <Card key={m.id} style={{ marginTop: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icon name="bell" size={20} color={pro ? C.green : C.stone} />
            <View style={{ flex: 1 }}>
              <Text style={[T.b, { fontSize: 15 }]}>{m.brand} {m.name}</Text>
              <Text style={T.small}>{answers.goal === 'sell' ? 'Tell me when it is up 5%' : 'Tell me if it moves ±5%'}</Text>
            </View>
            <Text style={{ fontFamily: F.bold, fontSize: 12.5, color: pro ? C.up : C.stone }}>{pro ? 'On' : 'Pro'}</Text>
          </Card>
        ))}
        {!pro && models.length ? <Button title="Turn on alerts with Pro" onPress={() => go('paywall')} style={{ marginTop: 20 }} /> : null}
      </ScrollView>
      <TabBar active="alerts" />
    </View>
  );
}
