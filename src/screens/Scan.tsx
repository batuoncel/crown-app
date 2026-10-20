import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Path } from 'react-native-svg';
import { C, F, display, money, pct } from '../theme';
import { Button, Card, CountUp, Enter, Icon, LineChart, Pill, RoundButton, T, WatchArt } from '../ui';
import { change12, Model, MODELS, recognise, valueOf } from '../data';
import { useStore } from '../store';
import { Spinner, TopBar } from './Onboarding';

// ---------- 5. Camera priming (+ denied state) ----------
export function Priming() {
  const { go, onboarded } = useStore();
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
        {onboarded ? <View style={{ paddingHorizontal: 24, height: 44, justifyContent: 'center' }}><RoundButton icon="back" onPress={() => go('home')} label="Back" /></View> : <TopBar step={5} onBack={() => go('plan')} />}
        <View style={{ flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.brassSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="alert" size={32} color={C.brassInk} /></View>
          <Text style={[T.h2, { marginTop: 24, textAlign: 'center' }]}>The camera is off.</Text>
          <Text style={[T.sub, { textAlign: 'center' }]}>You can turn it on in Settings, or find your watch by name. Both give you the same value.</Text>
        </View>
        <View style={{ padding: 24, paddingBottom: 12 }}>
          <Button title="Find my watch by name" icon="search" onPress={() => go('search')} />
          <Button title="Open Settings" kind="ghost" onPress={() => Linking.openSettings()} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {onboarded ? <View style={{ paddingHorizontal: 24, height: 44, justifyContent: 'center' }}><RoundButton icon="back" onPress={() => go('home')} label="Back" /></View> : <TopBar step={5} onBack={() => go('plan')} />}
      <View style={{ flex: 1, paddingHorizontal: 24, alignItems: 'center' }}>
        <Enter style={{ marginTop: 16 }}>
          <View style={{ width: 210, height: 270, borderRadius: 38, backgroundColor: C.ink, padding: 10, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 14 } }}>
            <View style={{ flex: 1, borderRadius: 30, backgroundColor: '#26291F', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <View style={{ transform: [{ rotate: '-6deg' }] }}><WatchArt size={118} /></View>
              <View style={{ position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: '#D9B26A', borderStyle: 'dashed' }} />
            </View>
          </View>
        </Enter>
        <Text style={[T.h2, { marginTop: 28, textAlign: 'center' }]}>We only need the dial.</Text>
        <Text style={[T.sub, { textAlign: 'center' }]}>Crown uses your camera to read the dial and match the exact reference.</Text>
        <View style={{ alignSelf: 'stretch', gap: 12, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Icon name="phone" size={20} color={C.green} /><Text style={[T.body, { fontFamily: F.semibold }]}>Photos stay on your phone</Text></View>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Icon name="eye" size={20} color={C.green} /><Text style={[T.body, { fontFamily: F.semibold }]}>Only used while you scan</Text></View>
        </View>
      </View>
      <View style={{ padding: 24, paddingBottom: 12 }}>
        <Button title="Allow camera" onPress={ask} />
        <Button title="Not now, search by name" kind="ghost" onPress={() => go('search')} />
      </View>
    </View>
  );
}

// ---------- 6a. Camera ----------
export function Camera() {
  const { go, setScan, onboarded } = useStore();
  const cam = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
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
      const p = ready ? await cam.current?.takePictureAsync({ quality: 0.6 }) : undefined;
      photo = p?.uri;
    } catch {
      photo = undefined; // fall back to the illustration
    }
    setScan({ photo });
    go('analysing');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.night }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: 44 }}>
        <RoundButton icon="close" dark onPress={() => go(onboarded ? 'home' : 'plan')} label="Close camera" />
        <Text style={{ fontFamily: F.bold, fontSize: 16, color: C.nightText }}>Scan your watch</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={{ flex: 1, marginTop: 8, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
        <CameraView ref={cam} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} facing="back" onCameraReady={() => setReady(true)} />
        <Animated.View style={{ opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }) }}>
          <Svg width={290} height={290} viewBox="0 0 290 290">
            <Circle cx={145} cy={145} r={132} fill="none" stroke="rgba(243,239,230,.45)" strokeWidth={1.5} strokeDasharray="4 8" />
            {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => (
              <Path key={i} d={`M${x ? 286 : 4} ${y ? 250 : 40} V${y ? 286 : 4} H${x ? 250 : 40}`} fill="none" stroke="#D9B26A" strokeWidth={4} strokeLinecap="round" />
            ))}
          </Svg>
        </Animated.View>
        <View style={{ position: 'absolute', bottom: 28, backgroundColor: 'rgba(14,16,13,.75)', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 18 }}>
          <Text style={{ fontFamily: F.semibold, fontSize: 14, color: C.nightText }}>Center the dial in the frame</Text>
        </View>
      </View>
      <View style={{ height: 150, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
        <Pressable onPress={() => go('search')} accessibilityLabel="Search by name" style={{ width: 52, alignItems: 'center', gap: 4 }}>
          <Icon name="search" size={24} color={C.nightText} />
          <Text style={{ fontFamily: F.semibold, fontSize: 11, color: C.nightStone }}>By name</Text>
        </Pressable>
        <Pressable onPress={shoot} accessibilityRole="button" accessibilityLabel="Take photo" style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: C.nightText, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: busy ? C.brass : C.nightText }} />
        </Pressable>
        <View style={{ width: 52 }} />
      </View>
    </View>
  );
}

