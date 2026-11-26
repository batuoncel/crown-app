import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Path } from 'react-native-svg';
import { C, F, display, money, num, pct } from '../theme';
import { BottomCTA, Button, Card, CountUp, Enter, Icon, LineChart, Pill, RoundButton, T, WatchArt, WatchThumb } from '../ui';
import { pickPhoto, shrink } from '../photo';
import { LIVE_SCAN, identifyPhoto, matchModel } from '../identify';
import { customModel, hasPrice } from '../data';
import { change12, Model, MODELS, recognise, valueOf } from '../data';
import { useStore } from '../store';
import { useAutoMarket } from './MarketCard';
import { Spinner, TopBar } from './Onboarding';
import { t } from '../i18n';

// ---------- 5. Camera priming (+ denied state) ----------
export function Priming() {
  const { go, onboarded, setScan } = useStore();
  useEffect(() => { setScan({}); }, []); // a new scan starts clean
  const [perm, request] = useCameraPermissions();
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (perm?.granted) go('camera');
  }, [perm?.granted]);

  const ask = async () => {
    const r = await request();
    if (r.granted) go('camera');
    else setDenied(true);
  };

  if (denied || (perm && !perm.granted && !perm.canAskAgain)) {
    return (
      <View style={{ flex: 1 }}>
        {onboarded ? <View style={{ paddingHorizontal: 24, height: 44, justifyContent: 'center' }}><RoundButton icon="back" onPress={() => go('home')} label={t("Back")} /></View> : <TopBar step={5} onBack={() => go('plan')} />}
        <View style={{ flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.brassSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="alert" size={32} color={C.brassInk} /></View>
          <Text style={[T.h2, { marginTop: 24, textAlign: 'center' }]}>{t("The camera is off.")}</Text>
          <Text style={[T.sub, { textAlign: 'center' }]}>{t("You can turn it on in Settings, or find your watch by name. Both give you the same value.")}</Text>
        </View>
        <BottomCTA secondary={<Button title={t("Open Settings")} kind="ghost" onPress={() => Linking.openSettings()} />}>
          <Button title={t("Find my watch by name")} icon="search" onPress={() => go('search')} />
        </BottomCTA>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {onboarded ? <View style={{ paddingHorizontal: 24, height: 44, justifyContent: 'center' }}><RoundButton icon="back" onPress={() => go('home')} label={t("Back")} /></View> : <TopBar step={5} onBack={() => go('plan')} />}
      <View style={{ flex: 1, paddingHorizontal: 24, alignItems: 'center' }}>
        <Enter style={{ marginTop: 16 }}>
          <View style={{ width: 210, height: 270, borderRadius: 38, backgroundColor: C.ink, padding: 10, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 14 } }}>
            <View style={{ flex: 1, borderRadius: 30, backgroundColor: '#26291F', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <View style={{ transform: [{ rotate: '-6deg' }] }}><WatchArt size={118} /></View>
              <View style={{ position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: '#D9B26A', borderStyle: 'dashed' }} />
            </View>
          </View>
        </Enter>
        <Text style={[T.h2, { marginTop: 28, textAlign: 'center' }]}>{t("We only need the dial.")}</Text>
        <Text style={[T.sub, { textAlign: 'center' }]}>{t("Crown uses your camera to read the dial and match the exact reference.")}</Text>
        <View style={{ alignSelf: 'stretch', gap: 12, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Icon name="phone" size={20} color={C.green} /><Text style={[T.body, { fontFamily: F.semibold }]}>{t("Photos stay on your phone")}</Text></View>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Icon name="eye" size={20} color={C.green} /><Text style={[T.body, { fontFamily: F.semibold }]}>{t("Only used while you scan")}</Text></View>
        </View>
      </View>
      <BottomCTA secondary={<Button title={t("Not now, search by name")} kind="ghost" onPress={() => go('search')} />}>
        <Button title={t("Allow camera")} onPress={ask} />
      </BottomCTA>
    </View>
  );
}

// ---------- 6a. Camera ----------
export function Camera() {
  const { go, setScan, onboarded, aiConsent, setAiConsent } = useStore();
  const cam = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [perm, requestPerm] = useCameraPermissions();
  const [attempt, setAttempt] = useState(0);
  const [slow, setSlow] = useState(false);
  // iPhone home-screen apps sometimes show a black camera after an update; offer a way out
  useEffect(() => { setSlow(false); const id = setTimeout(() => setSlow(true), 3500); return () => clearTimeout(id); }, [attempt]);
  useEffect(() => { if (perm && !perm.granted && perm.canAskAgain) requestPerm(); }, [perm?.granted]);
  const retryCamera = async () => { Haptics.selectionAsync(); setReady(false); await requestPerm(); setAttempt(a => a + 1); };
  const [busy, setBusy] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
    ])).start();
  }, []);

  const shoot = async () => {
    if (busy) return;
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let photo: string | undefined;
    try {
      const p = ready ? await cam.current?.takePictureAsync({ quality: 0.8 }) : undefined;
      photo = p?.uri ? await shrink(p.uri) : undefined;
    } catch {
      photo = undefined; // fall back to the illustration
    }
    setScan({ photo });
    go('analysing');
  };

  const fromLibrary = async () => {
    if (busy) return;
    const photo = await pickPhoto();
    if (!photo) return;
    setScan({ photo });
    go('analysing');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.night }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: 44 }}>
        <RoundButton icon="close" dark onPress={() => go(onboarded ? 'home' : 'plan')} label={t("Close camera")} />
        <Text style={{ fontFamily: F.bold, fontSize: 16, color: C.nightText }}>{t("Scan your watch")}</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={{ flex: 1, marginTop: 8, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
        <CameraView key={attempt} ref={cam} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} facing="back" onCameraReady={() => setReady(true)} />
        <Animated.View style={{ opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }) }}>
          <Svg width={290} height={290} viewBox="0 0 290 290">
            <Circle cx={145} cy={145} r={132} fill="none" stroke="rgba(243,239,230,.45)" strokeWidth={1.5} strokeDasharray="4 8" />
            {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => (
              <Path key={i} d={`M${x ? 286 : 4} ${y ? 250 : 40} V${y ? 286 : 4} H${x ? 250 : 40}`} fill="none" stroke="#D9B26A" strokeWidth={4} strokeLinecap="round" />
            ))}
          </Svg>
        </Animated.View>
        {!ready && slow ? (
          <View style={{ position: 'absolute', top: 24, left: 24, right: 24, padding: 16, borderRadius: 16, backgroundColor: 'rgba(14,16,13,.85)', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontFamily: F.semibold, fontSize: 14, color: C.nightText, textAlign: 'center' }}>{perm && !perm.granted ? 'Crown needs camera access to scan.' : 'Camera not showing?'}</Text>
            <Pressable onPress={retryCamera} accessibilityRole="button" style={{ paddingHorizontal: 18, height: 38, borderRadius: 19, backgroundColor: C.green, justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.bold, fontSize: 14, color: C.onPrimary }}>{perm && !perm.granted ? 'Allow camera' : 'Try again'}</Text>
            </Pressable>
            <Text style={{ fontFamily: F.regular, fontSize: 12, color: C.nightStone, textAlign: 'center' }}>If it stays black, close Crown completely and open it again, or use Photos below.</Text>
          </View>
        ) : null}
        <View style={{ position: 'absolute', bottom: 28, backgroundColor: 'rgba(14,16,13,.75)', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 18 }}>
          <Text style={{ fontFamily: F.semibold, fontSize: 14, color: C.nightText }}>{t("Center the dial in the frame")}</Text>
        </View>
      </View>
      <View style={{ height: 150, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
        <Pressable onPress={() => go('search')} accessibilityLabel={t("Search by name")} style={{ width: 52, alignItems: 'center', gap: 4 }}>
          <Icon name="search" size={24} color={C.nightText} />
          <Text style={{ fontFamily: F.semibold, fontSize: 11, color: C.nightStone }}>{t("By name")}</Text>
        </Pressable>
        <Pressable onPress={shoot} accessibilityRole="button" accessibilityLabel={t("Take photo")} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: C.nightText, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: busy ? C.brass : C.nightText }} />
        </Pressable>
        <Pressable onPress={fromLibrary} accessibilityLabel={t("Choose a photo")} style={{ width: 52, alignItems: 'center', gap: 4 }}>
          <Icon name="image" size={24} color={C.nightText} />
          <Text style={{ fontFamily: F.semibold, fontSize: 11, color: C.nightStone }}>{t("Photos")}</Text>
        </Pressable>
      </View>
      {!aiConsent ? <ConsentSheet onAgree={() => { Haptics.selectionAsync(); setAiConsent(true); }} onLater={() => go(onboarded ? 'home' : 'plan')} /> : null}
    </View>
  );
}

