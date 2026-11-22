import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { C, F, display, money, pct } from '../theme';
import { BottomCTA, Button, Card, CountUp, Enter, Icon, LineChart, Logo, Pill, RoundButton, T, WatchArt, WatchThumb } from '../ui';
import { AWARDS, unlocked } from '../awards';
import { GuideCarousel } from './Guide';
import { byId, change12, conditionFactor, ownedValue, papersFactor, planSlots, serviceDue, valueOf } from '../data';
import { useStore } from '../store';

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
      <BottomCTA note={`${plan === 'year' ? `No charge today. Cancel anytime before ${fmtDate(charge)}.` : 'Cancel anytime in Settings.'}\nDemo prototype, no real payment.`}>
        <Button title={plan === 'year' ? 'Start my 7-day free trial' : 'Subscribe for $4.99/week'} onPress={() => { setPro(true); go('proWelcome'); }} />
      </BottomCTA>
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
type Tab = 'home' | 'awards' | 'alerts' | 'settings';
export function TabBar({ active }: { active: Tab }) {
  const { go } = useStore();
  const TabItem = ({ id, icon, label }: { id: Tab; icon: string; label: string }) => (
    <Pressable onPress={() => { Haptics.selectionAsync(); go(id); }} style={{ alignItems: 'center', gap: 4, flex: 1 }} accessibilityRole="tab" accessibilityState={{ selected: active === id }}>
      <Icon name={icon} size={23} color={active === id ? C.green : C.stone} />
      <Text style={{ fontFamily: F.semibold, fontSize: 11, color: active === id ? C.green : C.stone }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingTop: 10, paddingBottom: 6, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.paper }}>
      <TabItem id="home" icon="watch" label="Collection" />
      <TabItem id="awards" icon="medal" label="Awards" />
      <Pressable onPress={() => go('priming')} style={{ alignItems: 'center', gap: 4, flex: 1 }} accessibilityRole="button" accessibilityLabel="Scan a watch">
        <View style={{ width: 54, height: 54, marginTop: -24, borderRadius: 27, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', shadowColor: C.green, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } }}><Icon name="scan" size={24} color={C.onPrimary} /></View>
        <Text style={{ fontFamily: F.semibold, fontSize: 11, color: C.stone }}>Scan</Text>
      </Pressable>
      <TabItem id="alerts" icon="bell" label="Alerts" />
      <TabItem id="settings" icon="sliders" label="Settings" />
    </View>
  );
}

const RANGES = { '1M': 2, '6M': 7, '1Y': 13 } as const;

export function Home() {
  const { go, collection, answers, pro, reset, removeWatch, restoreWatch, openWatch, scanCount, shared, seenAwards, readGuides, bestStreak, wishes, streak, streakBonus, clearStreakBonus, showStreak } = useStore();
  const fresh = unlocked({ scans: scanCount, collection, papers: answers.papers, shared, read: readGuides.length, streak: bestStreak, wishes: wishes.length }).filter(id => !seenAwards.includes(id));
  const freshAward = fresh.length ? AWARDS.find(x => x.id === fresh[fresh.length - 1]) : undefined;
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
  const series = Array.from({ length: 13 }, (_, i) => collection.reduce((s, o) => s + byId(o.modelId).history[i] * papersFactor(o.papers ?? answers.papers) * conditionFactor(o.condition), 0));
  const paidOnes = collection.filter(o => o.paid);
  const paidTotal = paidOnes.reduce((s, o) => s + (o.paid ?? 0), 0);
  const paidNow = paidOnes.reduce((s, o) => s + ownedValue(o, answers.papers).mid, 0);
  const gain = paidNow - paidTotal;
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
        {streak > 1 ? (
          <Pressable onPress={() => { Haptics.selectionAsync(); showStreak(); }} accessibilityRole="button" accessibilityLabel={`${streak}-day streak`}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 28, paddingHorizontal: 10, borderRadius: 14, backgroundColor: C.downSoft }}>
              <Icon name="flame" size={14} color={C.down} w={2} />
              <Text style={{ fontFamily: F.bold, fontSize: 12.5, color: C.down }}>{streak}</Text>
            </View>
          </Pressable>
        ) : null}
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
          {freshAward ? (
            <Pressable onPress={() => go('awards')} accessibilityRole="button">
              <Enter style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingRight: 14, borderRadius: 16, backgroundColor: C.brassSoft }}>
                  <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.brass, alignItems: 'center', justifyContent: 'center' }}><Icon name={freshAward.icon} size={19} color="#FFFFFF" w={2} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: F.bold, fontSize: 11.5, letterSpacing: 1, color: C.brassInk }}>{fresh.length > 1 ? `${fresh.length} NEW AWARDS` : 'NEW AWARD'}</Text>
                    <Text style={{ fontFamily: F.bold, fontSize: 15, color: C.ink }}>{freshAward.name}</Text>
                  </View>
                  <Icon name="chevron" size={16} color={C.brassInk} />
                </View>
              </Enter>
            </Pressable>
          ) : null}
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

          {paidOnes.length ? (
            <Card style={{ marginTop: 16, padding: 14, flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Text style={T.label}>YOU PAID</Text>
                <Text style={{ fontFamily: F.serif, ...display(22), color: C.ink }}>{money(paidTotal)}</Text>
              </View>
              <View style={{ width: 1, backgroundColor: C.line, marginHorizontal: 14 }} />
              <View style={{ flex: 1 }}>
                <Text style={T.label}>{gain >= 0 ? 'GAIN' : 'LOSS'}{paidOnes.length < collection.length ? ` · ${paidOnes.length} OF ${collection.length}` : ''}</Text>
                <Text style={{ fontFamily: F.serif, ...display(22), color: gain >= 0 ? C.up : C.down }}>{gain >= 0 ? '+' : '−'}{money(Math.abs(gain))} <Text style={{ fontFamily: F.bold, fontSize: 13 }}>{paidTotal ? `${gain >= 0 ? '+' : '−'}${Math.abs((gain / paidTotal) * 100).toFixed(1)}%` : ''}</Text></Text>
              </View>
            </Card>
          ) : (
            <Pressable onPress={() => openWatch(collection[0].modelId)}>
              <View style={{ marginTop: 16, padding: 14, borderRadius: 16, backgroundColor: C.brassSoft, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="edit" size={18} color={C.brassInk} />
                <Text style={{ flex: 1, fontFamily: F.semibold, fontSize: 13.5, color: C.brassInk }}>Add what you paid to see your gain or loss</Text>
                <Icon name="chevron" size={16} color={C.brassInk} />
              </View>
            </Pressable>
          )}

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
            const owned = collection[i], v = ownedValue(owned, answers.papers), ch = change12(m);
            return (
              <Enter key={m.id} delay={60 * i}>
                <Pressable disabled={editing} onPress={() => { Haptics.selectionAsync(); openWatch(m.id); }} accessibilityRole="button" accessibilityLabel={`Open ${m.brand} ${m.name}`}>
                <Card style={{ marginTop: 12, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <WatchThumb photo={owned.photo} brand={m.brand} size={56} radius={14} />
                  <View style={{ flex: 1 }}>
                    <Text style={[T.b, { fontSize: 15 }]} numberOfLines={1}>{m.brand} {m.name}</Text>
                    <Text style={[T.small, { fontSize: 12.5 }]} numberOfLines={1}>{owned.paid ? `Paid ${money(owned.paid)}` : m.ref}</Text>
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
                </Pressable>
              </Enter>
            );
          })}
          <Pressable onPress={() => go(canAdd ? 'priming' : 'paywall')}>
            <View style={{ marginTop: 10, height: 64, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.dash, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Icon name={canAdd ? 'plus' : 'lock'} size={18} color={C.green} w={2.2} />
              <Text style={{ fontFamily: F.bold, fontSize: 15, color: C.green }}>{canAdd ? 'Add a watch' : 'Add more watches with Pro'}</Text>
            </View>
          </Pressable>
          <WishlistRow />
          <GuideCarousel />
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
      {streakBonus ? <StreakBonus days={streakBonus} onClose={clearStreakBonus} /> : null}
      <TabBar active="home" />
    </View>
  );
}

// ---------- Alerts ----------
function StreakBonus({ days, onClose }: { days: number; onClose: () => void }) {
  const lit = Math.min(days, 7);
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,10,8,.55)', alignItems: 'center', justifyContent: 'center', padding: 28, zIndex: 10 }}>
      <Enter style={{ alignSelf: 'stretch' }}>
        <View style={{ backgroundColor: C.surface, borderRadius: 28, padding: 26, alignItems: 'center' }}>
          <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: C.downSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="flame" size={40} color={C.down} w={1.8} /></View>
          <Text style={[T.eyebrow, { color: C.down, marginTop: 18 }]}>Streak bonus</Text>
          <Text style={{ fontFamily: F.serif, ...display(56), lineHeight: 62, color: C.ink }}>{days} days</Text>
          <Text style={[T.sub, { textAlign: 'center', marginTop: 4 }]}>You have checked your collection {days} days in a row. Come back tomorrow to keep it going.</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 18 }}>
            {Array.from({ length: 7 }, (_, i) => (
              <View key={i} style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: i < lit ? C.down : C.paper, borderWidth: 1, borderColor: i < lit ? C.down : C.line }}>
                {i < lit ? <Icon name="check" size={14} color="#FFFFFF" w={2.6} /> : <Text style={{ fontFamily: F.bold, fontSize: 11, color: C.stone }}>{i + 1}</Text>}
              </View>
            ))}
          </View>
          <Text style={[T.small, { marginTop: 8, fontSize: 12 }]}>{days >= 7 ? 'Week Streak award unlocked' : `${7 - days} more for the Week Streak award`}</Text>
          <View style={{ alignSelf: 'stretch', marginTop: 20 }}><Button title="Keep it going" onPress={onClose} /></View>
        </View>
      </Enter>
    </View>
  );
}

