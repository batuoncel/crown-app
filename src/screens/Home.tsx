import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { C, F, display, money, pct } from '../theme';
import { BottomCTA, Button, Card, CountUp, Enter, Icon, LineChart, Logo, Pill, RoundButton, T, WatchArt, WatchThumb } from '../ui';
import { GuideCarousel } from './Guide';
import { byId, change12, hasPrice, conditionFactor, marketSignal, ownedValue, papersFactor, planSlots, serviceDue, valueOf } from '../data';
import { useStore } from '../store';
import { fmtDate as fmtLocalDate, t } from '../i18n';

const fmtDate = (d: Date) => fmtLocalDate(d, { month: 'short', day: 'numeric' });

// ---------- 8. Paywall ----------
export function Paywall() {
  const { go, answers, setPro } = useStore();
  const [plan, setPlan] = useState<'year' | 'week'>('year');
  const headline = answers.goal === 'sell' ? t('Know the right moment to sell.') : answers.goal === 'buy' ? t('Never overpay for a watch again.') : t("See your collection's value, every week.");
  const perks = [
    t('Unlimited watches in your collection'),
    answers.goal === 'sell' ? t('Sell alerts when a watch is up 5%') : t('Alerts when a watch moves ±5%'),
    t('Full 5-year price history'),
    t('Collection inventory for your insurer (PDF)'),
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
          {best ? <View style={{ position: 'absolute', top: -13, right: 14, backgroundColor: C.brass, borderRadius: 12, height: 24, paddingHorizontal: 10, justifyContent: 'center' }}><Text style={{ fontFamily: F.bold, fontSize: 11.5, color: C.ink }}>{t("Best value")}</Text></View> : null}
        </Card>
      </Pressable>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: 44 }}>
        <RoundButton icon="close" onPress={() => go('home')} label={t("Close, continue free")} />
        <Text style={[T.small, { fontFamily: F.semibold }]}>{t("Free plan: 1 watch")}</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 10 }} showsVerticalScrollIndicator={false}>
        <Text style={[T.eyebrow, { color: C.brassInk }]}>{t("Crown Pro")}</Text>
        <Text style={[T.h2, { marginTop: 8 }]}>{headline}</Text>
        <View style={{ gap: 11, marginTop: 18 }}>
          {perks.map(p => (
            <View key={p} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={15} color={C.green} w={2.4} /></View>
              <Text style={[T.body, { fontFamily: F.semibold }]}>{p}</Text>
            </View>
          ))}
        </View>
        <Plan id="year" title={t("Yearly")} sub={t("$39.99 billed once a year")} price="$0.77" unit={t("per week")} best />
        <Plan id="week" title={t("Weekly")} sub={t("Billed every week")} price="$4.99" unit={t("per week")} />
      </ScrollView>
      <BottomCTA note={`${t('Cancel anytime in Settings.')}\n${t('Demo prototype, no real payment.')}`}>
        <Button title={plan === 'year' ? t('Subscribe for $39.99/year') : t('Subscribe for $4.99/week')} onPress={() => { setPro(true); go('proWelcome'); }} />
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
        <Text style={[T.h1, { color: C.onPrimary, textAlign: 'center', marginTop: 28 }]}>{t("Welcome to Pro.")}</Text>
        <Text style={[T.sub, { color: C.onPrimarySoft, textAlign: 'center' }]}>{t("Your alerts are on and your full price history is unlocked.")}</Text>
        <View style={{ marginTop: 18, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(243,239,230,.12)' }}>
          <Text style={{ fontFamily: F.semibold, fontSize: 12.5, color: C.onPrimarySoft }}>{t("Demo: no payment was taken")}</Text>
        </View>
      </Enter>
      <Button title={t("Go to my collection")} kind="light" onPress={() => go('home')} />
    </View>
  );
}