// Shown once, before the first scan: what happens to the photo.
function ConsentSheet({ onAgree, onLater }: { onAgree: () => void; onLater: () => void }) {
  const rows = [
    { i: 'scan', t: 'To identify your watch, Crown sends the photo you take to Google Gemini, a third-party AI service. It is used only to name the model.' },
    { i: 'info', t: 'On the free version of this service, Google may use photos to improve its products. Avoid photos that show people or personal details.' },
    { i: 'trash', t: t('Your photos stay in your collection on this phone. Remove a watch or reset Crown to delete them.') },
  ];
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,.55)', justifyContent: 'flex-end' }}>
      <Enter>
        <View style={{ backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 12 }}>
          <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: C.line, marginBottom: 18 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="eye" size={22} color={C.brassInk} />
            <Text style={[T.b, { fontSize: 18 }]}>{t("How your photo is used")}</Text>
          </View>
          <View style={{ gap: 14, marginTop: 18 }}>
            {rows.map(r => (
              <View key={r.i} style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: C.brassSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name={r.i} size={16} color={C.brassInk} /></View>
                <Text style={[T.small, { flex: 1, fontSize: 13.5, lineHeight: 19, color: C.ink }]}>{r.t}</Text>
              </View>
            ))}
          </View>
          <View style={{ marginTop: 22 }}>
            <BottomCTA secondary={<Button title={t("Not now")} kind="ghost" onPress={onLater} />}>
              <Button title={t("Agree and continue")} onPress={onAgree} />
            </BottomCTA>
          </View>
        </View>
      </Enter>
    </View>
  );
}

