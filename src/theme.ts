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

export const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
export const pct = (n: number) => (n >= 0 ? '▲ ' : '▼ ') + Math.abs(n).toFixed(1) + '%';