// ---------- 6b. Analysing ----------
export function Analysing() {
  const { go, scan, setScan, answers, scanCount, bumpScan } = useStore();
  const [step, setStep] = useState(0);
  const sweep = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(sweep, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(sweep, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ])).start();
    const t1 = setTimeout(() => { setStep(1); Haptics.selectionAsync(); }, 800);
    const t2 = setTimeout(() => { setStep(2); Haptics.selectionAsync(); }, 1600);
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
  const steps = ['Reading the dial', 'Matching the reference', 'Checking 12 months of prices'];
  return (
    <View style={{ flex: 1, backgroundColor: C.night, alignItems: 'center' }}>
      <View style={{ height: 44, justifyContent: 'center' }}><Text style={{ fontFamily: F.bold, fontSize: 16, color: C.nightText }}>Analysing</Text></View>
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
      <Text style={{ marginTop: 28, fontFamily: F.regular, fontSize: 13, color: C.nightStone }}>Usually under 3 seconds</Text>
    </View>
  );
}

// ---------- 7. Result (aha) ----------
export function Result() {
  const { go, scan, answers, addWatch, onboarded, finishOnboarding, pro } = useStore();
  const [why, setWhy] = useState(false);
  const m = scan.model;
  if (!m) return <EmptyResult />;
  const v = valueOf(m, answers.papers);
  const ch = change12(m);
  const papersText = answers.papers === 'Yes' ? 'full box and papers' : answers.papers === 'Some' ? 'some box and papers' : 'no box or papers';
  const add = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addWatch(m);
    if (!onboarded) {
      finishOnboarding();
      go(pro ? 'home' : 'paywall');
    } else go('home');
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: 44 }}>
        <RoundButton icon="close" onPress={() => go(onboarded ? 'home' : 'plan')} label="Close" />
        <Text style={{ fontFamily: F.bold, fontSize: 16, color: C.ink }}>Your watch</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        <View style={{ height: 230, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: C.halo }} />
          {scan.photo
            ? <Image source={{ uri: scan.photo }} style={{ width: 190, height: 190, borderRadius: 95, borderWidth: 4, borderColor: C.surface }} />
            : <Enter><View style={{ transform: [{ rotate: '-8deg' }] }}><WatchArt size={150} strap={false} dial={m.dial} dialHi={m.dialHi} /></View></Enter>}
          <View style={{ position: 'absolute', bottom: 2 }}>
            <Pill text={scan.confirmed ? 'Confirmed by you' : `High match · ${scan.confidence ?? 94}%`} bg={C.green} fg={C.onPrimary} icon="check" />
          </View>
        </View>
        <Enter delay={150} style={{ alignItems: 'center', paddingHorizontal: 24, marginTop: 16 }}>
          <Text style={[T.label, { fontSize: 13 }]}>{m.brand.toUpperCase()}</Text>
          <Text style={{ fontFamily: F.serif, ...display(32), lineHeight: 36, color: C.ink, textAlign: 'center' }}>{m.name}</Text>
          <Text style={[T.small, { marginTop: 4 }]}>{m.ref} · {m.size} · {m.material}</Text>
        </Enter>
        <Enter delay={300} style={{ paddingHorizontal: 24, marginTop: 18 }}>
          <Card style={{ padding: 18, paddingBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={T.label}>WORTH TODAY</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <CountUp to={Math.round(v.low / 50) * 50} style={{ fontFamily: F.serif, ...display(34), lineHeight: 40, color: C.ink }} />
                  <Text style={{ fontFamily: F.serif, ...display(34), lineHeight: 40, color: C.ink }}>–{(Math.round(v.high / 50) * 50).toLocaleString('en-US')}</Text>
                </View>
                <Text style={[T.small, { fontSize: 12.5 }]}>Good condition · {papersText}</Text>
              </View>
              <Pill text={pct(ch)} bg={ch >= 0 ? C.upSoft : C.downSoft} fg={ch >= 0 ? C.up : C.down} />
            </View>
            <View style={{ marginTop: 12 }}><LineChart data={m.history} width={300} height={58} color={ch >= 0 ? C.up : C.down} /></View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={[T.small, { fontSize: 11.5 }]}>Oct 2025</Text>
              <Pressable onPress={() => setWhy(w => !w)} hitSlop={8}><Text style={{ fontFamily: F.bold, fontSize: 12, color: C.green }}>{why ? 'Hide' : 'Why this range?'}</Text></Pressable>
              <Text style={[T.small, { fontSize: 11.5 }]}>Today</Text>
            </View>
            {why ? (
              <Text style={[T.small, { marginTop: 10 }]}>
                Median of listed prices for {m.ref} over the last 30 days, {answers.papers === 'Yes' ? 'plus about 6% for a full set' : answers.papers === 'No' ? 'minus about 7% for no box or papers' : 'as listed for a partial set'}. The range covers the middle of the market. Demo data.
              </Text>
            ) : null}
          </Card>
        </Enter>
      </ScrollView>
      <View style={{ padding: 24, paddingTop: 8, paddingBottom: 12 }}>
        <Button title="Add to my collection" onPress={add} />
        <Button title="Not my watch" kind="ghost" onPress={() => go('search')} />
      </View>
    </View>
  );
}