// ---------- 6b. Analysing ----------
export function Analysing() {
  const { go, scan, setScan, answers, scanCount, bumpScan, accessCode, deviceId } = useStore();
  const [step, setStep] = useState(0);
  const sweep = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(sweep, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(sweep, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ])).start();
    const t1 = setTimeout(() => { setStep(1); Haptics.selectionAsync(); }, 800);
    const t2 = setTimeout(() => { setStep(2); Haptics.selectionAsync(); }, 1600);
    const started = Date.now();
    // live recognition: send the photo to Gemini through the proxy, keep the animation at least 2.5 s
    if (LIVE_SCAN && scan.photo) {
      let alive = true;
      identifyPhoto(scan.photo, accessCode ?? '', deviceId ?? '')
        // retry once, but not when a limit was reached
        .catch((e: Error) => / 429/.test(String(e?.message)) ? Promise.reject(e) : new Promise(r => setTimeout(r, 800)).then(() => identifyPhoto(scan.photo!, accessCode ?? '', deviceId ?? '')))
        .then(async res => {
          await new Promise(r => setTimeout(r, Math.max(0, 2500 - (Date.now() - started))));
          if (!alive) return;
          bumpScan();
          if (!res.isWatch) { setScan({ ...scan, notWatch: true }); go('result'); return; }
          const best = matchModel(res);
          const alts = res.alternatives.map(matchModel).filter((m): m is NonNullable<typeof m> => !!m && m.id !== best?.id);
          if (best && res.confidence >= 80) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setScan({ ...scan, model: best, confidence: res.confidence, confirmed: false, scansLeft: res.scansLeft });
            go('result');
          } else if (best || alts.length) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setScan({ ...scan, options: [best, ...alts].filter((m): m is NonNullable<typeof m> => !!m).slice(0, 3), confidence: res.confidence });
            go('partial');
          } else if (res.brand) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setScan({ ...scan, model: customModel(res), confidence: res.confidence, confirmed: false, scansLeft: res.scansLeft });
            go('result');
          } else {
            setScan({ ...scan, unknown: { brand: res.brand, model: res.model, reference: res.reference } });
            go('result');
          }
        })
        .catch((e: Error) => { if (alive) { setScan({ ...scan, failed: true, error: String(e?.message ?? e).slice(0, 40) }); go('result'); } });
      return () => { alive = false; clearTimeout(t1); clearTimeout(t2); };
    }
    const t3 = setTimeout(() => {
      const r = recognise(answers, scanCount);
      bumpScan();
      if (r.kind === 'high') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setScan({ ...scan, model: r.model, confidence: r.confidence, confirmed: false });
        go('result');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setScan({ ...scan, options: r.options, confidence: r.confidence });
        go('partial');
      }
    }, 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  const steps = [t('Reading the dial'), t('Matching the reference'), t('Checking 12 months of prices')];
  return (
    <View style={{ flex: 1, backgroundColor: C.night, alignItems: 'center' }}>
      <View style={{ height: 44, justifyContent: 'center' }}><Text style={{ fontFamily: F.bold, fontSize: 16, color: C.nightText }}>{t("Analysing")}</Text></View>
      <View style={{ width: 280, height: 280, borderRadius: 140, overflow: 'hidden', marginTop: 30, backgroundColor: '#20231C', alignItems: 'center', justifyContent: 'center' }}>
        {scan.photo ? <Image source={{ uri: scan.photo }} style={{ width: 280, height: 280 }} /> : <View style={{ transform: [{ rotate: '-10deg' }, { translateY: 28 }] }}><WatchArt size={230} /></View>}
        <Animated.View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 3, backgroundColor: '#D9B26A', shadowColor: '#D9B26A', shadowOpacity: 0.9, shadowRadius: 12, transform: [{ translateY: sweep.interpolate({ inputRange: [0, 1], outputRange: [20, 260] }) }] }} />
      </View>
      <View style={{ alignSelf: 'stretch', marginTop: 44, paddingHorizontal: 24, gap: 18 }}>
        {steps.map((s, i) => (
          <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, opacity: i <= step ? 1 : 0.35 }}>
            {i < step
              ? <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#3F8A6C', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={16} color={C.nightText} w={2.4} /></View>
              : i === step ? <View style={{ width: 26, height: 26, alignItems: 'center', justifyContent: 'center' }}><Spinner color="#D9B26A" size={24} /></View>
                : <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: 'rgba(243,239,230,.3)' }} />}
            <Text style={{ fontFamily: F.semibold, fontSize: 16, color: C.nightText }}>{s}</Text>
          </View>
        ))}
      </View>
      <Text style={{ marginTop: 28, fontFamily: F.regular, fontSize: 13, color: C.nightStone }}>{t("Usually under 3 seconds")}</Text>
    </View>
  );
}