// ---------- 9. Home ----------
type Tab = 'home' | 'wishlist' | 'alerts' | 'settings';
export function TabBar({ active }: { active: Tab }) {
  const { go } = useStore();
  const TabItem = ({ id, icon, label }: { id: Tab; icon: string; label: string }) => (
    <Pressable onPress={() => { Haptics.selectionAsync(); go(id); }} style={{ alignItems: 'center', gap: 4, flex: 1 }} accessibilityRole="tab" accessibilityState={{ selected: active === id }}>
      <Icon name={icon} size={23} color={active === id ? C.green : C.stone} />
      <Text numberOfLines={1} style={{ fontFamily: F.semibold, fontSize: 10.5, color: active === id ? C.green : C.stone, maxWidth: '100%', paddingHorizontal: 2 }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingTop: 10, paddingBottom: 6, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.paper }}>
      <TabItem id="home" icon="watch" label={t("Collection")} />
      <TabItem id="wishlist" icon="heart" label={t("Wishlist")} />
      <Pressable onPress={() => go('priming')} style={{ alignItems: 'center', gap: 4, flex: 1 }} accessibilityRole="button" accessibilityLabel={t("Scan a watch")}>
        <View style={{ width: 54, height: 54, marginTop: -24, borderRadius: 27, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', shadowColor: C.green, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } }}><Icon name="scan" size={24} color={C.onPrimary} /></View>
        <Text style={{ fontFamily: F.semibold, fontSize: 11, color: C.stone }}>{t("Scan")}</Text>
      </Pressable>
      <TabItem id="alerts" icon="bell" label={t("Alerts")} />
      <TabItem id="settings" icon="sliders" label={t("Settings")} />
    </View>
  );
}

const RANGES = { '1M': 2, '6M': 7, '1Y': 13 } as const;

export function Home() {
  const { go, collection, answers, pro, reset, removeWatch, restoreWatch, openWatch } = useStore();
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
  const series = Array.from({ length: 13 }, (_, i) => collection.reduce((s, o) => s + (byId(o.modelId).history[i] ?? 0) * papersFactor(o.papers ?? answers.papers) * conditionFactor(o.condition), 0));
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
        {pro ? <Pill text={t("Pro")} bg={C.brassSoft} fg={C.brassInk} /> : <Pressable onPress={() => go('paywall')} hitSlop={12} style={{ paddingVertical: 6 }} accessibilityRole="button"><Pill text={t("Try Pro")} bg={C.greenSoft} fg={C.green} /></Pressable>}
        </View>
      </View>
      {models.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{ opacity: 0.35 }}><WatchArt size={110} strap={false} /></View>
          <Text style={[T.h2, { textAlign: 'center', marginTop: 20 }]}>{t("Your collection is empty.")}</Text>
          <Text style={[T.sub, { textAlign: 'center' }]}>{t("Scan your first watch to see what it is worth today.")}</Text>
          <Button title={t("Scan a watch")} icon="scan" onPress={() => go('priming')} style={{ marginTop: 24, paddingHorizontal: 28 }} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 18, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <Text style={T.label}>{t("YOUR COLLECTION")}</Text>
          <CountUp to={total} style={{ fontFamily: F.serif, ...display(52), lineHeight: 58, color: C.ink }} />
          <Text style={{ fontFamily: F.bold, fontSize: 14, color: delta >= 0 ? C.up : C.down }}>
            {delta >= 0 ? '▲ ' : '▼ '}{money(Math.abs(delta))} ({Math.abs(dpct).toFixed(1)}%) <Text style={{ fontFamily: F.medium, color: C.stone }}>{range === '1M' ? t('past month') : range === '6M' ? t('past 6 months') : range === '5Y' ? t('past 12 months (demo data covers 1 year)') : t('past 12 months')}</Text>
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
                <Text style={T.label}>{t("YOU PAID")}</Text>
                <Text style={{ fontFamily: F.serif, ...display(22), color: C.ink }}>{money(paidTotal)}</Text>
              </View>
              <View style={{ width: 1, backgroundColor: C.line, marginHorizontal: 14 }} />
              <View style={{ flex: 1 }}>
                <Text style={T.label}>{gain >= 0 ? t('GAIN') : t('LOSS')}{paidOnes.length < collection.length ? ' · ' + t('{a} OF {b}', { a: paidOnes.length, b: collection.length }) : ''}</Text>
                <Text style={{ fontFamily: F.serif, ...display(22), color: gain >= 0 ? C.up : C.down }}>{gain >= 0 ? '+' : '−'}{money(Math.abs(gain))} <Text style={{ fontFamily: F.bold, fontSize: 13 }}>{paidTotal ? `${gain >= 0 ? '+' : '−'}${Math.abs((gain / paidTotal) * 100).toFixed(1)}%` : ''}</Text></Text>
              </View>
            </Card>
          ) : (
            <Pressable onPress={() => openWatch(collection[0].modelId)}>
              <View style={{ marginTop: 16, padding: 14, borderRadius: 16, backgroundColor: C.brassSoft, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="edit" size={18} color={C.brassInk} />
                <Text style={{ flex: 1, fontFamily: F.semibold, fontSize: 13.5, color: C.brassInk }}>{t("Add what you paid to see your gain or loss")}</Text>
                <Icon name="chevron" size={16} color={C.brassInk} />
              </View>
            </Pressable>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 24 }}>
            <Text style={[T.b, { fontSize: 17 }]}>{t("Watches")}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 14 }}>
              <Text style={T.small}>{pro ? t('{a} of {b} in your plan', { a: models.length, b: planSlots(answers.count) }) : t('{a} of 1 on the free plan', { a: models.length })}</Text>
              <Pressable onPress={() => { Haptics.selectionAsync(); setEditing(e => !e); }} hitSlop={10} accessibilityRole="button">
                <Text style={{ fontFamily: F.bold, fontSize: 14, color: C.green }}>{editing ? t('Done') : t('Edit')}</Text>
              </Pressable>
            </View>
          </View>
          {models.map((m, i) => {
            const owned = collection[i], v = ownedValue(owned, answers.papers), ch = change12(m);
            return (
              <Enter key={m.id} delay={60 * i}>
                <Pressable onPress={editing ? undefined : () => { Haptics.selectionAsync(); openWatch(m.id); }} accessibilityRole="button" accessibilityLabel={t('Open {name}', { name: `${m.brand} ${m.name}` })}>
                <Card style={{ marginTop: 12, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <WatchThumb photo={owned.photo} brand={m.brand} size={56} radius={14} />
                  <View style={{ flex: 1 }}>
                    <Text style={[T.b, { fontSize: 15 }]} numberOfLines={1}>{m.brand} {m.name}</Text>
                    <Text style={[T.small, { fontSize: 12.5 }]} numberOfLines={1}>{owned.paid ? t('Paid {amount}', { amount: money(owned.paid) }) : m.ref}</Text>
                  </View>
                  {editing ? (
                    <Pressable onPress={() => remove(i)} hitSlop={8} accessibilityRole="button" accessibilityLabel={t('Remove {name}', { name: `${m.brand} ${m.name}` })}
                      style={{ height: 40, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.downSoft, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Icon name="trash" size={18} color={C.down} />
                      <Text style={{ fontFamily: F.bold, fontSize: 13, color: C.down }}>{t("Remove")}</Text>
                    </Pressable>
                  ) : (
                    <View style={{ alignItems: 'flex-end' }}>
                      {hasPrice(m) ? (
                        <>
                          <Text style={{ fontFamily: F.serif, ...display(20), color: C.ink }}>{money(v.mid)}</Text>
                          <Text style={{ fontFamily: F.bold, fontSize: 12, color: ch >= 0 ? C.up : C.down }}>{pct(ch)}</Text>
                        </>
                      ) : <Text style={{ fontFamily: F.semibold, fontSize: 12.5, color: C.stone }}>No price yet</Text>}
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
              <Text style={{ fontFamily: F.bold, fontSize: 15, color: C.green }}>{canAdd ? t('Add a watch') : t('Add more watches with Pro')}</Text>
            </View>
          </Pressable>
          <WishlistRow />
          <ReportRow />
          <GuideCarousel />
          <Text style={[T.small, { fontSize: 11.5, textAlign: 'center', marginTop: 18 }]}>{t("Values are demo data for this prototype.")}</Text>
        </ScrollView>
      )}
      {undo ? (
        <Enter style={{ position: 'absolute', left: 16, right: 16, bottom: 96 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.ink, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16 }}>
            <Text style={{ flex: 1, fontFamily: F.semibold, fontSize: 14, color: C.paper }} numberOfLines={1}>{t('Removed {name}', { name: undo.name })}</Text>
            <Pressable onPress={() => { Haptics.selectionAsync(); restoreWatch(undo.owned, undo.index); setUndo(null); }} hitSlop={10} accessibilityRole="button">
              <Text style={{ fontFamily: F.bold, fontSize: 14, color: C.brass }}>{t("Undo")}</Text>
            </Pressable>
          </View>
        </Enter>
      ) : null}
      <TabBar active="home" />
    </View>
  );
}

// ---------- Alerts ----------
function ReportRow() {
  const { go, pro } = useStore();
  return (
    <Pressable onPress={() => { Haptics.selectionAsync(); go('report'); }} accessibilityRole="button">
      <Card style={{ marginTop: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="shield" size={22} color={C.green} /></View>
        <View style={{ flex: 1 }}>
          <Text style={[T.b, { fontSize: 15.5 }]}>{t('Collection inventory')}</Text>
          <Text style={T.small}>{t('Your collection as a PDF, with photos and serial numbers.')}</Text>
        </View>
        {pro ? <Icon name="chevron" size={16} color={C.stone} /> : <Pill text="Pro" bg={C.brassSoft} fg={C.brassInk} />}
      </Card>
    </Pressable>
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
          <Text style={[T.b, { fontSize: 15.5 }]}>{t("Wishlist")}</Text>
          <Text style={T.small}>{wishes.length ? (wishes.length > 1 ? t('{n} watches', { n: wishes.length }) : t('1 watch')) + (atTarget ? ' · ' + t('{n} at your price', { n: atTarget }) : '') : t('Save the watch you want next. We watch the price.')}</Text>
        </View>
        {atTarget ? <Pill text={t("Price hit")} bg={C.upSoft} fg={C.up} /> : <Icon name="chevron" size={16} color={C.stone} />}
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
  // watches near their 12-month high: shown to everyone, first for people who said they want to sell
  const sellNow = collection.filter(o => marketSignal(byId(o.modelId)).sell === 'good');
  const quiet = !due.length && !hits.length && !sellNow.length;
  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 24, height: 44, justifyContent: 'center' }}><Text style={{ fontFamily: F.bold, fontSize: 16, color: C.ink }}>{t("Alerts")}</Text></View>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={T.h2}>{!quiet ? t('Worth a look.') : models.length ? t('Quiet week.') : t('Nothing to watch yet.')}</Text>
        <Text style={T.sub}>{!quiet ? t('A few things need your attention.') : models.length ? t('No watch has moved more than 5% since you added it. We check every Sunday.') : t('Add a watch and we will tell you when its value moves.')}</Text>
        {hits.map(w => {
          const m = byId(w.modelId);
          return (
            <Pressable key={'w' + w.modelId} onPress={() => go('wishlist')}>
              <Card style={{ marginTop: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: C.up }}>
                <Icon name="heart" size={20} color={C.up} />
                <View style={{ flex: 1 }}>
                  <Text style={[T.b, { fontSize: 15 }]}>{m.brand} {m.name}</Text>
                  <Text style={T.small}>{t('Now {now}, at or under your price of {target}', { now: money(wishPrice(m.id)), target: money(w.target!) })}</Text>
                </View>
                <Icon name="chevron" size={16} color={C.stone} />
              </Card>
            </Pressable>
          );
        })}
        {sellNow.map(o => {
          const m = byId(o.modelId);
          return (
            <Pressable key={'g' + o.modelId} onPress={() => openWatch(o.modelId)}>
              <Card style={{ marginTop: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: C.up }}>
                <Icon name="chart" size={20} color={C.up} />
                <View style={{ flex: 1 }}>
                  <Text style={[T.b, { fontSize: 15 }]}>{t('Good time to sell: {name}', { name: `${m.brand} ${m.name}` })}</Text>
                  <Text style={T.small}>{t('Near its 12-month high. Now {value}.', { value: money(ownedValue(o, answers.papers).mid) })}</Text>
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
                  <Text style={[T.b, { fontSize: 15 }]}>{t('Service due: {name}', { name: `${m.brand} ${m.name}` })}</Text>
                  <Text style={T.small}>{t('Last serviced in {y}. A service keeps it accurate and protects its value.', { y: new Date(o.lastService!).getFullYear() })}</Text>
                </View>
                <Icon name="chevron" size={16} color={C.stone} />
              </Card>
            </Pressable>
          );
        })}
        {models.length ? <Text style={[T.label, { marginTop: 26 }]}>{t("PRICE ALERTS")}</Text> : null}
        {models.map(m => (
          <Card key={m.id} style={{ marginTop: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icon name="bell" size={20} color={pro ? C.green : C.stone} />
            <View style={{ flex: 1 }}>
              <Text style={[T.b, { fontSize: 15 }]}>{m.brand} {m.name}</Text>
              <Text style={T.small}>{answers.goal === 'sell' ? t('Tell me when it is up 5%') : t('Tell me if it moves ±5%')}</Text>
            </View>
            <Text style={{ fontFamily: F.bold, fontSize: 12.5, color: pro ? C.up : C.stone }}>{pro ? t('On') : 'Pro'}</Text>
          </Card>
        ))}
        {!pro && models.length ? <Button title={t("Turn on alerts with Pro")} onPress={() => go('paywall')} style={{ marginTop: 20 }} /> : null}
      </ScrollView>
      <TabBar active="alerts" />
    </View>
  );
}
