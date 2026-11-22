// Tiny i18n: English text is the key. t('Add to my collection') returns the
// translation for the current language, or the English text if there is none.
// Placeholders use {name}: t('{n} watches', { n: 3 }).
import { tr } from './locales/tr';
import { ja } from './locales/ja';
import { de } from './locales/de';
import { ko } from './locales/ko';
import { fr } from './locales/fr';
import { es } from './locales/es';
import { pt } from './locales/pt';
import { it } from './locales/it';
import { zhHant } from './locales/zhHant';
import { zhHans } from './locales/zhHans';
import { ar } from './locales/ar';
import { ru } from './locales/ru';
import { nl } from './locales/nl';
import { pl } from './locales/pl';
import { id } from './locales/id';
import { hi } from './locales/hi';
import { th } from './locales/th';
import { sv } from './locales/sv';
import { no } from './locales/no';
import { da } from './locales/da';
import { cs } from './locales/cs';
import { hu } from './locales/hu';
import { el } from './locales/el';
import { vi } from './locales/vi';

export type Lang = 'en' | 'tr' | 'ja' | 'de' | 'ko' | 'fr' | 'es' | 'pt' | 'it' | 'zhHant' | 'zhHans' | 'ar' | 'ru' | 'nl' | 'pl' | 'id' | 'hi' | 'th' | 'sv' | 'no' | 'da' | 'cs' | 'hu' | 'el' | 'vi';
// native: the language's name in its own language; flag shown beside it
export const LANGS: { key: Lang; native: string; flag: string; locale: string; rtl?: boolean }[] = [
  { key: 'en', native: 'English', flag: '🇬🇧', locale: 'en-GB' },
  { key: 'tr', native: 'Türkçe', flag: '🇹🇷', locale: 'tr-TR' },
  { key: 'ja', native: '日本語', flag: '🇯🇵', locale: 'ja-JP' },
  { key: 'de', native: 'Deutsch', flag: '🇩🇪', locale: 'de-DE' },
  { key: 'ko', native: '한국어', flag: '🇰🇷', locale: 'ko-KR' },
  { key: 'fr', native: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
  { key: 'es', native: 'Español', flag: '🇪🇸', locale: 'es-ES' },
  { key: 'pt', native: 'Português', flag: '🇵🇹', locale: 'pt-PT' },
  { key: 'it', native: 'Italiano', flag: '🇮🇹', locale: 'it-IT' },
  { key: 'zhHant', native: '繁體中文', flag: '🇹🇼', locale: 'zh-TW' },
  { key: 'zhHans', native: '简体中文', flag: '🇨🇳', locale: 'zh-CN' },
  { key: 'ar', native: 'العربية', flag: '🇸🇦', locale: 'ar-SA', rtl: true },
  { key: 'ru', native: 'Русский', flag: '🇷🇺', locale: 'ru-RU' },
  { key: 'nl', native: 'Nederlands', flag: '🇳🇱', locale: 'nl-NL' },
  { key: 'pl', native: 'Polski', flag: '🇵🇱', locale: 'pl-PL' },
  { key: 'id', native: 'Bahasa Indonesia', flag: '🇮🇩', locale: 'id-ID' },
  { key: 'hi', native: 'हिन्दी', flag: '🇮🇳', locale: 'hi-IN' },
  { key: 'th', native: 'ไทย', flag: '🇹🇭', locale: 'th-TH' },
  { key: 'sv', native: 'Svenska', flag: '🇸🇪', locale: 'sv-SE' },
  { key: 'no', native: 'Norsk', flag: '🇳🇴', locale: 'nb-NO' },
  { key: 'da', native: 'Dansk', flag: '🇩🇰', locale: 'da-DK' },
  { key: 'cs', native: 'Čeština', flag: '🇨🇿', locale: 'cs-CZ' },
  { key: 'hu', native: 'Magyar', flag: '🇭🇺', locale: 'hu-HU' },
  { key: 'el', native: 'Ελληνικά', flag: '🇬🇷', locale: 'el-GR' },
  { key: 'vi', native: 'Tiếng Việt', flag: '🇻🇳', locale: 'vi-VN' },
];
const DICTS: Record<Lang, Record<string, string>> = { en: {}, tr, ja, de, ko, fr, es, pt, it, zhHant, zhHans, ar, ru, nl, pl, id, hi, th, sv, no, da, cs, hu, el, vi };

// languages with a translation (others fall back to English, so they are not offered yet)
export const AVAILABLE_LANGS = LANGS.filter(l => l.key === 'en' || Object.keys(DICTS[l.key]).length > 0);

let lang: Lang = 'en';
export const setLang = (l: Lang) => { lang = DICTS[l] ? l : 'en'; };
export const getLang = () => lang;
export const locale = () => LANGS.find(x => x.key === lang)!.locale;

export function t(s: string, vars?: Record<string, string | number>): string {
  const lead = s.match(/^\s*/)![0], trail = s.match(/\s*$/)![0];
  const core = s.trim();
  let out = (core && DICTS[lang][core]) || core;
  if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  return lead + out + trail;
}

// dates in the current language
export const fmtDate = (d: Date, opts: Intl.DateTimeFormatOptions) => {
  try { return d.toLocaleDateString(locale(), opts); } catch { return d.toLocaleDateString('en-US', opts); }
};
