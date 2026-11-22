// Demo data: realistic references and 12-month median listed prices (USD).
// Values are illustrative for the prototype, not live market data.

export type WatchKind = 'diver' | 'dress' | 'chrono' | 'square';

export type Model = {
  id: string;
  brand: string;
  name: string;
  ref: string;
  size: string;
  material: string;
  dial: string; // dial colour for the illustration
  dialHi: string;
  kind: WatchKind; // case type used for the drawing
  bezel?: string | [string, string]; // [top, bottom] for two-colour GMT bezels
  fluted?: boolean;
  date?: boolean;
  accent?: string; // index colour, e.g. gilt
  history: number[]; // 13 monthly medians, oldest first (Oct 2025 → Oct 2026)
  spread: number; // half-width of the value range as a share of the median
};

const h = (start: number, end: number, wobble: number[]): number[] =>
  wobble.map((w, i) => Math.round(start + ((end - start) * i) / (wobble.length - 1) + w));

const W = [0, 110, -60, 140, 40, 170, 60, 190, 80, 150, 20, -30, 0];
const W2 = [0, -90, 60, -150, -40, -220, -120, 40, -60, 90, 20, -30, 0];
// dipped, recovered to the middle of its range, now easing
const W3 = [0, -200, -350, -250, -100, 100, 300, 450, 500, 400, 300, 250, 200];
// peaked early, fell, now climbing back to the middle
const W4 = [0, 200, 350, 400, 300, 150, -50, -200, -300, -250, -150, -50, 50];