// wishlist prices use the "some box and papers" value, i.e. the plain market median
export const wishPrice = (modelId: string) => valueOf(byId(modelId), 'Some').mid;

function WishlistRow() {
  const { wishes, go } = useStore();
  const atTarget = wishes.filter(w => w.target && wishPrice(w.modelId) <= w.target).length;
  return (
    <Pressable onPress={() => { Haptics.selectionAsync(); go('wishlist'); }} accessibilityRole="button">
      <Card style={{ marginTop: 22, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.downSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="heart" size={22} color={C.down} /></View>
        <View style={{ flex: 1 }}>
          <Text style={[T.b, { fontSize: 15.5 }]}>Wishlist</Text>
          <Text style={T.small}>{wishes.length ? `${wishes.length} watch${wishes.length > 1 ? 'es' : ''}${atTarget ? ` · ${atTarget} at your price` : ''}` : 'Save the watch you want next. We watch the price.'}</Text>
        </View>
        {atTarget ? <Pill text="Price hit" bg={C.upSoft} fg={C.up} /> : <Icon name="chevron" size={16} color={C.stone} />}
      </Card>
    </Pressable>
  );
}

// ---------- Alerts ----------
export function Alerts() {
  const { collection, answers, pro, go, wishes, openWatch } = useStore();
  const now = new Date();
  const due = collection.filter(o => { const d = serviceDue(o.lastService); return d && d <= now; });
  const hits = wishes.filter(w => w.target && wishPrice(w.modelId) <= w.target);
  const models = collection.map(o => byId(o.modelId));
  const quiet = !due.length && !hits.length;
  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 24, height: 44, justifyContent: 'center' }}><Text style={{ fontFamily: F.bold, fontSize: 16, color: C.ink }}>Alerts</Text></View>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={T.h2}>{!quiet ? 'Worth a look.' : models.length ? 'Quiet week.' : 'Nothing to watch yet.'}</Text>
        <Text style={T.sub}>{!quiet ? 'A few things need your attention.' : models.length ? 'No watch has moved more than 5% since you added it. We check every Sunday.' : 'Add a watch and we will tell you when its value moves.'}</Text>
        {hits.map(w => {
          const m = byId(w.modelId);
          return (
            <Pressable key={'w' + w.modelId} onPress={() => go('wishlist')}>
              <Card style={{ marginTop: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: C.up }}>
                <Icon name="heart" size={20} color={C.up} />
                <View style={{ flex: 1 }}>
                  <Text style={[T.b, { fontSize: 15 }]}>{m.brand} {m.name}</Text>
                  <Text style={T.small}>Now {money(wishPrice(m.id))}, at or under your price of {money(w.target!)}</Text>
                </View>
                <Icon name="chevron" size={16} color={C.stone} />
              </Card>
            </Pressable>
          );
        })}
        {due.map(o => {
          const m = byId(o.modelId);
          return (
            <Pressable key={'s' + o.modelId} onPress={() => openWatch(o.modelId)}>
              <Card style={{ marginTop: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: C.brass }}>
                <Icon name="wrench" size={20} color={C.brassInk} />
                <View style={{ flex: 1 }}>
                  <Text style={[T.b, { fontSize: 15 }]}>Service due: {m.brand} {m.name}</Text>
                  <Text style={T.small}>Last serviced in {new Date(o.lastService!).getFullYear()}. A service keeps it accurate and protects its value.</Text>
                </View>
                <Icon name="chevron" size={16} color={C.stone} />
              </Card>
            </Pressable>
          );
        })}
        {models.length ? <Text style={[T.label, { marginTop: 26 }]}>PRICE ALERTS</Text> : null}
        {models.map(m => (
          <Card key={m.id} style={{ marginTop: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
