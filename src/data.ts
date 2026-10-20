// Demo data: realistic references and 12-month median listed prices (USD).
// Values are illustrative for the prototype, not live market data.

export type Model = {
  id: string;
  brand: string;
  name: string;
  ref: string;
  size: string;
  material: string;
  dial: string; // dial colour for the illustration
  dialHi: string;
  history: number[]; // 13 monthly medians, oldest first (Oct 2025 → Oct 2026)
  spread: number; // half-width of the value range as a share of the median
};

const h = (start: number, end: number, wobble: number[]): number[] =>
  wobble.map((w, i) => Math.round(start + ((end - start) * i) / (wobble.length - 1) + w));

const W = [0, 110, -60, 140, 40, 170, 60, 190, 80, 150, 20, -30, 0];
const W2 = [0, -90, 60, -150, -40, -220, -120, 40, -60, 90, 20, -30, 0];

export const MODELS: Model[] = [
  { id: 'sub-126610ln', brand: 'Rolex', name: 'Submariner Date', ref: '126610LN', size: '41 mm', material: 'Steel', dial: '#141714', dialHi: '#2A2E2A', history: h(14150, 14750, W), spread: 0.058 },
  { id: 'sub-126610lv', brand: 'Rolex', name: 'Submariner Date "Starbucks"', ref: '126610LV', size: '41 mm', material: 'Steel', dial: '#141714', dialHi: '#2A2E2A', history: h(17900, 17300, W2), spread: 0.06 },
  { id: 'dj-126300', brand: 'Rolex', name: 'Datejust 41', ref: '126300', size: '41 mm', material: 'Steel', dial: '#1D3550', dialHi: '#2A4A6E', history: h(9600, 10150, W), spread: 0.07 },
  { id: 'gmt-126710blro', brand: 'Rolex', name: 'GMT-Master II "Pepsi"', ref: '126710BLRO', size: '40 mm', material: 'Steel', dial: '#141714', dialHi: '#2A2E2A', history: h(21800, 20900, W2), spread: 0.06 },
  { id: 'op-124300', brand: 'Rolex', name: 'Oyster Perpetual 41', ref: '124300', size: '41 mm', material: 'Steel', dial: '#1E4B3A', dialHi: '#2B634D', history: h(7900, 8350, W), spread: 0.07 },
  { id: 'smp-21030', brand: 'Omega', name: 'Seamaster Diver 300M', ref: '210.30.42.20.03.001', size: '42 mm', material: 'Steel', dial: '#1D3550', dialHi: '#2A4A6E', history: h(4350, 4150, W2.map(x => x / 3)), spread: 0.09 },
  { id: 'smp-21001', brand: 'Omega', name: 'Seamaster Diver 300M', ref: '210.30.42.20.01.001', size: '42 mm', material: 'Steel', dial: '#141714', dialHi: '#2A2E2A', history: h(4200, 4050, W2.map(x => x / 3)), spread: 0.09 },
  { id: 'po-215', brand: 'Omega', name: 'Seamaster Planet Ocean', ref: '215.30.44.21.03.001', size: '43.5 mm', material: 'Steel', dial: '#1B3048', dialHi: '#284664', history: h(5150, 5000, W2.map(x => x / 3)), spread: 0.1 },
  { id: 'speedy-310', brand: 'Omega', name: 'Speedmaster Moonwatch', ref: '310.30.42.50.01.001', size: '42 mm', material: 'Steel', dial: '#141714', dialHi: '#2A2E2A', history: h(6050, 6300, W.map(x => x / 2)), spread: 0.08 },
  { id: 'bb58-79030n', brand: 'Tudor', name: 'Black Bay Fifty-Eight', ref: 'M79030N', size: '39 mm', material: 'Steel', dial: '#141714', dialHi: '#2A2E2A', history: h(3500, 3350, W2.map(x => x / 4)), spread: 0.09 },
  { id: 'bb-79230g', brand: 'Tudor', name: 'Black Bay', ref: 'M7941A1A0RU', size: '41 mm', material: 'Steel', dial: '#1E4B3A', dialHi: '#2B634D', history: h(3300, 3250, W2.map(x => x / 4)), spread: 0.1 },
  { id: 'spb143', brand: 'Seiko', name: 'Prospex 62MAS Reissue', ref: 'SPB143', size: '40.5 mm', material: 'Steel', dial: '#2C2F2E', dialHi: '#3C403F', history: h(860, 840, W2.map(x => x / 20)), spread: 0.12 },
  { id: 'srpd', brand: 'Seiko', name: 'Seiko 5 Sports', ref: 'SRPD55', size: '42.5 mm', material: 'Steel', dial: '#141714', dialHi: '#2A2E2A', history: h(205, 195, W2.map(x => x / 100)), spread: 0.15 },
  { id: 'santos-wssa0018', brand: 'Cartier', name: 'Santos de Cartier', ref: 'WSSA0018', size: '39.8 mm', material: 'Steel', dial: '#EDEAE2', dialHi: '#FBFAF6', history: h(6900, 7050, W.map(x => x / 3)), spread: 0.08 },
  { id: 'carrera-cbn2a1b', brand: 'TAG Heuer', name: 'Carrera Chronograph', ref: 'CBN2A1B', size: '44 mm', material: 'Steel', dial: '#1D3550', dialHi: '#2A4A6E', history: h(3900, 3700, W2.map(x => x / 4)), spread: 0.11 },
  { id: 'aqua-ww', brand: 'Omega', name: 'Seamaster Aqua Terra', ref: '220.10.41.21.03.004', size: '41 mm', material: 'Steel', dial: '#1D3550', dialHi: '#2A4A6E', history: h(4700, 4800, W.map(x => x / 4)), spread: 0.09 },
];

export const BRANDS = ['Rolex', 'Omega', 'Tudor', 'Seiko', 'Cartier', 'TAG Heuer', 'Other'];

export const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

export const byId = (id: string) => MODELS.find(m => m.id === id)!;

export type Answers = {
  goal: 'track' | 'sell' | 'buy' | null;
  count: '1' | '2–3' | '4–10' | '10+' | null;
  brands: string[];
  papers: 'Yes' | 'Some' | 'No' | null;
};

export const papersFactor = (p: Answers['papers']) => (p === 'Yes' ? 1.06 : p === 'Some' ? 1.0 : 0.93);

export const valueOf = (m: Model, papers: Answers['papers']) => {
  const mid = m.history[m.history.length - 1] * papersFactor(papers);
  return { mid, low: mid * (1 - m.spread), high: mid * (1 + m.spread) };
};

export const change12 = (m: Model) => {
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
