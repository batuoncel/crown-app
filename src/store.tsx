import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Answers, Condition, Model } from './data';
import { Currency, setCurrency, ThemeName } from './theme';
import { applyTheme } from './ui';

export type Route =
  | 'promise' | 'goal' | 'about' | 'planLoading' | 'plan'
  | 'priming' | 'camera' | 'analysing' | 'result' | 'partial' | 'search'
  | 'paywall' | 'proWelcome' | 'home' | 'alerts'
  | 'watch' | 'share' | 'settings' | 'awards' | 'guide' | 'wishlist';

// paid is stored in USD; papers overrides the onboarding answer for this watch
export type Owned = { modelId: string; addedAt: string; paid?: number; papers?: Answers['papers']; photo?: string; condition?: Condition; lastService?: string };
export type Wish = { modelId: string; addedAt: string; target?: number }; // target in USD

type Persisted = { answers: Answers; collection: Owned[]; pro: boolean; onboarded: boolean; scanCount: number; route: Route; theme: ThemeName; currency: Currency; detailId?: string; shared: number; seenAwards: string[]; guideId?: string; readGuides: string[];
  wishes: Wish[]; aiConsent: boolean; feedback: { yes: number; no: number }; lastOpen?: string; streak: number; bestStreak: number };

export type Scan = { photo?: string; model?: Model; options?: Model[]; confidence?: number; confirmed?: boolean };

type Store = Persisted & {
  ready: boolean;
  scan: Scan;
  go: (r: Route) => void;
  setAnswers: (a: Partial<Answers>) => void;
  toggleBrand: (b: string) => void;
  setScan: (s: Scan) => void;
  addWatch: (m: Model, photo?: string) => void;
  bumpShare: () => void;
  markAwardsSeen: (ids: string[]) => void;
  streakBonus: number | null;
  clearStreakBonus: () => void;
  showStreak: () => void;
  searchFor: 'collection' | 'wish';
  setSearchFor: (v: 'collection' | 'wish') => void;
  addWish: (m: Model) => void;
  removeWish: (id: string) => void;
  setWishTarget: (id: string, usd?: number) => void;
  setAiConsent: (v: boolean) => void;
  giveFeedback: (yes: boolean) => void;
  openGuide: (id: string) => void;
  markGuideRead: (id: string) => void;
  removeWatch: (modelId: string) => void;
  restoreWatch: (o: Owned, index: number) => void;
  setPro: (v: boolean) => void;
  finishOnboarding: () => void;
  bumpScan: () => void;
  reset: () => void;
  setTheme: (t: ThemeName) => void;
  setCurrencyPref: (c: Currency) => void;
  openWatch: (modelId: string, route?: Route) => void;
  updateWatch: (modelId: string, patch: Partial<Owned>) => void;
};

const KEY = 'reserve:v1';
const initial: Persisted = {
  answers: { goal: null, count: null, brands: [], papers: null },
  collection: [],
  pro: false,
  onboarded: false,
  scanCount: 0,
  route: 'promise',
  theme: 'classic',
  currency: 'USD',
  shared: 0,
  seenAwards: [],
  readGuides: [],
  wishes: [],
  aiConsent: false,
  feedback: { yes: 0, no: 0 },
  streak: 0,
  bestStreak: 0,
};

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

const Ctx = createContext<Store>(null as unknown as Store);
export const useStore = () => useContext(Ctx);

