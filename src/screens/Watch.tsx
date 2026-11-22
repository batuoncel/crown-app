import React, { useEffect, useState } from 'react';
import { Image, Keyboard, Pressable, ScrollView, Share, Text, TextInput, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { C, CURRENCIES, Currency, F, currency as cur, display, fromUsd, isNavy, money, num, pct, toUsd } from '../theme';
import { Button, Card, Enter, Icon, LineChart, Pill, RoundButton, Segmented, T, WatchThumb } from '../ui';
import { pickPhoto } from '../photo';
import { TabBar } from './Home';
import { Answers, CONDITIONS, Condition, MONTHS, SERVICE_YEARS, byId, change12, ownedValue, serviceDue } from '../data';
import { useStore } from '../store';
import { ThemeName } from '../theme';
import { AVAILABLE_LANGS, LANGS, fmtDate, t } from '../i18n';

const SITE = 'https://batuoncel.github.io/crown-app/';
const PAPERS: { key: NonNullable<Answers['papers']>; label: string }[] = [
  { key: 'Yes', label: 'Full set' },
  { key: 'Some', label: 'Some' },
  { key: 'No', label: 'None' },
];
const round50 = (n: number) => Math.round(n / 50) * 50;
const fmtDay = (iso: string) => fmtDate(new Date(iso), { month: 'short', day: 'numeric', year: 'numeric' });

function Header({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: 44 }}>
      <RoundButton icon="back" onPress={onBack} label={t("Back")} />
      <Text style={{ fontFamily: F.bold, fontSize: 16, color: C.ink }}>{title}</Text>
      {right ?? <View style={{ width: 36 }} />}
    </View>
  );
}

function useOwned() {
  const { detailId, collection, go } = useStore();
  const owned = collection.find(o => o.modelId === detailId);
  useEffect(() => { if (!owned) go('home'); }, [owned]);
  return owned;
}

