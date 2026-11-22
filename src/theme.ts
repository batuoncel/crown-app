export type ThemeName = 'classic' | 'navy';

// Classic: warm paper, racing green, brass, serif headlines.
const CLASSIC = {
  paper: '#F3EFE6',
  surface: '#FFFFFF',
  ink: '#15140F',
  stone: '#7D776B',
  line: '#E2DCCF',
  green: '#1E4B3A', // primary
  greenSoft: '#E3ECE6',
  onPrimary: '#F3EFE6',
  onPrimarySoft: '#C9D6CE',
  brass: '#C79A4B',
  brassSoft: '#F4EAD6',
  brassInk: '#8A6524',
  up: '#2F7D4F',
  upSoft: '#E3EFE7',
  down: '#B5462F',
  downSoft: '#F6E3DE',
  halo: '#E8E1D2',
  selectedBg: '#FBFAF6',
  dash: '#CFC7B6',
  dial: '#1E4B3A',
  dialHi: '#2B634D',
  night: '#0E100D',
  nightText: '#F3EFE6',
  nightStone: '#A39D90',
};

// Navy: marketplace-style dark theme (near-black navy, one blue accent, sans-serif headlines).
const NAVY: typeof CLASSIC = {
  paper: '#0A0D12',
  surface: '#141922',
  ink: '#F1F3F6',
  stone: '#97A0AE',
  line: '#232A35',
  green: '#2E6BE6',
  greenSoft: '#16233D',
  onPrimary: '#FFFFFF',
  onPrimarySoft: '#C8D6F5',
  brass: '#D4A84F',
  brassSoft: '#2A2316',
  brassInk: '#E5C27C',
  up: '#35B877',
  upSoft: '#11291D',
  down: '#EF6B5B',
  downSoft: '#2D1613',
  halo: '#161D29',
  selectedBg: '#18213A',
  dash: '#2F3846',
  dial: '#101C33',
  dialHi: '#1D3358',
  night: '#05070A',
  nightText: '#F1F3F6',
  nightStone: '#97A0AE',
};

// Mutable on purpose: screens read C/F at render time, and the app remounts on a theme change.
export const C = { ...CLASSIC };

export const F = {
  serif: 'InstrumentSerif_400Regular', // display face; sans in the navy theme
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
};

export let themeName: ThemeName = 'classic';

export const isNavy = () => themeName === 'navy';

export function setPalette(name: ThemeName) {
  themeName = name;
  Object.assign(C, name === 'navy' ? NAVY : CLASSIC);
  F.serif = name === 'navy' ? 'Manrope_700Bold' : 'InstrumentSerif_400Regular';
}

// The sans display face reads larger than the serif at the same size.
export const display = (size: number) => (themeName === 'navy' ? { fontSize: Math.round(size * 0.86), letterSpacing: -0.6 } : { fontSize: size });

