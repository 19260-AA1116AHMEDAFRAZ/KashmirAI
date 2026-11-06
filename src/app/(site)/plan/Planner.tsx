'use client';

import { useState, type ReactNode } from 'react';

import { Spark } from '@/components/Icon';
import { EstimatedNote } from '@/components/Notes';
import { Container, PageHeading } from '@/components/site/Container';
import { Button, Card, cx, Label } from '@/components/ui';
import type { Place, Price } from '@/data/types';
import { useT } from '@/i18n/provider';
import { formatRs, pickText } from '@/lib/format';
import { estimateTrip } from '@/lib/budget';
import { CITIES, LIMITS, planQuery, STYLES, type PlanInput } from '@/lib/plan';

const pill = (on: boolean) => cx('rounded-2xl border-2 font-bold transition', on ? 'border-green bg-mint text-deep' : 'border-line bg-white text-ink hover:border-green');

// Plan page: choices on the left, a sticky summary with the estimate on the right.
export function Planner({ places, prices, initial }: { places: Place[]; prices: Price[]; initial: PlanInput }) {
  const { t, lang } = useT();
  const [plan, setPlan] = useState<PlanInput>(initial);
  const update = (changes: Partial<PlanInput>) => setPlan((p) => ({ ...p, ...changes }));
  const place = places.find((p) => p.id === plan.place);
  const estimate = estimateTrip(plan, place, prices);

  return (
    <Container>
      <PageHeading title={t('planner.title')} subtitle={t('planner.subtitle')} />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Section label={t('planner.from')}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CITIES.map((c) => (
                <button key={c} type="button" aria-pressed={plan.city === c} onClick={() => update({ city: c })} className={cx('h-12 text-sm', pill(plan.city === c))}>
                  {t(`cities.${c}`)}
                </button>
              ))}
            </div>
          </Section>

          <Section label={t('planner.to')}>
            <div className="flex flex-wrap gap-2.5">
              {places.map((p) => (
                <button key={p.id} type="button" aria-pressed={plan.place === p.id} onClick={() => update({ place: p.id })} className={cx('h-11 rounded-full! px-5 text-sm', pill(plan.place === p.id))}>
                  {pickText(p.name, lang)}
                </button>
              ))}
            </div>
          </Section>

          <div className="grid gap-5 sm:grid-cols-2">
            <Stepper label={t('planner.days')} value={plan.days} onChange={(days) => update({ days })} {...LIMITS.days} />
            <Stepper label={t('planner.travellers')} value={plan.people} onChange={(people) => update({ people })} {...LIMITS.people} />
          </div>

          <Section label={t('planner.style')}>
            <div className="grid grid-cols-3 gap-3">
              {STYLES.map((s) => (
                <button key={s} type="button" aria-pressed={plan.style === s} onClick={() => update({ style: s })} className={cx('flex min-h-18 flex-col items-center justify-center gap-0.5 py-2', pill(plan.style === s))}>
                  <span>{t(`planner.styles.${s}`)}</span>
                  <span className="text-xs font-medium opacity-85">{t(`planner.styleSubs.${s}`)}</span>
                </button>
              ))}
            </div>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-4 rounded-3xl bg-deep p-6 text-white">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-on-deep-muted">{place ? pickText(place.name, lang) : plan.place}</span>
              <span className="text-sm text-on-deep-muted">
                {t('trip.meta', { city: t(`cities.${plan.city}`), people: plan.people, style: t(`planner.styles.${plan.style}`) })} · {t('common.daysCount', { count: plan.days })}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-on-deep-muted">{t('planner.total')}</span>
              {estimate ? (
                <>
                  <span className="text-4xl font-extrabold tracking-tight">{formatRs(estimate.total, lang)}</span>
                  <span className="text-sm text-on-deep-muted">{t('planner.perPerson', { amount: formatRs(estimate.perPerson, lang) })}</span>
                </>
              ) : (
                <span className="text-xl font-extrabold">{t('common.priceNotSet')}</span>
              )}
            </div>
            <EstimatedNote lastChecked={estimate?.lastChecked ?? null} className="text-on-deep-muted" />
            <Button href={`/trip?${planQuery(plan)}`} leading={<Spark size={18} />} variant="light">
              {t('planner.build')}
            </Button>
          </div>
        </aside>
      </div>
    </Container>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <Label>{label}</Label>
      {children}
    </Card>
  );
}

// Card with − value + (days and travellers).
function Stepper({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  const { t } = useT();
  const square = 'latin flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-bg text-2xl font-bold text-deep transition hover:border-green disabled:opacity-40';
  return (
    <Card className="flex flex-col gap-3 p-5">
      <Label>{label}</Label>
      <div className="flex items-center justify-between">
        <button type="button" className={square} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`${t('planner.fewer')} ${label}`}>
          −
        </button>
        <span className="latin text-3xl font-extrabold" aria-live="polite">
          {value}
        </span>
        <button type="button" className={square} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${t('planner.more')} ${label}`}>
          +
        </button>
      </div>
    </Card>
  );
}
