import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Answers, CUSTOM, Condition, LIVE, Model } from './data';
import type { Market } from './market';
import { Currency, setCurrency, ThemeName } from './theme';
import { Lang, setLang } from './i18n';
import { applyTheme } from './ui';

export type Route =
  | 'promise' | 'goal' | 'about' | 'planLoading' | 'plan'
  | 'priming' | 'camera' | 'analysing' | 'result' | 'partial' | 'search'
  | 'paywall' | 'proWelcome' | 'home' | 'alerts'
  | 'watch' | 'share' | 'settings' | 'guide' | 'wishlist' | 'report';

// paid is stored in USD; papers overrides the onboarding answer for this watch
export type Owned = { modelId: string; addedAt: string; paid?: number; papers?: Answers['papers']; photo?: string; condition?: Condition; lastService?: string; serial?: string };
export type Wish = { modelId: string; addedAt: string; target?: number }; // target in USD

type Persisted = { answers: Answers; collection: Owned[]; pro: boolean; onboarded: boolean; scanCount: number; route: Route; theme: ThemeName; currency: Currency; detailId?: string; shared: number; guideId?: string; readGuides: string[];
  wishes: Wish[]; aiConsent: boolean; feedback: { yes: number; no: number }; lang: Lang; ownerName?: string; lastBackup?: string; market: Record<string, Market>; customModels: Model[]; accessCode?: string };

export type Scan = {
  photo?: string; model?: Model; options?: Model[]; confidence?: number; confirmed?: boolean;
  // live recognition outcomes that have no catalogue match
  unknown?: { brand: string; model: string; reference: string }; notWatch?: boolean; failed?: boolean; error?: string;
};

type Store = Persisted & {
  ready: boolean;
  scan: Scan;
  go: (r: Route) => void;
  setAnswers: (a: Partial<Answers>) => void;
  toggleBrand: (b: string) => void;
  setScan: (s: Scan) => void;
  addWatch: (m: Model, photo?: string) => void;
  bumpShare: () => void;
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
  setLanguage: (l: Lang) => void;
  setOwnerName: (n: string) => void;
  setAccessCode: (c: string) => void;
  backupData: () => Persisted;
  setMarket: (modelId: string, m: Market) => void;
  markBackedUp: () => void;
  restoreBackup: (data: Record<string, unknown>) => void;
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
  theme: 'navy',
  currency: 'USD',
  shared: 0,
  readGuides: [],
  wishes: [],
  aiConsent: false,
  feedback: { yes: 0, no: 0 },
  lang: 'en',
  market: {},
  customModels: [],
};

// only real eBay data feeds values; sample listings never do
const syncLive = (market: Record<string, Market>) => {
  for (const k of Object.keys(LIVE)) delete LIVE[k];
  for (const [id, m] of Object.entries(market)) if (m.source === 'ebay' && m.median && m.p25 && m.p75 && m.count >= 3) LIVE[id] = { median: m.median, p25: m.p25, p75: m.p75 };
};


const Ctx = createContext<Store>(null as unknown as Store);
export const useStore = () => useContext(Ctx);

// routes that are safe to resume after the app is closed
const RESUMABLE: Route[] = ['promise', 'goal', 'about', 'plan', 'priming'];

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<Persisted>(initial);
  const [ready, setReady] = useState(false);
  const [scan, setScan] = useState<Scan>({});
  const [searchFor, setSearchFor] = useState<'collection' | 'wish'>('collection');
  const applied = useRef<ThemeName | null>(null);
  setCurrency(s.currency); // cheap; keeps money() in sync before children render
  setLang(s.lang);
  syncLive(s.market ?? {});
  for (const m of s.customModels ?? []) CUSTOM[m.id] = m;
  if (applied.current !== s.theme) {
    applyTheme(s.theme); // before children render, so they read the right palette
    applied.current = s.theme;
  }

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(raw => {
        if (raw) {
          const saved = { ...initial, ...JSON.parse(raw) } as Persisted;
          // every launch starts on Home; only an unfinished onboarding resumes where it stopped
          saved.route = saved.onboarded ? 'home' : RESUMABLE.includes(saved.route) ? saved.route : 'promise';
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
    addWatch: (m, photo) => setS(p => {
      if (m.id.startsWith('c-') && !(p.customModels ?? []).some(x => x.id === m.id)) p = { ...p, customModels: [...(p.customModels ?? []), m] };
      const prev = p.collection.find(o => o.modelId === m.id);
      const next: Owned = { ...prev, modelId: m.id, addedAt: prev?.addedAt ?? new Date().toISOString(), photo: photo ?? prev?.photo };
      return { ...p, collection: [...p.collection.filter(o => o.modelId !== m.id), next] };
    }),
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
      setS(p => ({ ...initial, theme: p.theme, currency: p.currency, lang: p.lang }));
    },
    setTheme: theme => setS(p => ({ ...p, theme })),
    setCurrencyPref: currency => setS(p => ({ ...p, currency })),
    setLanguage: lang => setS(p => ({ ...p, lang })),
    setOwnerName: ownerName => setS(p => ({ ...p, ownerName })),
    setAccessCode: accessCode => setS(p => ({ ...p, accessCode })),
    backupData: () => s,
    setMarket: (id, m) => setS(p => ({ ...p, market: { ...p.market, [id]: m } })),
    markBackedUp: () => setS(p => ({ ...p, lastBackup: new Date().toISOString() })),
    // a restored backup replaces everything except this device's look (theme, language, currency)
    restoreBackup: data => setS(p => ({ ...initial, ...(data as Partial<Persisted>), theme: p.theme, lang: p.lang, currency: p.currency, onboarded: true, route: 'home' })),
    openWatch: (detailId, route = 'watch') => setS(p => ({ ...p, detailId, route })),
    updateWatch: (id, patch) => setS(p => ({ ...p, collection: p.collection.map(o => (o.modelId === id ? { ...o, ...patch } : o)) })),
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
