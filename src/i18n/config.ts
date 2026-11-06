import type { Lang } from '@/data/types';
import en, { type Translation } from './locales/en';
import roman from './locales/roman';
import ur from './locales/ur';

// The chosen language is kept in this cookie, so the server renders the right language and
// direction (Urdu is right-to-left) on the very first paint.
export const LANG_COOKIE = 'kashmirai-lang';
export const LANGS: Lang[] = ['en', 'ur', 'roman'];
export const DEFAULT_LANG: Lang = 'roman'; // as in the prototype

const DICTS: Record<Lang, Translation> = { en, ur, roman };

export const isLang = (v: unknown): v is Lang => v === 'en' || v === 'ur' || v === 'roman';

export type Vars = Record<string, string | number>;
export type TFunction = (key: string, vars?: Vars) => string;

function lookup(dict: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined), dict);
}

// t('common.from', { amount: 'Rs 5,000' }) → "From Rs 5,000". Falls back to English, then the key.
export function makeT(lang: Lang): TFunction {
  return (key, vars) => {
    const value = lookup(DICTS[lang], key) ?? lookup(DICTS.en, key);
    if (typeof value !== 'string') return key;
    return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(vars?.[name] ?? ''));
  };
}

// For lists such as the suggested questions on Ask.
export function tList(lang: Lang, key: string): string[] {
  const value = lookup(DICTS[lang], key) ?? lookup(DICTS.en, key);
  return Array.isArray(value) ? (value as string[]) : [];
}