export const MODELS: Model[] = [
  { id: 'sub-126610ln', brand: 'Rolex', name: 'Submariner Date', ref: '126610LN', size: '41 mm', material: 'Steel', dial: '#141714', dialHi: '#2A2E2A', kind: 'diver', bezel: '#15181A', date: true, history: h(14150, 14750, W), spread: 0.058 },
  { id: 'sub-126610lv', brand: 'Rolex', name: 'Submariner Date "Starbucks"', ref: '126610LV', size: '41 mm', material: 'Steel', dial: '#141714', dialHi: '#2A2E2A', kind: 'diver', bezel: '#1F5A36', date: true, history: h(17900, 17300, W2), spread: 0.06 },
  { id: 'dj-126300', brand: 'Rolex', name: 'Datejust 41', ref: '126300', size: '41 mm', material: 'Steel', dial: '#1D3550', dialHi: '#2A4A6E', kind: 'dress', fluted: true, date: true, history: h(10050, 10150, W3), spread: 0.07 },
  { id: 'gmt-126710blro', brand: 'Rolex', name: 'GMT-Master II "Pepsi"', ref: '126710BLRO', size: '40 mm', material: 'Steel', dial: '#141714', dialHi: '#2A2E2A', kind: 'diver', bezel: ['#22407E', '#A82B2E'], date: true, history: h(21800, 20900, W2), spread: 0.06 },
  { id: 'op-124300', brand: 'Rolex', name: 'Oyster Perpetual 41', ref: '124300', size: '41 mm', material: 'Steel', dial: '#1E4B3A', dialHi: '#2B634D', kind: 'dress', history: h(8250, 8350, W4), spread: 0.07 },
  { id: 'smp-21030', brand: 'Omega', name: 'Seamaster Diver 300M', ref: '210.30.42.20.03.001', size: '42 mm', material: 'Steel', dial: '#1D3550', dialHi: '#2A4A6E', kind: 'diver', bezel: '#1C3354', history: h(4350, 4150, W2.map(x => x / 3)), spread: 0.09 },
  { id: 'smp-21001', brand: 'Omega', name: 'Seamaster Diver 300M', ref: '210.30.42.20.01.001', size: '42 mm', material: 'Steel', dial: '#141714', dialHi: '#2A2E2A', kind: 'diver', bezel: '#15181A', history: h(4200, 4050, W2.map(x => x / 3)), spread: 0.09 },
  { id: 'po-215', brand: 'Omega', name: 'Seamaster Planet Ocean', ref: '215.30.44.21.03.001', size: '43.5 mm', material: 'Steel', dial: '#1B3048', dialHi: '#284664', kind: 'diver', bezel: '#1F3A60', date: true, history: h(5150, 5000, W2.map(x => x / 3)), spread: 0.1 },
  { id: 'speedy-310', brand: 'Omega', name: 'Speedmaster Moonwatch', ref: '310.30.42.50.01.001', size: '42 mm', material: 'Steel', dial: '#141714', dialHi: '#2A2E2A', kind: 'chrono', bezel: '#141617', history: h(6050, 6300, W.map(x => x / 2)), spread: 0.08 },
  { id: 'bb58-79030n', brand: 'Tudor', name: 'Black Bay Fifty-Eight', ref: 'M79030N', size: '39 mm', material: 'Steel', dial: '#141714', dialHi: '#2A2E2A', kind: 'diver', bezel: '#15181A', accent: '#E2C88E', history: h(3500, 3350, W2.map(x => x / 4)), spread: 0.09 },
  { id: 'bb-79230g', brand: 'Tudor', name: 'Black Bay', ref: 'M7941A1A0RU', size: '41 mm', material: 'Steel', dial: '#1E4B3A', dialHi: '#2B634D', kind: 'diver', bezel: '#1E4B3A', accent: '#E2C88E', history: h(3300, 3250, W3.map(x => x / 3)), spread: 0.1 },
  { id: 'spb143', brand: 'Seiko', name: 'Prospex 62MAS Reissue', ref: 'SPB143', size: '40.5 mm', material: 'Steel', dial: '#2C2F2E', dialHi: '#3C403F', kind: 'diver', bezel: '#1A1C1D', date: true, history: h(850, 840, W4.map(x => x / 12)), spread: 0.12 },
  { id: 'srpd', brand: 'Seiko', name: 'Seiko 5 Sports', ref: 'SRPD55', size: '42.5 mm', material: 'Steel', dial: '#141714', dialHi: '#2A2E2A', kind: 'diver', bezel: '#15181A', date: true, history: h(205, 195, W2.map(x => x / 100)), spread: 0.15 },
  { id: 'santos-wssa0018', brand: 'Cartier', name: 'Santos de Cartier', ref: 'WSSA0018', size: '39.8 mm', material: 'Steel', dial: '#EDEAE2', dialHi: '#FBFAF6', kind: 'square', history: h(6900, 7050, W.map(x => x / 3)), spread: 0.08 },
  { id: 'carrera-cbn2a1b', brand: 'TAG Heuer', name: 'Carrera Chronograph', ref: 'CBN2A1B', size: '44 mm', material: 'Steel', dial: '#1D3550', dialHi: '#2A4A6E', kind: 'chrono', history: h(3900, 3700, W2.map(x => x / 4)), spread: 0.11 },
  { id: 'aqua-ww', brand: 'Omega', name: 'Seamaster Aqua Terra', ref: '220.10.41.21.03.004', size: '41 mm', material: 'Steel', dial: '#1D3550', dialHi: '#2A4A6E', kind: 'dress', date: true, history: h(4800, 4800, W4.map(x => x / 2.5)), spread: 0.09 },
];

export const BRANDS = ['Rolex', 'Omega', 'Tudor', 'Seiko', 'Cartier', 'TAG Heuer', 'Other'];

export const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

// watches recognised outside the catalogue (registered by the store from saved data)
export const CUSTOM: Record<string, Model> = {};
export const byId = (id: string) => (MODELS.find(m => m.id === id) ?? CUSTOM[id])!;

