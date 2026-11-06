import Image from 'next/image';
import Link from 'next/link';

import { Icon, Spark } from '@/components/Icon';
import { EstimatedNote, SampleDataNotice } from '@/components/Notes';
import { Container } from '@/components/site/Container';
import { Button } from '@/components/ui';
import { getT } from '@/i18n/server';
import { fetchPlaces, fetchPrices, fetchRoadUpdates } from '@/lib/data';
import { formatWhen, pickText } from '@/lib/format';
import { DiscoverList } from './DiscoverList';

// Discover: hero, road update, searchable grid of places and the partners call-out.
export default async function DiscoverPage() {
  const { t, lang } = await getT();
  const [places, roads, prices] = await Promise.all([fetchPlaces(), fetchRoadUpdates(), fetchPrices()]);
  // The road banner shows the newest update that has a note.
  const road = roads.filter((r) => r.note).sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <Image src="/places/arangkel.jpg" alt="" fill preload sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[rgba(15,40,30,0.85)] via-[rgba(15,40,30,0.55)] to-[rgba(15,40,30,0.15)] rtl:bg-gradient-to-l" />
        <Container className="flex min-h-[360px] flex-col justify-center gap-4 py-14 text-white sm:min-h-[440px]">
          <p className="text-sm font-semibold text-on-deep-muted sm:text-base">{t('discover.greeting')}</p>
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-6xl">{t('discover.title')}</h1>
          <p className="max-w-xl text-base text-on-deep-muted sm:text-lg">{t('welcome.intro')}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button href="/plan" leading={<Spark size={18} />} variant="light">
              {t('planner.title')}
            </Button>
            <Button href="/ask" variant="ghost" icon="chat">
              {t('ask.title')}
            </Button>
          </div>
        </Container>
        <span className="latin absolute end-4 bottom-3 rounded-full bg-[rgba(27,38,33,0.7)] px-2 py-0.5 text-[11px] font-semibold text-white">Arang Kel · Photo: Abdullah Kashif / Unsplash</span>
      </section>

      <Container className="flex flex-col gap-6 pt-8">
        <SampleDataNotice />

        {road && (
          <div className="flex gap-3 rounded-2xl border border-warn-border bg-warn-bg p-4 sm:p-5">
            <Icon name="alert" className="mt-0.5 text-warn-title" />
            <div className="flex flex-1 flex-col gap-1">
              <p className="font-bold text-warn-title">{t('discover.roadUpdate', { segment: pickText(road.segment, lang) })}</p>
              <p className="text-sm text-warn-text">
                {pickText(road.note, lang)} {t('discover.updated', { when: formatWhen(road.updated_at, lang) })}
              </p>
              <EstimatedNote lastChecked={road.last_checked} sample={road.source === 'sample'} className="text-warn-text" />
            </div>
          </div>
        )}

        <DiscoverList places={places} prices={prices} />

        <Link href="/partners?place=neelum" className="group flex flex-col items-start gap-4 rounded-3xl bg-deep p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Icon name="home" size={28} className="text-white" />
          </span>
          <span className="flex flex-1 flex-col gap-1">
            <span className="text-xl font-extrabold">{t('discover.partnersTitle')}</span>
            <span className="text-on-deep-muted">{t('discover.partnersSub')}</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-bold text-deep transition group-hover:gap-3">
            {t('partners.title')}
            <Icon name="arrow" size={18} className="text-deep" />
          </span>
        </Link>
      </Container>
    </div>
  );
}
