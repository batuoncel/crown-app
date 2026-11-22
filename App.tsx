import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { C, F } from './src/theme';
import { MODELS } from './src/data';
import { WatchArt } from './src/ui';
import { Route, StoreProvider, useStore } from './src/store';
import { About, Goal, Plan, PlanLoading, Promise_ } from './src/screens/Onboarding';
import { Analysing, Camera, Partial, Priming, Result, Search } from './src/screens/Scan';
import { Alerts, Home, Paywall, ProWelcome } from './src/screens/Home';
import { Settings, Share_, WatchDetail } from './src/screens/Watch';
import { Awards } from './src/screens/Awards';
import { GuideScreen } from './src/screens/Guide';
import { Wishlist } from './src/screens/Wishlist';

const SCREENS: Record<Route, React.ComponentType> = {
  promise: Promise_, goal: Goal, about: About, planLoading: PlanLoading, plan: Plan,
  priming: Priming, camera: Camera, analysing: Analysing, result: Result, partial: Partial, search: Search,
  paywall: Paywall, proWelcome: ProWelcome, home: Home, alerts: Alerts,
  watch: WatchDetail, share: Share_, settings: Settings, awards: Awards, guide: GuideScreen, wishlist: Wishlist,
};
const DARK: Route[] = ['camera', 'analysing', 'proWelcome'];

function Router() {
  const { route, ready, theme, currency } = useStore();
  const insets = useSafeAreaInsets();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [route, theme]);
  if (!ready) return <Splash />;
  const Screen = SCREENS[route];
  const dark = DARK.includes(route);
  const bg = route === 'proWelcome' ? C.green : dark ? C.night : C.paper;
  return (
    <View style={{ flex: 1, backgroundColor: bg, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <StatusBar style={dark || theme === 'navy' ? 'light' : 'dark'} />
      <Animated.View style={{ flex: 1, opacity: a, transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }}>
        <Screen key={route + theme + currency} />
      </Animated.View>
    </View>
  );
}

function Splash() {
  return (
    <View style={{ flex: 1, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={C.green} />
    </View>
  );
}

// Web-only design sheet: /crown-app/?gallery shows every watch drawing.
function Gallery() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.paper }} contentContainerStyle={{ padding: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
      <View style={{ alignItems: 'center', width: 150 }}><WatchArt size={110} /><Text style={{ fontFamily: F.bold, fontSize: 12, color: C.ink, marginTop: 8 }}>Default (hero)</Text></View>
      {MODELS.map(m => (
        <View key={m.id} style={{ alignItems: 'center', width: 150 }}>
          <WatchArt size={120} strap={false} look={m} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}><WatchArt size={46} strap={false} look={m} /><WatchArt size={28} strap={false} look={m} /></View>
          <Text style={{ fontFamily: F.bold, fontSize: 12, color: C.ink, marginTop: 6, textAlign: 'center' }}>{m.brand} {m.name}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
const GALLERY = Platform.OS === 'web' && typeof window !== 'undefined' && window.location.search.includes('gallery');

export default function App() {
  const [loaded, fontError] = useFonts({ InstrumentSerif_400Regular, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold });
  // Don't block on fonts: in-app browsers can stall or fail the first font load. Fall back after a short wait.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 2500);
    return () => clearTimeout(t);
  }, []);
  return (
    <SafeAreaProvider>
      {GALLERY && (loaded || timedOut) ? <Gallery /> : loaded || fontError || timedOut ? (
        <StoreProvider>
          <Router />
        </StoreProvider>
      ) : (
        <Splash />
      )}
    </SafeAreaProvider>
  );
}
