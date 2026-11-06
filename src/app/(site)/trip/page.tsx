import Link from 'next/link';
import { Suspense } from 'react';

import { Icon, Spark } from '@/components/Icon';
import { EstimatedNote } from '@/components/Notes';
import { Logo } from '@/components/Brand';
import { Container, PageHeading } from '@/components/site/Container';
import { cityName } from '@/data/cities';
import { Button, Tag } from '@/components/ui';
import { getT } from '@/i18n/server';
import { fetchItinerary, fetchPlanPlace, fetchPrices } from '@/lib/data';
import { estimateForPlan } from '@/lib/estimate';
import { formatRs, pickText } from '@/lib/format';
import { planFromParams, planQuery } from '@/lib/plan';
import { PlanLoading, PlannedDays } from './PlannedDays';

// Colours of the four budget parts, from the prototype.
const SPLIT_COLORS = { transport: '#F2D98A', stay: '#9CC1A8', food: '#CFE3EC', extras: '#FFFFFF' } as const;
type SplitKey = keyof typeof SPLIT_COLORS;

// Trip & budget, built from the plan in the address (so it can be bookmarked or shared).
export default async function TripPage({ searchParams }: PageProps<'/trip'>) {
  const plan = planFromParams(await searchParams);
  const [{ t, lang }, found, itinerary, prices] = await Promise.all([getT(), Promise.all(plan.places.map(fetchPlanPlace)), fetchItinerary(plan.places[0]), fetchPrices()]);
  const places = found.filter((p) => p !== null);
  const placeName = plan.places.map((id, i) => (found[i] ? pickText(found[i].name, lang) : id)).join(' + ');
  const estimate = await estimateForPlan(plan, places, prices);
  const nights = Math.max(plan.days - 1, 0);
  const splitLabels: Record<SplitKey, string> = {
    transport: t('trip.transport'),
    stay: t('trip.stay', { nights }),
    food: t('trip.food'),
    extras: t('trip.extras'),
  };

  return (
    <Container>
      <PageHeading
        title={t('trip.title', { place: placeName, days: plan.days })}
        subtitle={t('trip.meta', { city: cityName(plan.city, lang), people: plan.people, style: t(`planner.styles.${plan.style}`) })}
        back={
          <Link href={`/plan?${planQuery(plan)}`} aria-label={t('trip.backToPlanner')} className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white hover:border-deep print:hidden">
            <Icon name="back" />
          </Link>
        }
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Printed / PDF version: the trip summary and budget (the days come from PlannedDays) */}
          <section className="hidden flex-col gap-2 print:flex">
            <Logo size={18} />
            {estimate ? (
              <>
                <p className="text-xl font-extrabold">
                  {t('trip.total')}: {formatRs(estimate.total, lang)} <span className="text-sm font-semibold">({t('trip.perPerson', { amount: formatRs(estimate.perPerson, lang) })})</span>
                </p>
                <p className="text-sm">{(Object.keys(splitLabels) as SplitKey[]).map((k) => `${splitLabels[k]}: ${formatRs(estimate.split[k], lang)}`).join(' · ')}</p>
                <EstimatedNote lastChecked={estimate.lastChecked} ai={estimate.source === 'ai'} className="text-ink" />
              </>
            ) : (
              <p className="font-bold">{t('common.priceNotSet')}</p>
            )}
          </section>
          <Suspense fallback={<PlanLoading t={t} />}>
            <PlannedDays plan={plan} places={places} stored={itinerary} lang={lang} fileName={`KashmirAI - ${placeName} - ${t('common.daysCount', { count: plan.days })}`} />
          </Suspense>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start print:hidden">
          {/* Budget card */}
          <section className="flex flex-col gap-4 rounded-3xl bg-deep p-6 text-white">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-on-deep-muted">{t('trip.total')}</span>
              <span className={estimate ? 'text-4xl font-extrabold tracking-tight' : 'text-xl font-extrabold'}>{estimate ? formatRs(estimate.total, lang) : t('common.priceNotSet')}</span>
              {estimate && <span className="text-sm text-on-deep-muted">{t('trip.perPerson', { amount: formatRs(estimate.perPerson, lang) })}</span>}
            </div>
            {estimate && (
              <>
                <div role="img" aria-label={t('trip.budgetSplit')} className="flex h-3 gap-0.5 overflow-hidden rounded-full">
                  {(Object.keys(SPLIT_COLORS) as SplitKey[]).map((k) => (
                    <span key={k} style={{ flexGrow: estimate.split[k], backgroundColor: SPLIT_COLORS[k] }} />
                  ))}
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {(Object.keys(SPLIT_COLORS) as SplitKey[]).map((k) => (
                    <div key={k} className="flex gap-2">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: SPLIT_COLORS[k] }} />
                      <div>
                        <dt className="text-xs text-on-deep-muted">{splitLabels[k]}</dt>
                        <dd className="text-[15px] font-bold">{formatRs(estimate.split[k], lang)}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </>
            )}
            <EstimatedNote lastChecked={estimate?.lastChecked ?? null} ai={estimate?.source === 'ai'} className="text-on-deep-muted" />
            <Button href={`/partners?place=${plan.places[0]}`} iconAfter="arrow" variant="light">
              {t('trip.book')}
            </Button>
          </section>

          {/* Trip Planner Pro: payments aren't set up yet, so it's "coming soon". */}
          <div className="flex items-center gap-3.5 rounded-3xl border-[1.5px] border-dashed border-gold bg-white p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-soft">
              <Spark color="#B8891A" />
            </span>
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-[15px] font-bold">{t('trip.proTitle')}</span>
              <span className="text-[13px] text-muted">{t('trip.proBody')}</span>
              <span>
                <Tag className="bg-gold-soft text-gold-dark">{t('trip.comingSoon')}</Tag>
              </span>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
