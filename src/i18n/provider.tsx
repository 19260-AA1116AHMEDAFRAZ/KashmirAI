'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { Lang } from '@/data/types';
import { makeT, type TFunction } from './config';

type LanguageValue = { lang: Lang; isRTL: boolean; t: TFunction };

const LanguageContext = createContext<LanguageValue | null>(null);

// The root layout reads the language cookie and passes it here, so client components
// translate with the same language the server used.
export function LanguageProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LanguageContext.Provider value={{ lang, isRTL: lang === 'ur', t: makeT(lang) }}>{children}</LanguageContext.Provider>;
}

export function useT() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useT must be used inside <LanguageProvider>');
  return ctx;
}