function EmptyResult() {
  const { go } = useStore();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Icon name="alert" size={36} color={C.brassInk} />
      <Text style={[T.h2, { textAlign: 'center', marginTop: 16 }]}>We lost that scan.</Text>
      <Text style={[T.sub, { textAlign: 'center' }]}>Nothing was saved. Try the photo again.</Text>
      <Button title="Scan again" icon="refresh" onPress={() => go('camera')} style={{ marginTop: 24, paddingHorizontal: 32 }} />
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
        <RoundButton icon="close" onPress={() => go('camera')} label="Close" />
        <Text style={{ fontFamily: F.bold, fontSize: 16, color: C.ink }}>Almost there</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
        <Pill text={`Partial match · ${scan.confidence ?? 61}%`} bg={C.brassSoft} fg={C.brassInk} icon="info" />
        <Text style={[T.h2, { marginTop: 14 }]}>Is this your watch?</Text>
        <Text style={[T.sub, { marginBottom: 20 }]}>We'd rather ask than show you the wrong price.</Text>
        {opts.map((m, i) => {
          const s = sel === m.id;
          return (
            <Enter key={m.id} delay={80 * i}>
              <Pressable onPress={() => { Haptics.selectionAsync(); setSel(m.id); }} accessibilityRole="radio" accessibilityState={{ selected: s }}>
                <Card selected={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: s ? 15 : 16, marginBottom: 12 }}>
                  <WatchArt size={58} strap={false} dial={m.dial} dialHi={m.dialHi} />
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
      <View style={{ padding: 24, paddingBottom: 12 }}>
        <Button title="Yes, show my value" disabled={!sel} onPress={() => { setScan({ ...scan, model: opts.find(o => o.id === sel), confirmed: true }); go('result'); }} />
        <Button title="None of these, search by name" kind="ghost" onPress={() => go('search')} />
      </View>
    </View>
  );
}

// ---------- Search by name (fallback for camera off / wrong match) ----------
export function Search() {
  const { go, setScan, onboarded } = useStore();
  const [q, setQ] = useState('');
  const list = MODELS.filter(m => (m.brand + ' ' + m.name + ' ' + m.ref).toLowerCase().includes(q.trim().toLowerCase()));
  const pick = (m: Model) => { Haptics.selectionAsync(); setScan({ model: m, confirmed: true }); go('result'); };
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, height: 44 }}>
        <RoundButton icon="back" onPress={() => go(onboarded ? 'home' : 'priming')} label="Back" />
        <Text style={{ fontFamily: F.bold, fontSize: 16, color: C.ink }}>Find your watch</Text>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, paddingHorizontal: 14 }}>
          <Icon name="search" size={20} color={C.stone} />
          <TextInput value={q} onChangeText={setQ} autoFocus placeholder="Brand, model or reference" placeholderTextColor={C.stone} style={{ flex: 1, fontFamily: F.medium, fontSize: 16, color: C.ink }} autoCorrect={false} />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 12 }} keyboardShouldPersistTaps="handled">
        {list.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Icon name="watch" size={36} color={C.stone} />
            <Text style={[T.b, { marginTop: 12 }]}>No match for "{q}"</Text>
            <Text style={[T.small, { textAlign: 'center', marginTop: 4 }]}>Try the reference number from the case back, like 126610LN.</Text>
          </View>
        ) : list.map(m => (
          <Pressable key={m.id} onPress={() => pick(m)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line }}>
              <WatchArt size={44} strap={false} dial={m.dial} dialHi={m.dialHi} />
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