// a recognised watch we have no catalogue entry for: no price history, value comes from live market data later
export function customModel(x: { brand: string; model: string; reference: string }): Model {
  const key = (x.brand + '-' + (x.reference || x.model)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return { id: 'c-' + key, brand: x.brand || 'Unknown', name: x.model || 'Watch', ref: x.reference, size: '', material: '', dial: '#141714', dialHi: '#2A2E2A', kind: 'diver', history: [], spread: 0.08 };
}

// true when Crown can show a value for this model (catalogue history or live market data)
export const hasPrice = (m: Model) => m.history.length > 0 || !!LIVE[m.id];

export type Answers = {
  goal: 'track' | 'sell' | 'buy' | null;
  count: '1' | '2–3' | '4–10' | '10+' | null;
  brands: string[];
  papers: 'Yes' | 'Some' | 'No' | null;
};

export type Condition = 'Unworn' | 'Excellent' | 'Good' | 'Worn';
export const CONDITIONS: Condition[] = ['Unworn', 'Excellent', 'Good', 'Worn'];
export const conditionFactor = (c?: Condition) => (c === 'Unworn' ? 1.12 : c === 'Excellent' ? 1.05 : c === 'Worn' ? 0.88 : 1);

export const papersFactor = (p: Answers['papers']) => (p === 'Yes' ? 1.06 : p === 'Some' ? 1.0 : 0.93);

// live eBay asking prices by model id (filled by the store when real data arrives)
export const LIVE: Record<string, { median: number; p25: number; p75: number }> = {};

export const valueOf = (m: Model, papers: Answers['papers'], condition?: Condition) => {
  const f = papersFactor(papers) * conditionFactor(condition);
  const live = LIVE[m.id];
  if (live) return { mid: live.median * f, low: live.p25 * f, high: live.p75 * f };
  if (!m.history.length) return { mid: 0, low: 0, high: 0 };
  const mid = m.history[m.history.length - 1] * f;
  return { mid, low: mid * (1 - m.spread), high: mid * (1 + m.spread) };
};

// value of one owned watch (its own box/papers answer wins over the onboarding one)
export const ownedValue = (o: { modelId: string; papers?: Answers['papers']; condition?: Condition }, fallback: Answers['papers']) => valueOf(byId(o.modelId), o.papers ?? fallback, o.condition);

// service: most brands suggest every 5 to 10 years; we remind at 5
export const SERVICE_YEARS = 5;
export const serviceDue = (lastService?: string) => {
  if (!lastService) return null;
  const d = new Date(lastService);
  d.setFullYear(d.getFullYear() + SERVICE_YEARS);
  return d;
};

export const change12 = (m: Model) => {
  if (m.history.length < 2) return 0;
  const a = m.history[0], b = m.history[m.history.length - 1];
  return ((b - a) / a) * 100;
};

export const planSlots = (count: Answers['count']) => (count === '1' ? 1 : count === '2–3' ? 3 : count === '4–10' ? 10 : 25);

// The demo "recogniser": picks a believable model from the brands the user named.
// Every third scan returns a partial match so the honest-confidence screen can be shown.
export function recognise(answers: Answers, scanCount: number): { kind: 'high'; model: Model; confidence: number } | { kind: 'partial'; options: Model[]; confidence: number } {
  const named = answers.brands.filter(b => b !== 'Other');
  if (scanCount % 3 === 2 || named.length === 0) {
    return { kind: 'partial', options: [byId('smp-21030'), byId('smp-21001'), byId('po-215')], confidence: 61 };
  }
  const pool = MODELS.filter(m => named.includes(m.brand));
  const pickOrder: Record<string, string> = { Rolex: 'sub-126610ln', Omega: 'speedy-310', Tudor: 'bb58-79030n', Seiko: 'spb143', Cartier: 'santos-wssa0018', 'TAG Heuer': 'carrera-cbn2a1b' };
  const brand = named[scanCount % named.length];
  const model = pickOrder[brand] && scanCount < named.length ? byId(pickOrder[brand]) : pool[(scanCount * 3) % pool.length];
  return { kind: 'high', model, confidence: 90 + ((scanCount * 7) % 8) };
}

// ---------- market signal ----------
// A simple, explainable signal from the 12-month price history: where today's price sits in its
// 12-month low–high range, and the 3-month trend. A hint for timing, not a forecast.
export type Signal = {
  trend: 'rising' | 'falling' | 'steady';
  ch3: number; // % change over 3 months
  pos: number; // 0 = 12-month low, 1 = 12-month high
  low: number;
  high: number;
  sell: 'good' | 'neutral' | 'wait';
  buy: 'good' | 'neutral' | 'wait';
};
export function marketSignal(m: Model, factor = 1): Signal {
  const h = m.history.map(x => x * factor);
  const last = h[h.length - 1], ago3 = h[h.length - 4];
  const ch3 = ((last - ago3) / ago3) * 100;
  const low = Math.min(...h), high = Math.max(...h);
  const pos = high > low ? (last - low) / (high - low) : 0.5;
  const trend = ch3 > 1.5 ? 'rising' : ch3 < -1.5 ? 'falling' : 'steady';
  const sell = pos >= 0.7 ? 'good' : pos <= 0.35 ? 'wait' : 'neutral';
  const buy = pos <= 0.35 ? 'good' : pos >= 0.7 ? 'wait' : 'neutral';
  return { trend, ch3, pos, low, high, sell, buy };
}
