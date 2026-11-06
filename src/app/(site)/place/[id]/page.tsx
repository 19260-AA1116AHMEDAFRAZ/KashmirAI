import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon, Spark } from '@/components/Icon';
import { EstimatedNote } from '@/components/Notes';
import { PlaceHero } from '@/components/PlaceImage';
import { Container } from '@/components/site/Container';
import { Button, Card, Label } from '@/components/ui';
import { getT } from '@/i18n/server';
import { cardBudgetText } from '@/lib/estimate';
import { fetchPlace, fetchPrices, fetchRoadUpdates } from '@/lib/data';
import { pickText } from '@/lib/format';
import { daysLabel, googleMapsUrl } from '@/lib/placeText';
import { PlaceTabs, SaveButton } from './PlaceTabs';

// Destination page: photo header, details and tabs, and a sidebar with facts and actions.
export default async function PlacePage({ params }: PageProps<'/place/[id]'>) {
  const { id } = await params;
  const [{ t, lang }, place, roads, prices] = await Promise.all([getT(), fetchPlace(id), fetchRoadUpdates(id), fetchPrices(id)]);
  if (!place) notFound();

  const name = pickText(place.name, lang);
  const typeLine = [t(`placeType.${place.type}`), pickText(place.district, lang)].filter(Boolean).join(' · ');
  const facts: [string, string][] = [
    [t('place.bestTime'), pickText(place.best_season, lang) || t('common.notSet')],
    [t('place.idealStay'), daysLabel(place, t)],
    [t('place.estBudget'), await cardBudgetText(place, prices, lang, t)],
    [t('place.signal'), pickText(place.signal_note, lang) || t('common.notSet')],
  ];

  return (
    <div>
      <section className="relative isolate h-[320px] overflow-hidden bg-[#CFE3EC] sm:h-[440px]">
        <PlaceHero place={place} label={t('place.photo', { name })} preload sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,40,30,0.85)] via-[rgba(15,40,30,0.25)] to-transparent" />
        <Container className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 pb-8 text-white">
          <div className="flex flex-col gap-2">
            <Link href="/discover" className="inline-flex items-center gap-1.5 text-sm font-semibold text-on-deep-muted hover:text-white">
              <Icon name="back" size={16} className="text-current" />
              {t('place.backToDiscover')}
            </Link>
            <Label className="text-on-deep-muted">{typeLine}</Label>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{name}</h1>
          </div>
          <SaveButton />
        </Container>
        {place.image_credit && <span className="latin absolute end-4 top-4 rounded-full bg-[rgba(27,38,33,0.7)] px-2 py-0.5 text-[11px] font-semibold text-white">{place.image_credit}</span>}
      </section>

      <Container className="grid gap-8 pt-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <p className="text-lg text-muted">{pickText(place.description, lang)}</p>
          <PlaceTabs place={place} roads={roads} />
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="flex flex-col gap-4 p-5">
            <dl className="grid grid-cols-2 gap-3">
              {facts.map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5 rounded-2xl bg-bg p-3">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="text-[15px] font-bold">{v}</dd>
                </div>
              ))}
            </dl>
            <EstimatedNote lastChecked={place.last_checked} />
            <Button href={`/plan?place=${place.id}`} leading={<Spark size={18} />}>
              {t('place.planHere')}
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" icon="chat" href="/ask" className="min-h-12 text-[15px]">
                {t('place.ask')}
              </Button>
              <a
                href={googleMapsUrl(place.maps_query)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-deep bg-white px-3 text-[15px] font-bold text-deep">
                <Icon name="map" size={20} className="text-deep" />
                <span className="truncate">{t('place.openMaps')}</span>
              </a>
            </div>
          </Card>
          <Link href={`/partners?place=${place.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 hover:border-deep">
            <Icon name="home" className="text-deep" />
            <span className="flex flex-1 flex-col">
              <span className="font-bold">{t('discover.partnersTitle')}</span>
              <span className="text-sm text-muted">{t('discover.partnersSub')}</span>
            </span>
            <Icon name="chev" size={18} className="text-muted" />
          </Link>
        </aside>
      </Container>
    </div>
  );
}