// ---------- currency ----------
// Prices are stored in USD and shown in the chosen currency at a fixed demo rate.
export type Currency = string; // ISO code
type Cur = { key: Currency; name: string; symbol: string; rate: number; sep: string };
// Approximate rates per 1 USD, fixed for the demo (not live).
export const CURRENCIES: Cur[] = [
  { key: 'USD', name: 'US dollar', symbol: '$', rate: 1, sep: ',' },
  { key: 'EUR', name: 'Euro', symbol: '€', rate: 0.87, sep: ',' },
  { key: 'GBP', name: 'British pound', symbol: '£', rate: 0.75, sep: ',' },
  { key: 'CHF', name: 'Swiss franc', symbol: 'CHF ', rate: 0.8, sep: "'" },
  { key: 'TRY', name: 'Turkish lira', symbol: '₺', rate: 44, sep: '.' },
  { key: 'JPY', name: 'Japanese yen', symbol: '¥', rate: 150, sep: ',' },
  { key: 'CNY', name: 'Chinese yuan', symbol: 'CN¥', rate: 7.1, sep: ',' },
  { key: 'HKD', name: 'Hong Kong dollar', symbol: 'HK$', rate: 7.8, sep: ',' },
  { key: 'SGD', name: 'Singapore dollar', symbol: 'S$', rate: 1.3, sep: ',' },
  { key: 'KRW', name: 'South Korean won', symbol: '₩', rate: 1380, sep: ',' },
  { key: 'INR', name: 'Indian rupee', symbol: '₹', rate: 87, sep: ',' },
  { key: 'THB', name: 'Thai baht', symbol: '฿', rate: 33, sep: ',' },
  { key: 'IDR', name: 'Indonesian rupiah', symbol: 'Rp ', rate: 16300, sep: '.' },
  { key: 'AED', name: 'UAE dirham', symbol: 'AED ', rate: 3.67, sep: ',' },
  { key: 'SAR', name: 'Saudi riyal', symbol: 'SAR ', rate: 3.75, sep: ',' },
  { key: 'QAR', name: 'Qatari riyal', symbol: 'QAR ', rate: 3.64, sep: ',' },
  { key: 'KWD', name: 'Kuwaiti dinar', symbol: 'KWD ', rate: 0.31, sep: ',' },
  { key: 'BHD', name: 'Bahraini dinar', symbol: 'BHD ', rate: 0.376, sep: ',' },
  { key: 'JOD', name: 'Jordanian dinar', symbol: 'JOD ', rate: 0.71, sep: ',' },
  { key: 'RSD', name: 'Serbian dinar', symbol: 'RSD ', rate: 101, sep: '.' },
  { key: 'DKK', name: 'Danish krone', symbol: 'kr ', rate: 6.5, sep: '.' },
  { key: 'NOK', name: 'Norwegian krone', symbol: 'kr ', rate: 10.2, sep: ' ' },
  { key: 'SEK', name: 'Swedish krona', symbol: 'kr ', rate: 9.6, sep: ' ' },
  { key: 'CZK', name: 'Czech koruna', symbol: 'Kč ', rate: 21.5, sep: ' ' },
  { key: 'PLN', name: 'Polish złoty', symbol: 'zł ', rate: 3.7, sep: ' ' },
  { key: 'HUF', name: 'Hungarian forint', symbol: 'Ft ', rate: 345, sep: ' ' },
  { key: 'RUB', name: 'Russian ruble', symbol: '₽', rate: 80, sep: ' ' },
  { key: 'AZN', name: 'Azerbaijani manat', symbol: '₼', rate: 1.7, sep: ',' },
  { key: 'GEL', name: 'Georgian lari', symbol: '₾', rate: 2.7, sep: ',' },
  { key: 'AUD', name: 'Australian dollar', symbol: 'A$', rate: 1.53, sep: ',' },
  { key: 'CAD', name: 'Canadian dollar', symbol: 'C$', rate: 1.38, sep: ',' },
  { key: 'MXN', name: 'Mexican peso', symbol: 'MX$', rate: 18.7, sep: ',' },
  { key: 'BRL', name: 'Brazilian real', symbol: 'R$', rate: 5.5, sep: '.' },
  { key: 'ZAR', name: 'South African rand', symbol: 'R ', rate: 18, sep: ' ' },
];
let cur = CURRENCIES[0];
export const setCurrency = (c: Currency) => { cur = CURRENCIES.find(x => x.key === c) ?? CURRENCIES[0]; };
export const currency = () => cur;
const group = (n: number, sep: string) => String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
// number in the chosen currency, without the symbol
export const num = (usd: number) => group(usd * cur.rate, cur.sep);
export const money = (usd: number) => (usd < 0 ? '−' : '') + cur.symbol + num(usd);
export const toUsd = (local: number) => local / cur.rate;
export const fromUsd = (usd: number) => usd * cur.rate;
export const pct = (n: number) => (n >= 0 ? '▲ ' : '▼ ') + Math.abs(n).toFixed(1) + '%';
