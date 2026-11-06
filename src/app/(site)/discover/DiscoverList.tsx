'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Icon } from '@/components/Icon';
import { PlaceHero } from '@/components/PlaceImage';
import { cx, Tag } from '@/components/ui';
import type { Place, PlaceType } from '@/data/types';
import { useT } from '@/i18n/provider';
import { formatRs, pickText } from '@/lib/format';
import { cardPlan, type Estimate } from '@/lib/budget';
import { daysLabel } from '@/lib/placeText';

type Filter = 'all' | PlaceType;
const FILTERS: Filter[] = ['all', 'valley', 'lake', 'hilltop', 'town'];

// Search box, type filters and the grid of place cards.
// `estimates`: the example-trip price of each place from Gemini (null while it is still being worked out).
export function DiscoverList({ places, estimates }: { places: Place[]; estimates: Record<string, Estimate | null> | null }) {
  const { t, lang } = useT();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  // Filter by type, then by the search box (matches the name in any language).
  const q = query.trim().toLowerCase();
  const shown = places
    .filter((p) => filter === 'all' || p.type === filter)
    .filter((p) => !q || [p.name.en, p.name.ur, p.name.roman].some((n) => n?.toLowerCase().includes(q)));

  return (
    <section className="flex flex-col gap-5" aria-labelledby="popular">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="popular" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {t('discover.popular')}
          </h2>
          <p className="text-sm text-muted">{t('discover.placesCount', { count: shown.length })}</p>
        </div>
        <label className="flex h-12 w-full items-center gap-2.5 rounded-full border border-line bg-white px-4 sm:w-80">
          <Icon name="search" size={20} className="text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('discover.search')}
            aria-label={t('discover.search')}
            className="flex-1 bg-transparent text-[15px] outline-none"
          />
        </label>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={cx('h-10 shrink-0 rounded-full border px-5 text-sm font-bold transition', filter === f ? 'border-deep bg-deep text-white' : 'border-line bg-white hover:border-deep')}>
            {t(`discover.filters.${f}`)}
          </button>
        ))}
      </div>

      {shown.length === 0 && <p className="py-10 text-center text-muted">{t('discover.noResults')}</p>}
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <li key={p.id}>
            <Link href={`/place/${p.id}`} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="relative aspect-[16/10] overflow-hidden bg-mint">
                <PlaceHero place={p} label={t('place.photo', { name: pickText(p.name, lang) })} />
                <Tag className="absolute start-3 top-3 bg-white/90 text-deep">{t(`placeType.${p.type}`)}</Tag>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="text-lg font-extrabold group-hover:text-deep">{pickText(p.name, lang)}</h3>
                <p className="flex-1 text-sm text-muted">{pickText(p.blurb, lang)}</p>
                <p className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-sm font-bold text-deep">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="cal" size={16} className="text-deep" />
                    {daysLabel(p, t)}
                  </span>
                  <span>{estimates === null ? t('common.loading') : estimates[p.id] ? t('place.budgetFor', { amount: formatRs(estimates[p.id]!.total, lang), people: cardPlan(p).people }) : t('common.priceNotSet')}</span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {estimates && <p className="text-xs text-muted">{t('discover.priceNote')}</p>}
    </section>
  );
}