// ---------- 7. Result (aha) ----------
export function Result() {
  const { go, scan, answers, addWatch, onboarded, finishOnboarding, pro, giveFeedback, addWish, wishes, openGuide } = useStore();
  const [why, setWhy] = useState(false);
  const [vote, setVote] = useState<'yes' | 'no' | null>(null);
  const m = scan.model;
  useAutoMarket(m ? [m] : []);
  if (!m) return <NoMatch />;
  const v = valueOf(m, answers.papers);
  const ch = change12(m);
  const papersText = answers.papers === 'Yes' ? t('full box and papers') : answers.papers === 'Some' ? t('some box and papers') : t('no box or papers');
  const add = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addWatch(m, scan.photo);
    if (!onboarded) {
      finishOnboarding();
      go(pro ? 'home' : 'paywall');
    } else go('home');
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: 44 }}>
        <RoundButton icon="close" onPress={() => go(onboarded ? 'home' : 'plan')} label={t("Close")} />
        <Text style={{ fontFamily: F.bold, fontSize: 16, color: C.ink }}>{t("Your watch")}</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        <View style={{ height: 230, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: C.halo }} />
          {scan.photo
            ? <Image source={{ uri: scan.photo }} style={{ width: 190, height: 190, borderRadius: 95, borderWidth: 4, borderColor: C.surface }} />
            : <Enter><WatchThumb brand={m.brand} size={170} radius={85} /></Enter>}
          <View style={{ position: 'absolute', bottom: 2 }}>
            <Pill text={scan.confirmed ? t('Chosen by you') : t('High match · {n}%', { n: scan.confidence ?? 94 })} bg={C.green} fg={C.onPrimary} icon="check" />
          </View>
        </View>
        {typeof scan.scansLeft === 'number' ? <Text style={[T.small, { textAlign: 'center', marginTop: 10, fontSize: 12 }]}>{scan.scansLeft === 1 ? '1 free scan left today' : `${scan.scansLeft} free scans left today`}</Text> : null}
        <Enter delay={150} style={{ alignItems: 'center', paddingHorizontal: 24, marginTop: 16 }}>
          <Text style={[T.label, { fontSize: 13 }]}>{m.brand.toUpperCase()}</Text>
          <Text style={{ fontFamily: F.serif, ...display(32), lineHeight: 36, color: C.ink, textAlign: 'center' }}>{m.name}</Text>
          <Text style={[T.small, { marginTop: 4 }]}>{m.ref} · {m.size} · {t(m.material)}</Text>
        </Enter>
        {hasPrice(m) ? (
        <Enter delay={300} style={{ paddingHorizontal: 24, marginTop: 18 }}>
          <Card style={{ padding: 18, paddingBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={T.label}>{t("WORTH TODAY")}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <CountUp to={Math.round(v.low / 50) * 50} style={{ fontFamily: F.serif, ...display(34), lineHeight: 40, color: C.ink }} />
                  <Text style={{ fontFamily: F.serif, ...display(34), lineHeight: 40, color: C.ink }}>–{num(Math.round(v.high / 50) * 50)}</Text>
                </View>
                <Text style={[T.small, { fontSize: 12.5 }]}>{t('Good condition')} · {papersText}</Text>
              </View>
              {m.history.length ? <Pill text={pct(ch)} bg={ch >= 0 ? C.upSoft : C.downSoft} fg={ch >= 0 ? C.up : C.down} /> : null}
            </View>
            {m.history.length ? <>
            <View style={{ marginTop: 12 }}><LineChart data={m.history} width={300} height={58} color={ch >= 0 ? C.up : C.down} /></View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={[T.small, { fontSize: 11.5 }]}>{t("Oct 2025")}</Text>
              <Pressable onPress={() => setWhy(w => !w)} hitSlop={8}><Text style={{ fontFamily: F.bold, fontSize: 12, color: C.green }}>{why ? t('Hide') : t('Why this range?')}</Text></Pressable>
              <Text style={[T.small, { fontSize: 11.5 }]}>{t("Today")}</Text>
            </View>
            </> : <Text style={[T.small, { fontSize: 11.5, marginTop: 8 }]}>Typical eBay asking price, adjusted for box and papers.</Text>}
            {m.history.length && why ? (
              <Text style={[T.small, { marginTop: 10 }]}>{t('Median of listed prices for {ref} over the last 30 days,', { ref: m.ref })} {answers.papers === 'Yes' ? t('plus about 6% for a full set') : answers.papers === 'No' ? t('minus about 7% for no box or papers') : t('as listed for a partial set')}{t(". The range covers the middle of the market. Demo data.")}</Text>
            ) : null}
          </Card>
        </Enter>
        ) : (
        <Enter delay={300} style={{ paddingHorizontal: 24, marginTop: 18 }}>
          <Card style={{ padding: 18 }}>
            <Text style={T.label}>NO PRICE YET</Text>
            <Text style={[T.body, { marginTop: 6 }]}>We recognised this watch, but we don't have market prices for it yet.</Text>
            <Text style={[T.small, { marginTop: 6 }]}>Add it to keep it in your collection. Its value will appear as soon as Crown has market data for this model.</Text>
          </Card>
        </Enter>
        )}
        <Enter delay={400} style={{ paddingHorizontal: 24, marginTop: 10 }}>
          <Pressable onPress={() => openGuide('fake')} accessibilityRole="button">
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 4 }}>
              <Icon name="info" size={15} color={C.stone} />
              <Text style={[T.small, { flex: 1, fontSize: 12 }]}>{t('Crown identifies the model from the photo. It cannot tell if a watch is genuine.')} <Text style={{ fontFamily: F.bold, color: C.green }}>{t('How to check')}</Text></Text>
            </View>
          </Pressable>
        </Enter>
        <Enter delay={450} style={{ paddingHorizontal: 24, marginTop: 4 }}>
          {onboarded ? (
            <Pressable onPress={() => { Haptics.selectionAsync(); addWish(m); go('wishlist'); }} hitSlop={8} style={{ alignSelf: 'center', marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="heart" size={15} color={C.down} />
              <Text style={{ fontFamily: F.bold, fontSize: 13.5, color: C.down }}>{wishes.some(w => w.modelId === m.id) ? t('On your wishlist') : t('Not yours yet? Add to wishlist')}</Text>
            </Pressable>
          ) : null}
        </Enter>
      </ScrollView>
      <BottomCTA secondary={<MatchFeedback vote={vote} onVote={v => { Haptics.selectionAsync(); setVote(v); giveFeedback(v === 'yes'); }} onScan={() => go('priming')} onSearch={() => go('search')} />}>
        <Button title={t("Add to my collection")} onPress={add} />
      </BottomCTA>
    </View>
  );
}

