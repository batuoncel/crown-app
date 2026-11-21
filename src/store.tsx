import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Answers, Model } from './data';
import { Currency, setCurrency, ThemeName } from './theme';
import { applyTheme } from './ui';

export type Route =
  | 'promise' | 'goal' | 'about' | 'planLoading' | 'plan'
  | 'priming' | 'camera' | 'analysing' | 'result' | 'partial' | 'search'
  | 'paywall' | 'proWelcome' | 'home' | 'alerts'
  | 'watch' | 'share' | 'settings';

// paid is stored in USD; papers overrides the onboarding answer for this watch
export type Owned = { modelId: string; addedAt: string; paid?: number; papers?: Answers['papers'] };

type Persisted = { answers: Answers; collection: Owned[]; pro: boolean; onboarded: boolean; scanCount: number; route: Route; theme: ThemeName; currency: Currency; detailId?: string };

export type Scan = { photo?: string; model?: Model; options?: Model[]; confidence?: number; confirmed?: boolean };

type Store = Persisted & {
  ready: boolean;
  scan: Scan;
  go: (r: Route) => void;
  setAnswers: (a: Partial<Answers>) => void;
  toggleBrand: (b: string) => void;
  setScan: (s: Scan) => void;
  addWatch: (m: Model) => void;
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
};

const Ctx = createContext<Store>(null as unknown as Store);
export const useStore = () => useContext(Ctx);

// routes that are safe to resume after the app is closed
const RESUMABLE: Route[] = ['promise', 'goal', 'about', 'plan', 'priming', 'paywall', 'home', 'alerts', 'settings', 'watch'];

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<Persisted>(initial);
  const [ready, setReady] = useState(false);
  const [scan, setScan] = useState<Scan>({});
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
          setS(saved);
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
    addWatch: m => setS(p => ({ ...p, collection: [...p.collection.filter(o => o.modelId !== m.id), { modelId: m.id, addedAt: new Date().toISOString() }] })),
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
      setS(p => ({ ...initial, theme: p.theme, currency: p.currency }));
    },
    setTheme: theme => setS(p => ({ ...p, theme })),
    setCurrencyPref: currency => setS(p => ({ ...p, currency })),
    openWatch: (detailId, route = 'watch') => setS(p => ({ ...p, detailId, route })),
    updateWatch: (id, patch) => setS(p => ({ ...p, collection: p.collection.map(o => (o.modelId === id ? { ...o, ...patch } : o)) })),
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
