import Link from 'next/link';

import { Icon, Spark } from '@/components/Icon';
import { EstimatedNote } from '@/components/Notes';
import { Container, PageHeading } from '@/components/site/Container';
import { Button, Tag } from '@/components/ui';
import { getT } from '@/i18n/server';
import { estimateTrip } from '@/lib/budget';
import { fetchItinerary, fetchPlace, fetchPrices } from '@/lib/data';
import { formatRs, pickText } from '@/lib/format';
import { planFromParams, planQuery } from '@/lib/plan';
import { DayPlan, SaveOfflineButton } from './TripParts';

// Colours of the four budget parts, from the prototype.
const SPLIT_COLORS = { transport: '#F2D98A', stay: '#9CC1A8', food: '#CFE3EC', extras: '#FFFFFF' } as const;
type SplitKey = keyof typeof SPLIT_COLORS;

// Trip & budget, built from the plan in the address (so it can be bookmarked or shared).
export default async function TripPage({ searchParams }: PageProps<'/trip'>) {
  const plan = planFromParams(await searchParams);
  const [{ t, lang }, place, itinerary, prices] = await Promise.all([getT(), fetchPlace(plan.place), fetchItinerary(plan.place), fetchPrices(plan.place)]);
  const placeName = place ? pickText(place.name, lang) : plan.place;
  const estimate = place ? estimateTrip(plan, place, prices) : null;
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
        subtitle={t('trip.meta', { city: t(`cities.${plan.city}`), people: plan.people, style: t(`planner.styles.${plan.style}`) })}
        back={
          <Link href={`/plan?${planQuery(plan)}`} aria-label={t('trip.backToPlanner')} className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white hover:border-deep">
            <Icon name="back" />
          </Link>
        }
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
            <DayPlan days={plan.days} itinerary={itinerary} />
          </div>
          <SaveOfflineButton />
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
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
            <EstimatedNote lastChecked={estimate?.lastChecked ?? null} className="text-on-deep-muted" />
            <Button href={`/partners?place=${plan.place}`} iconAfter="arrow" variant="light">
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