// routes that are safe to resume after the app is closed
const RESUMABLE: Route[] = ['promise', 'goal', 'about', 'plan', 'priming', 'paywall', 'home', 'alerts', 'settings', 'watch', 'awards', 'guide', 'wishlist'];

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<Persisted>(initial);
  const [ready, setReady] = useState(false);
  const [scan, setScan] = useState<Scan>({});
  const [streakBonus, setStreakBonus] = useState<number | null>(null);
  const [searchFor, setSearchFor] = useState<'collection' | 'wish'>('collection');
  const applied = useRef<ThemeName | null>(null);
  setCurrency(s.currency); // cheap; keeps money() in sync before children render
  if (applied.current !== s.theme) {
    applyTheme(s.theme); // before children render, so they read the right palette
    applied.current = s.theme;
  }

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(raw => {
        if (raw) {
          const saved = { ...initial, ...JSON.parse(raw) } as Persisted;
          if (!RESUMABLE.includes(saved.route)) saved.route = saved.onboarded ? 'home' : 'plan';
          if (saved.route === 'watch' && !saved.collection.some(o => o.modelId === saved.detailId)) saved.route = 'home';
          // daily streak: opening Crown on consecutive days
          const today = dayKey(new Date()), y = new Date(); y.setDate(y.getDate() - 1);
          if (saved.lastOpen !== today) {
            saved.streak = saved.lastOpen === dayKey(y) ? saved.streak + 1 : 1;
            saved.bestStreak = Math.max(saved.bestStreak, saved.streak);
            saved.lastOpen = today;
            if (saved.streak > 1 && saved.onboarded) setStreakBonus(saved.streak);
          }
          setS(saved);
        } else {
          setS(p => ({ ...p, lastOpen: dayKey(new Date()), streak: 1, bestStreak: 1 }));
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => {});
  }, [s, ready]);

  const store: Store = {
    ...s,
    ready,
    scan,
    go: route => setS(p => ({ ...p, route })),
    setAnswers: a => setS(p => ({ ...p, answers: { ...p.answers, ...a } })),
    toggleBrand: b => setS(p => {
      const has = p.answers.brands.includes(b);
      return { ...p, answers: { ...p.answers, brands: has ? p.answers.brands.filter(x => x !== b) : [...p.answers.brands, b] } };
    }),
    setScan,
    addWatch: (m, photo) => setS(p => {
      const prev = p.collection.find(o => o.modelId === m.id);
      const next: Owned = { ...prev, modelId: m.id, addedAt: prev?.addedAt ?? new Date().toISOString(), photo: photo ?? prev?.photo };
      return { ...p, collection: [...p.collection.filter(o => o.modelId !== m.id), next] };
    }),
    streakBonus,
    clearStreakBonus: () => setStreakBonus(null),
    showStreak: () => setStreakBonus(s.streak),
    searchFor,
    setSearchFor,
    addWish: m => setS(p => (p.wishes.some(w => w.modelId === m.id) ? p : { ...p, wishes: [...p.wishes, { modelId: m.id, addedAt: new Date().toISOString() }] })),
    removeWish: id => setS(p => ({ ...p, wishes: p.wishes.filter(w => w.modelId !== id) })),
    setWishTarget: (id, usd) => setS(p => ({ ...p, wishes: p.wishes.map(w => (w.modelId === id ? { ...w, target: usd } : w)) })),
    setAiConsent: v => setS(p => ({ ...p, aiConsent: v })),
    giveFeedback: yes => setS(p => ({ ...p, feedback: { yes: p.feedback.yes + (yes ? 1 : 0), no: p.feedback.no + (yes ? 0 : 1) } })),
    openGuide: guideId => setS(p => ({ ...p, guideId, route: 'guide' })),
    markGuideRead: id => setS(p => (p.readGuides.includes(id) ? p : { ...p, readGuides: [...p.readGuides, id] })),
    bumpShare: () => setS(p => ({ ...p, shared: p.shared + 1 })),
    markAwardsSeen: ids => setS(p => (ids.every(i => p.seenAwards.includes(i)) ? p : { ...p, seenAwards: [...new Set([...p.seenAwards, ...ids])] })),
    removeWatch: id => setS(p => ({ ...p, collection: p.collection.filter(o => o.modelId !== id) })),
    restoreWatch: (o, index) => setS(p => {
      const c = p.collection.filter(x => x.modelId !== o.modelId);
      c.splice(Math.min(index, c.length), 0, o);
      return { ...p, collection: c };
    }),
    setPro: v => setS(p => ({ ...p, pro: v })),
    finishOnboarding: () => setS(p => ({ ...p, onboarded: true })),
    bumpScan: () => setS(p => ({ ...p, scanCount: p.scanCount + 1 })),
    reset: () => {
      setScan({});
      setS(p => ({ ...initial, theme: p.theme, currency: p.currency, lastOpen: p.lastOpen, streak: p.streak, bestStreak: p.bestStreak }));
    },
    setTheme: theme => setS(p => ({ ...p, theme })),
    setCurrencyPref: currency => setS(p => ({ ...p, currency })),
    openWatch: (detailId, route = 'watch') => setS(p => ({ ...p, detailId, route })),
    updateWatch: (id, patch) => setS(p => ({ ...p, collection: p.collection.map(o => (o.modelId === id ? { ...o, ...patch } : o)) })),
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