// Sits in the fixed slot under the main button, so it is always visible without scrolling.
function MatchFeedback({ vote, onVote, onScan, onSearch }: { vote: 'yes' | 'no' | null; onVote: (v: 'yes' | 'no') => void; onScan: () => void; onSearch: () => void }) {
  const chip = (label: string, icon: string, onPress: () => void, flip?: boolean, strong?: boolean) => (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}>
      <View style={{ height: 36, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: strong ? C.green : C.line, backgroundColor: strong ? C.greenSoft : C.surface, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ transform: [{ rotate: flip ? '180deg' : '0deg' }] }}><Icon name={icon} size={15} color={strong ? C.green : C.ink} /></View>
        <Text style={{ fontFamily: F.bold, fontSize: 13.5, color: strong ? C.green : C.ink }}>{label}</Text>
      </View>
    </Pressable>
  );
  if (vote === 'yes') return <Text style={{ fontFamily: F.semibold, fontSize: 14, color: C.stone, textAlign: 'center' }}>{t("Thanks. That helps us match better.")}</Text>;
  if (vote === 'no') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {chip(t('Scan again'), 'refresh', onScan, false, true)}
        {chip(t('Search by name'), 'search', onSearch, false, true)}
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Text style={{ fontFamily: F.semibold, fontSize: 14, color: C.ink }}>{t("Right watch?")}</Text>
      {chip(t('Yes'), 'thumb', () => onVote('yes'))}
      {chip(t('No'), 'thumb', () => onVote('no'), true)}
    </View>
  );
}