// ---------- Watch detail ----------
export function WatchDetail() {
  const { go, answers, pro, updateWatch, removeWatch, openGuide } = useStore();
  const [yearText, setYearText] = useState('');
  const { width } = useWindowDimensions();
  const owned = useOwned();
  const [range, setRange] = useState<'6M' | '1Y' | '5Y'>('1Y');
  const [paidText, setPaidText] = useState(owned?.paid ? String(Math.round(fromUsd(owned.paid))) : '');
  const [confirmRemove, setConfirmRemove] = useState(false);
  if (!owned) return null;
  const m = byId(owned.modelId);
  const papers = owned.papers ?? answers.papers;
  const v = ownedValue(owned, answers.papers);
  const series = m.history.map(x => x * (v.mid / m.history[12]));
  const n = range === '6M' ? 7 : 13;
  const shown = series.slice(13 - n);
  const ch = ((shown[shown.length - 1] - shown[0]) / shown[0]) * 100;
  const gain = owned.paid ? v.mid - owned.paid : 0;
  const gainPct = owned.paid ? (gain / owned.paid) * 100 : 0;
  const savedText = owned.paid ? String(Math.round(fromUsd(owned.paid))) : '';
  const dirty = paidText !== savedText;
  const chartW = Math.min(width, 520) - 48 - 36;

  const savePaid = () => {
    const local = parseInt(paidText, 10);
    Keyboard.dismiss();
    if (!paidText) { updateWatch(m.id, { paid: undefined }); return; }
    if (!local) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateWatch(m.id, { paid: toUsd(local) });
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title={t("Your watch")} onBack={() => go('home')} right={<RoundButton icon="share" onPress={() => go('share')} label={t("Share value card")} />} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 28 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Enter><WatchThumb photo={owned.photo} brand={m.brand} size={200} radius={28} /></Enter>
          <Pressable onPress={async () => { const p = await pickPhoto(); if (p) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); updateWatch(m.id, { photo: p }); } }} hitSlop={8} accessibilityRole="button"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, marginBottom: 14, paddingHorizontal: 14, height: 34, borderRadius: 17, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface }}>
            <Icon name="image" size={16} color={C.green} />
            <Text style={{ fontFamily: F.bold, fontSize: 13, color: C.green }}>{owned.photo ? t('Change photo') : t('Add your photo')}</Text>
          </Pressable>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={[T.label, { fontSize: 13 }]}>{m.brand.toUpperCase()}</Text>
          <Text style={{ fontFamily: F.serif, ...display(30), lineHeight: 34, color: C.ink, textAlign: 'center' }}>{m.name}</Text>
          <Text style={[T.small, { marginTop: 4 }]}>{m.ref} · {m.size} · {m.material}</Text>
        </View>

        <Card style={{ padding: 18, marginTop: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={T.label}>{t("WORTH TODAY")}</Text>
              <Text style={{ fontFamily: F.serif, ...display(30), lineHeight: 36, color: C.ink }}>{money(round50(v.low))}–{num(round50(v.high))}</Text>
            </View>
            <Pill text={pct(ch)} bg={ch >= 0 ? C.upSoft : C.downSoft} fg={ch >= 0 ? C.up : C.down} />
          </View>
          <View style={{ marginTop: 14 }}><LineChart data={shown} width={chartW} height={90} color={ch >= 0 ? C.up : C.down} /></View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={[T.small, { fontSize: 11.5 }]}>{t(MONTHS[13 - n])} {n === 13 ? '2025' : '2026'}</Text>
            <Text style={[T.small, { fontSize: 11.5 }]}>{t("Today")}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
            {(['6M', '1Y', '5Y'] as const).map(t => {
              const locked = t === '5Y' && !pro;
              return (
                <Pressable key={t} style={{ flex: 1 }} onPress={() => { Haptics.selectionAsync(); if (locked) go('paywall'); else setRange(t); }}>
                  <View style={{ height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4, backgroundColor: range === t ? C.ink : 'transparent' }}>
                    {locked ? <Icon name="lock" size={12} color={C.stone} /> : null}
                    <Text style={{ fontFamily: F.bold, fontSize: 13, color: range === t ? C.paper : C.stone }}>{t}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          {range === '5Y' ? <Text style={[T.small, { fontSize: 11.5, marginTop: 8 }]}>{t("Demo data covers 12 months.")}</Text> : null}
        </Card>

        <Card style={{ padding: 18, marginTop: 12 }}>
          <Text style={T.label}>{t("WHAT YOU PAID")}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.paper, paddingHorizontal: 14 }}>
              <Text style={{ fontFamily: F.bold, fontSize: 17, color: C.stone, marginRight: 6 }}>{cur().symbol}</Text>
              <TextInput
                value={paidText}
                onChangeText={t => setPaidText(t.replace(/[^0-9]/g, '').slice(0, 9))}
                onSubmitEditing={savePaid}
                keyboardType="number-pad"
                returnKeyType="done"
                placeholder={String(Math.round(fromUsd(round50(v.mid * 0.9))))}
                placeholderTextColor={C.stone}
                accessibilityLabel={t('Purchase price in {cur}', { cur: cur().key })}
                style={{ flex: 1, fontFamily: F.bold, fontSize: 17, color: C.ink }}
              />
            </View>
            {dirty ? <Button title={t("Save")} onPress={savePaid} style={{ height: 48, paddingHorizontal: 20 }} /> : null}
          </View>
          {owned.paid ? (
            <View style={{ marginTop: 14 }}>
              <Text style={{ fontFamily: F.serif, ...display(26), color: gain >= 0 ? C.up : C.down }}>
                {gain >= 0 ? '+' : '−'}{money(Math.abs(gain))} <Text style={{ fontFamily: F.bold, fontSize: 15 }}>({gain >= 0 ? '+' : '−'}{Math.abs(gainPct).toFixed(1)}%)</Text>
              </Text>
              <Text style={T.small}>{gain >= 0 ? t("Gain since you bought it, against the middle of today's range.") : t("Loss since you bought it, against the middle of today's range.")}</Text>
            </View>
          ) : (
            <Text style={[T.small, { marginTop: 10 }]}>{t("Add it to see your gain or loss. Only stored on this phone.")}</Text>
          )}
        </Card>

        <Card style={{ padding: 18, marginTop: 12 }}>
          <Text style={T.label}>{t("BOX AND PAPERS")}</Text>
          <View style={{ marginTop: 10 }}>
            <Segmented options={PAPERS.map(p => ({ ...p, label: t(p.label) }))} value={papers} onChange={p => updateWatch(m.id, { papers: p })} />
          </View>
          <Text style={[T.small, { marginTop: 10 }]}>{t("A full set adds about 6%. No box or papers takes off about 7%.")}</Text>
        </Card>

        <Card style={{ padding: 18, marginTop: 12 }}>
          <Text style={T.label}>{t("CONDITION")}</Text>
          <View style={{ marginTop: 10 }}>
            <Segmented<Condition> options={CONDITIONS.map(c => ({ key: c, label: t(c) }))} value={owned.condition ?? 'Good'} onChange={c => updateWatch(m.id, { condition: c })} />
          </View>
          <Text style={[T.small, { marginTop: 10 }]}>{t(CONDITION_NOTE[owned.condition ?? 'Good'])}</Text>
        </Card>

        <ServiceCard
          last={owned.lastService}
          yearText={yearText}
          setYearText={setYearText}
          onSet={iso => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); updateWatch(m.id, { lastService: iso }); }}
          onGuide={() => openGuide('service')}
        />

        <Text style={[T.small, { textAlign: 'center', marginTop: 16 }]}>{t('In your collection since {date}', { date: fmtDay(owned.addedAt) })}</Text>
        <Button title={t("Share value card")} icon="share" onPress={() => go('share')} style={{ marginTop: 16 }} />
        <Pressable
          onPress={() => {
            if (!confirmRemove) { Haptics.selectionAsync(); setConfirmRemove(true); return; }
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            removeWatch(m.id);
            go('home');
          }}
          accessibilityRole="button"
          style={{ height: 48, marginTop: 8, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: confirmRemove ? C.downSoft : 'transparent' }}
        >
          <Icon name="trash" size={18} color={C.down} />
          <Text style={{ fontFamily: F.bold, fontSize: 15, color: C.down }}>{confirmRemove ? t('Tap again to remove') : t('Remove from collection')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const CONDITION_NOTE: Record<Condition, string> = {
  Unworn: 'Never worn, stickers on. Adds about 12%.',
  Excellent: 'Light signs of wear only. Adds about 5%.',
  Good: 'Normal wear for a watch in use. The market price.',
  Worn: 'Visible scratches or dents. Takes off about 12%.',
};

function ServiceCard({ last, yearText, setYearText, onSet, onGuide }: { last?: string; yearText: string; setYearText: (t: string) => void; onSet: (iso: string) => void; onGuide: () => void }) {
  const due = serviceDue(last);
  const now = new Date();
  const isDue = !!due && due <= now;
  const thisYear = now.getFullYear();
  const y = parseInt(yearText, 10);
  const valid = y >= 1950 && y <= thisYear;
  return (
    <Card style={{ padding: 18, marginTop: 12, borderColor: isDue ? C.brass : C.line, borderWidth: isDue ? 2 : 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={T.label}>{t("SERVICE")}</Text>
        {last ? (isDue ? <Pill text={t("Due now")} bg={C.brassSoft} fg={C.brassInk} icon="wrench" /> : <Pill text={t('Next around {y}', { y: due!.getFullYear() })} bg={C.greenSoft} fg={C.green} />) : null}
      </View>
      <Text style={[T.body, { marginTop: 10 }]}>
        {last ? t('Last serviced {date}', { date: fmtDate(new Date(last), { month: 'short', year: 'numeric' }) }) : t('When was it last serviced?')}
      </Text>
      <Text style={[T.small, { marginTop: 2 }]}>{t('We remind you every {n} years. A service history also helps when you sell.', { n: SERVICE_YEARS })}</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', height: 44, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.paper, paddingHorizontal: 12 }}>
          <Text style={{ fontFamily: F.semibold, fontSize: 13, color: C.stone, marginRight: 6 }}>{t("Year")}</Text>
          <TextInput value={yearText} onChangeText={t => setYearText(t.replace(/[^0-9]/g, '').slice(0, 4))} keyboardType="number-pad" placeholder={String(thisYear - 3)} placeholderTextColor={C.stone}
            accessibilityLabel={t("Year of last service")} style={{ flex: 1, fontFamily: F.bold, fontSize: 16, color: C.ink }}
            onSubmitEditing={() => { if (valid) { Keyboard.dismiss(); onSet(`${y}-06-15T12:00:00Z`); setYearText(''); } }} />
        </View>
        {valid
          ? <Button title={t("Save")} onPress={() => { Keyboard.dismiss(); onSet(`${y}-06-15T12:00:00Z`); setYearText(''); }} style={{ height: 44, paddingHorizontal: 18 }} />
          : <Pressable onPress={() => onSet(new Date().toISOString())} accessibilityRole="button" style={{ height: 44, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.greenSoft, justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.bold, fontSize: 13.5, color: C.green }}>{t("Serviced today")}</Text>
            </Pressable>}
      </View>
      <Pressable onPress={onGuide} hitSlop={8} style={{ marginTop: 12 }}><Text style={{ fontFamily: F.bold, fontSize: 13, color: C.green }}>{t("When does a watch need a service? →")}</Text></Pressable>
    </Card>
  );
}

// ---------- Share card ----------
export function Share_() {
  const { go, answers, bumpShare } = useStore();
  const { width } = useWindowDimensions();
  const owned = useOwned();
  const [note, setNote] = useState('');
  if (!owned) return null;
  const m = byId(owned.modelId);
  const v = ownedValue(owned, answers.papers);
  const ch = change12(m);
  const w = Math.min(width - 48, 340);
  const bg = isNavy() ? '#101A2C' : C.green;
  const fg = '#F3EFE6', soft = 'rgba(243,239,230,.68)';
  const text = t('My {name} is worth about {value} today ({change} in 12 months). Valued with Crown:', { name: `${m.brand} ${m.name}`, value: money(round50(v.mid)), change: pct(ch) }) + ' ' + SITE;

  const share = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const r = await Share.share({ message: text });
      if (r.action !== Share.dismissedAction) bumpShare();
    } catch {
      try {
        await (globalThis as any).navigator.clipboard.writeText(text);
        setNote(t('Copied. Paste it anywhere.'));
        bumpShare();
      } catch {
        setNote(t('Sharing is not available in this browser.'));
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title={t("Share")} onBack={() => go('watch')} />
      <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 24, paddingTop: 12 }} showsVerticalScrollIndicator={false}>
        <Enter>
          <View style={{ width: w, borderRadius: 28, backgroundColor: bg, padding: 22, overflow: 'hidden' }}>
            <View style={{ position: 'absolute', right: -60, top: 70, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,.06)' }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image source={require('../../assets/crown-mark.png')} style={{ width: 26, height: 26, borderRadius: 7 }} />
                <Text style={{ fontFamily: F.serif, fontSize: isNavy() ? 15 : 18, letterSpacing: 2.5, color: fg }}>{t("CROWN")}</Text>
              </View>
              <Text style={{ fontFamily: F.semibold, fontSize: 11.5, color: soft }}>{fmtDate(new Date(), { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
            </View>
            <View style={{ alignItems: 'center', marginVertical: 14 }}>
              <WatchThumb photo={owned.photo} brand={m.brand} size={w * 0.62} radius={22} style={{ borderWidth: 3, borderColor: 'rgba(243,239,230,.9)' }} />
            </View>
            <Text style={{ fontFamily: F.bold, fontSize: 12, letterSpacing: 1.6, color: '#D9B26A' }}>{m.brand.toUpperCase()}</Text>
            <Text style={{ fontFamily: F.serif, ...display(28), lineHeight: 32, color: fg }}>{m.name}</Text>
            <View style={{ height: 1, backgroundColor: 'rgba(243,239,230,.18)', marginVertical: 14 }} />
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontFamily: F.bold, fontSize: 11, letterSpacing: 1.2, color: soft }}>{t("WORTH TODAY")}</Text>
                <Text style={{ fontFamily: F.serif, ...display(40), lineHeight: 46, color: fg }}>{money(round50(v.mid))}</Text>
              </View>
              <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(243,239,230,.12)', marginBottom: 6 }}>
                <Text style={{ fontFamily: F.bold, fontSize: 13, color: ch >= 0 ? '#9AD9AE' : '#F2A493' }}>{pct(ch)}{t(" · 12M")}</Text>
              </View>
            </View>
            <Text style={{ fontFamily: F.medium, fontSize: 12, color: soft, marginTop: 12 }}>{t("One photo. An honest value range.")}</Text>
          </View>
        </Enter>
        <Text style={[T.small, { textAlign: 'center', marginTop: 16 }]}>{t("Screenshot the card to post it as a story,")}{'\n'}{t("or share it as a message with a link.")}</Text>
      </ScrollView>
      <View style={{ padding: 24, paddingTop: 8, paddingBottom: 12 }}>
        <Button title={t("Share")} icon="share" onPress={share} />
        {note ? <Text style={[T.small, { textAlign: 'center', marginTop: 8 }]}>{note}</Text> : null}
      </View>
    </View>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={[T.label, { marginBottom: 8 }]}>{label}</Text>
      <Card style={{ padding: 16 }}>{children}</Card>
    </View>
  );
}

// ---------- Settings ----------
export function Settings() {
  const { go, theme, setTheme, currency, setCurrencyPref, answers, setAnswers, pro, setPro, reset, feedback, lang, setLanguage } = useStore();
  const [confirm, setConfirm] = useState(false);
  const [showLangs, setShowLangs] = useState(false);
  const curLang = LANGS.find(l => l.key === lang) ?? LANGS[0];
  const isOther = currency !== 'USD' && currency !== 'EUR';
  const [showOther, setShowOther] = useState(isOther);
  const [q, setQ] = useState('');
  const curNow = CURRENCIES.find(c => c.key === currency) ?? CURRENCIES[0];
  const others = CURRENCIES.filter(c => c.key !== 'USD' && c.key !== 'EUR' && (c.name + ' ' + c.key).toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 24, height: 44, justifyContent: 'center' }}><Text style={{ fontFamily: F.bold, fontSize: 16, color: C.ink }}>{t("Settings")}</Text></View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Section label={t("APPEARANCE")}>
          <Segmented<ThemeName> options={[{ key: 'classic', label: t('Classic') }, { key: 'navy', label: t('Navy') }]} value={theme} onChange={setTheme} />
        </Section>
        <Section label={t('LANGUAGE')}>
          <Pressable onPress={() => { Haptics.selectionAsync(); setShowLangs(v => !v); }} accessibilityRole="button" accessibilityState={{ expanded: showLangs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 22 }}>{curLang.flag}</Text>
              <Text style={{ flex: 1, fontFamily: F.bold, fontSize: 15, color: C.ink }}>{curLang.native}</Text>
              <View style={{ transform: [{ rotate: showLangs ? '-90deg' : '90deg' }] }}><Icon name="chevron" size={16} color={C.stone} /></View>
            </View>
          </Pressable>
          {showLangs ? (
            <View style={{ marginTop: 10 }}>
              {AVAILABLE_LANGS.map(l => {
                const on = l.key === lang;
                return (
                  <Pressable key={l.key} onPress={() => { Haptics.selectionAsync(); setLanguage(l.key); }} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={l.native}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.line }}>
                      <Text style={{ fontSize: 20, width: 28 }}>{l.flag}</Text>
                      <Text style={{ flex: 1, fontFamily: on ? F.bold : F.medium, fontSize: 15, color: C.ink }}>{l.native}</Text>
                      {on ? <Icon name="check" size={18} color={C.green} w={2.4} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </Section>
        <Section label={t('CURRENCY')}>
          <Segmented<Currency>
            options={[{ key: 'USD', label: '$ USD' }, { key: 'EUR', label: '€ EUR' }, { key: 'OTHER', label: isOther ? `${curNow.key} ▾` : t('Other ▾') }]}
            value={showOther || isOther ? 'OTHER' : currency}
            onChange={k => { if (k === 'OTHER') setShowOther(true); else { setShowOther(false); setCurrencyPref(k); } }}
          />
          {showOther ? (
            <View style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 42, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.paper, paddingHorizontal: 12 }}>
                <Icon name="search" size={17} color={C.stone} />
                <TextInput value={q} onChangeText={setQ} placeholder={t("Search currency")} placeholderTextColor={C.stone} autoCorrect={false} style={{ flex: 1, fontFamily: F.medium, fontSize: 15, color: C.ink }} />
              </View>
              <View style={{ maxHeight: 280, marginTop: 6 }}>
                <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                  {others.map(c => {
                    const on = c.key === currency;
                    return (
                      <Pressable key={c.key} onPress={() => { Haptics.selectionAsync(); setCurrencyPref(c.key); }} accessibilityRole="radio" accessibilityState={{ selected: on }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.line }}>
                          <Text style={{ width: 46, fontFamily: F.bold, fontSize: 13.5, color: C.stone }}>{c.key}</Text>
                          <Text style={{ flex: 1, fontFamily: on ? F.bold : F.medium, fontSize: 15, color: C.ink }}>{c.name}</Text>
                          <Text style={{ fontFamily: F.semibold, fontSize: 14, color: C.stone }}>{c.symbol.trim()}</Text>
                          {on ? <Icon name="check" size={18} color={C.green} w={2.4} /> : <View style={{ width: 18 }} />}
                        </View>
                      </Pressable>
                    );
                  })}
                  {others.length === 0 ? <Text style={[T.small, { paddingVertical: 12 }]}>{t("No currency matches \"")}{q}".</Text> : null}
                </ScrollView>
              </View>
            </View>
          ) : null}
          <Text style={[T.small, { marginTop: 10 }]}>{currency === 'USD' ? t('Prices are tracked in US dollars.') : t('Prices are tracked in US dollars and shown at a fixed demo rate: $1 = {rate}.', { rate: `${curNow.symbol.trim()} ${curNow.rate}` })}</Text>
        </Section>
        <Section label={t("BOX AND PAPERS")}>
          <Text style={[T.body, { marginBottom: 10 }]}>{t("Default for new watches")}</Text>
          <Segmented options={PAPERS.map(p => ({ ...p, label: t(p.label) }))} value={answers.papers} onChange={p => setAnswers({ papers: p })} />
        </Section>
        <Section label={t("CROWN PRO")}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={T.b}>{pro ? t('Pro is on') : t('Free plan')}</Text>
              <Text style={T.small}>{pro ? t('Unlimited watches, alerts, 5-year history') : t('1 watch, no alerts')}</Text>
            </View>
            {pro
              ? <Pressable onPress={() => { Haptics.selectionAsync(); setPro(false); }} hitSlop={8}><Text style={{ fontFamily: F.bold, fontSize: 14, color: C.down }}>{t("Cancel")}</Text></Pressable>
              : <Pressable onPress={() => go('paywall')}><Pill text={t("Try Pro")} bg={C.greenSoft} fg={C.green} /></Pressable>}
          </View>
          {pro ? <Text style={[T.small, { marginTop: 8, fontSize: 12 }]}>{t("Demo: no payment was taken.")}</Text> : null}
        </Section>
        <Section label={t("ABOUT")}>
          <Text style={T.body}>{t("Crown is a course prototype.")}</Text>
          <Text style={[T.small, { marginTop: 4 }]}>{t("Prices are demo data, not live market data. Your collection is stored only on this device.")}</Text>
          {feedback.yes + feedback.no ? <Text style={[T.small, { marginTop: 4 }]}>{t('Your match feedback: {a} right, {b} wrong.', { a: feedback.yes, b: feedback.no })}</Text> : null}
          <Pressable
            onPress={() => { if (!confirm) { Haptics.selectionAsync(); setConfirm(true); } else reset(); }}
            style={{ marginTop: 14, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: confirm ? C.downSoft : C.paper, borderWidth: 1, borderColor: confirm ? C.downSoft : C.line }}
            accessibilityRole="button"
          >
            <Text style={{ fontFamily: F.bold, fontSize: 14, color: C.down }}>{confirm ? t('Tap again: delete everything and start over') : t('Reset demo')}</Text>
          </Pressable>
        </Section>
        <Text style={[T.small, { textAlign: 'center', marginTop: 20, fontSize: 12 }]}>{t("Crown 1.3 · Made by Batu Öncel")}</Text>
      </ScrollView>
      <TabBar active="settings" />
    </View>
  );
}
