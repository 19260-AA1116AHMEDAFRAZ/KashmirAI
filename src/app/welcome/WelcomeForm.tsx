'use client';

import Image from 'next/image';
import { useState, useTransition } from 'react';

import { chooseLanguage } from '@/app/actions';
import { LogoBadge, PhotoCredit } from '@/components/Brand';
import { Button, cx, Label } from '@/components/ui';
import type { Lang } from '@/data/types';
import { makeT } from '@/i18n/config';

// The button text is always in its own script.
const LANG_OPTIONS: { id: Lang; label: string; sub: string }[] = [
  { id: 'en', label: 'English', sub: 'English' },
  { id: 'ur', label: 'اردو', sub: 'Urdu' },
  { id: 'roman', label: 'Roman', sub: 'Roman Urdu' },
];

export function WelcomeForm({ initialLang, next }: { initialLang: Lang; next: string }) {
  // The page previews the picked language straight away; the choice is saved on "Get started".
  const [lang, setLang] = useState<Lang>(initialLang);
  const [pending, startTransition] = useTransition();
  const t = makeT(lang);
  const urdu = lang === 'ur';

  return (
    // Split screen: the photo on one half, the language choice on the other (stacked on phones).
    <main lang={lang} dir={urdu ? 'rtl' : 'ltr'} className={cx('grid min-h-dvh flex-1 lg:grid-cols-2', urdu && 'font-urdu')}>
      <div className="relative h-[40dvh] min-h-[240px] overflow-hidden bg-mint lg:h-auto">
        <Image src="/places/arangkel.jpg" alt="Arang Kel village among pine forests and mountains" fill preload sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        <PhotoCredit text="Arang Kel · Photo: Abdullah Kashif / Unsplash" />
        <LogoBadge />
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-col justify-center gap-6 px-6 py-10 lg:px-10">
        <div className="flex flex-col gap-3">
          <h1 className={cx('font-extrabold', urdu ? 'text-[32px] leading-[68px]' : 'text-4xl leading-tight tracking-tight sm:text-5xl')}>
            {t('welcome.headline1')}
            <br />
            <span className="text-green">{t('welcome.headline2')}</span>
          </h1>
          <p className="text-base text-muted sm:text-lg">{t('welcome.intro')}</p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Label>{t('welcome.chooseLanguage')}</Label>
          <div className="flex gap-2">
            {LANG_OPTIONS.map((o) => {
              const on = lang === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setLang(o.id)}
                  className={cx('flex min-h-18 flex-1 flex-col items-center justify-center rounded-2xl border-2 px-2 py-2 transition', on ? 'border-green bg-mint text-deep' : 'border-line bg-white text-ink hover:border-green')}>
                  <span className={cx('font-bold', o.id === 'ur' ? 'font-urdu text-base' : 'latin text-[15px]')}>{o.label}</span>
                  <span className="latin text-[11px] font-medium opacity-80">{o.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Button iconAfter="arrow" disabled={pending} onClick={() => startTransition(() => chooseLanguage(lang, next))}>
          {t('welcome.cta')}
        </Button>
        <p className="text-center text-xs text-muted">{t('welcome.footer')}</p>
      </div>
    </main>
  );
}
