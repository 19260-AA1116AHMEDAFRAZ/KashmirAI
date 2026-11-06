import 'server-only';

import { cookies } from 'next/headers';

import type { Lang } from '@/data/types';
import { DEFAULT_LANG, isLang, LANG_COOKIE, makeT } from './config';

// The visitor's language (from the cookie set on the welcome screen).
export async function getLang(): Promise<Lang> {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(value) ? value : DEFAULT_LANG;
}

// For Server Components: const { t, lang } = await getT();
export async function getT() {
  const lang = await getLang();
  return { lang, t: makeT(lang), isRTL: lang === 'ur' };
}
