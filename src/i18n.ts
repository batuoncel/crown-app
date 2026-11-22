// Tiny i18n: English text is the key. t('Add to my collection') returns the
// translation for the current language, or the English text if there is none.
// Placeholders use {name}: t('{n} watches', { n: 3 }).
import { de } from './locales/de';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { it } from './locales/it';
import { tr } from './locales/tr';

export type Lang = 'en' | 'tr' | 'de' | 'fr' | 'es' | 'it';
export const LANGS: { key: Lang; name: string; native: string; locale: string }[] = [
  { key: 'en', name: 'English', native: 'English', locale: 'en-US' },
  { key: 'tr', name: 'Turkish', native: 'Türkçe', locale: 'tr-TR' },
  { key: 'de', name: 'German', native: 'Deutsch', locale: 'de-DE' },
  { key: 'fr', name: 'French', native: 'Français', locale: 'fr-FR' },
  { key: 'es', name: 'Spanish', native: 'Español', locale: 'es-ES' },
  { key: 'it', name: 'Italian', native: 'Italiano', locale: 'it-IT' },
];
const DICTS: Record<Lang, Record<string, string>> = { en: {}, tr, de, fr, es, it };

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