// live recognition without a usable catalogue match: say exactly what happened
function NoMatch() {
  const { go, scan } = useStore();
  const u = scan.unknown;
  const locked = scan.failed && !!scan.error?.includes('daily-limit');
  const busy = scan.failed && !locked && !!scan.error?.includes('429');
  const title = locked ? "You've used today's 3 free scans." : busy ? 'Too many scans in a row.' : scan.notWatch ? "We couldn't see a watch." : scan.failed ? "We couldn't reach the scanner." : u ? 'We know this one, but not its price yet.' : 'We lost that scan.';
  const sub = locked ? 'Come back tomorrow for 3 more. You can still find your watch by name.' : busy ? 'Wait a minute, then try again.' : scan.notWatch
    ? 'Fill the frame with the dial, straight on, in soft light.'
    : scan.failed
      ? 'Check your connection and try again. Nothing was saved.'
      : u
        ? `Crown recognised ${[u.brand, u.model, u.reference].filter(Boolean).join(' ')}. Prices for this model are coming soon. You can still search for a close match.`
        : 'Nothing was saved. Try the photo again.';
  const code = scan.failed && scan.error && !locked && !busy ? ` (${scan.error})` : '';
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Icon name={u ? 'watch' : 'alert'} size={36} color={C.brassInk} />
      <Text style={[T.h2, { textAlign: 'center', marginTop: 16 }]}>{title}</Text>
      <Text style={[T.sub, { textAlign: 'center' }]}>{sub}</Text>
      {code ? <Text style={[T.small, { marginTop: 8, fontSize: 11 }]}>Error{code}</Text> : null}
      <Button title="Scan again" icon="refresh" onPress={() => go('priming')} style={{ marginTop: 24, paddingHorizontal: 32 }} />
      <Button title="Search by name" kind="ghost" onPress={() => go('search')} />
    </View>
  );
}

function EmptyResult() {
  const { go } = useStore();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Icon name="alert" size={36} color={C.brassInk} />
      <Text style={[T.h2, { textAlign: 'center', marginTop: 16 }]}>{t("We lost that scan.")}</Text>
      <Text style={[T.sub, { textAlign: 'center' }]}>{t("Nothing was saved. Try the photo again.")}</Text>
      <Button title={t("Scan again")} icon="refresh" onPress={() => go('camera')} style={{ marginTop: 24, paddingHorizontal: 32 }} />
    </View>
  );
}

// ---------- 7b. Partial match ----------
export function Partial() {
  const { go, scan, setScan } = useStore();
  const opts = scan.options ?? [];
  const [sel, setSel] = useState(opts[0]?.id);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: 44 }}>
        <RoundButton icon="close" onPress={() => go('camera')} label={t("Close")} />
        <Text style={{ fontFamily: F.bold, fontSize: 16, color: C.ink }}>{t("Almost there")}</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
        <Pill text={t('Partial match · {n}%', { n: scan.confidence ?? 61 })} bg={C.brassSoft} fg={C.brassInk} icon="info" />
        <Text style={[T.h2, { marginTop: 14 }]}>{t("Is this your watch?")}</Text>
        <Text style={[T.sub, { marginBottom: 20 }]}>{t("We'd rather ask than show you the wrong price.")}</Text>
        {opts.map((m, i) => {
          const s = sel === m.id;
          return (
            <Enter key={m.id} delay={80 * i}>
              <Pressable onPress={() => { Haptics.selectionAsync(); setSel(m.id); }} accessibilityRole="radio" accessibilityState={{ selected: s }}>
                <Card selected={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: s ? 15 : 16, marginBottom: 12 }}>
                  <WatchThumb brand={m.brand} size={52} radius={14} />
                  <View style={{ flex: 1 }}>
                    <Text style={[T.label, { color: C.ink }]}>{m.brand.toUpperCase()}</Text>
                    <Text style={T.b}>{m.name}</Text>
                    <Text style={T.small}>{m.ref}</Text>
                  </View>
                  <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: s ? 7 : 2, borderColor: s ? C.green : C.line }} />
                </Card>
              </Pressable>
            </Enter>
          );
        })}
      </View>
      <BottomCTA secondary={<Button title={t("None of these, search by name")} kind="ghost" onPress={() => go('search')} />}>
        <Button title={t("Yes, show my value")} disabled={!sel} onPress={() => { setScan({ ...scan, model: opts.find(o => o.id === sel), confirmed: true }); go('result'); }} />
      </BottomCTA>
    </View>
  );
}

// ---------- Search by name (fallback for camera off / wrong match) ----------
export function Search() {
  const { go, setScan, onboarded } = useStore();
  const [q, setQ] = useState('');
  const list = MODELS.filter(m => (m.brand + ' ' + m.name + ' ' + m.ref).toLowerCase().includes(q.trim().toLowerCase()));
  const { scan, searchFor, setSearchFor, addWish } = useStore();
  const wish = searchFor === 'wish';
  const pick = (m: Model) => {
    Haptics.selectionAsync();
    if (wish) { addWish(m); setSearchFor('collection'); go('wishlist'); return; }
    setScan({ photo: scan.photo, model: m, confirmed: true });
    go('result');
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, height: 44 }}>
        <RoundButton icon="back" onPress={() => { if (wish) { setSearchFor('collection'); go('wishlist'); } else go(onboarded ? 'home' : 'priming'); }} label={t("Back")} />
        <Text style={{ fontFamily: F.bold, fontSize: 16, color: C.ink }}>{wish ? t('Add to wishlist') : t('Find your watch')}</Text>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, paddingHorizontal: 14 }}>
          <Icon name="search" size={20} color={C.stone} />
          <TextInput value={q} onChangeText={setQ} autoFocus placeholder={t("Brand, model or reference")} placeholderTextColor={C.stone} style={{ flex: 1, fontFamily: F.medium, fontSize: 16, color: C.ink }} autoCorrect={false} />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 12 }} keyboardShouldPersistTaps="handled">
        {list.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Icon name="watch" size={36} color={C.stone} />
            <Text style={[T.b, { marginTop: 12 }]}>{t("No match for \"")}{q}"</Text>
            <Text style={[T.small, { textAlign: 'center', marginTop: 4 }]}>{t("Try the reference number from the case back, like 126610LN.")}</Text>
          </View>
        ) : list.map(m => (
          <Pressable key={m.id} onPress={() => pick(m)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line }}>
              <WatchThumb brand={m.brand} size={44} radius={12} />
              <View style={{ flex: 1 }}>
                <Text style={[T.b, { fontSize: 15 }]}>{m.brand} {m.name}</Text>
                <Text style={T.small}>{m.ref}</Text>
              </View>
              <Text style={{ fontFamily: F.serif, ...display(18), color: C.ink }}>{money(m.history[12])}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
