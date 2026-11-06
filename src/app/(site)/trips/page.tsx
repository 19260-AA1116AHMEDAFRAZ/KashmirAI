'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Icon } from '@/components/Icon';
import { Container, PageHeading } from '@/components/site/Container';
import { Card, Tag } from '@/components/ui';
import { EMERGENCY_CONTACTS, NEELUM_SAMPLE, PLACES } from '@/data/sample';
import { useT } from '@/i18n/provider';
import { formatRs, pickText } from '@/lib/format';
import { planQuery } from '@/lib/plan';

const PACK_ITEMS = ['cnic', 'cash', 'jacket', 'power', 'meds'] as const;
const PACK_KEY = 'kashmirai-packing-list';

// Packing ticks are saved in this browser (localStorage), so they survive closing the tab.
function readPacked(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(PACK_KEY) ?? '{}');
  } catch {
    return {};
  }
}

// My trips & safety.
export default function TripsPage() {
  const { t, lang } = useT();
  const [packed, setPacked] = useState<Record<string, boolean>>({});
  // localStorage only exists in the browser, so load the ticks after the first render.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setPacked(readPacked()), []);
  const packedCount = PACK_ITEMS.filter((id) => packed[id]).length;

  const toggle = (id: string) => {
    const next = { ...packed, [id]: !packed[id] };
    setPacked(next);
    try {
      localStorage.setItem(PACK_KEY, JSON.stringify(next));
    } catch {
      // storage blocked (private mode): the ticks just won't be remembered
    }
  };

  // One sample saved trip for now; real saved trips come with the trip-saving phase.
  const neelum = PLACES.find((p) => p.id === NEELUM_SAMPLE.placeId)!;
  const sampleTrip = planQuery({ places: ['neelum'], city: 'isb', days: NEELUM_SAMPLE.days, people: NEELUM_SAMPLE.people, style: 'budget' });

  return (
    <Container>
      <PageHeading
        title={t('trips.title')}
        actions={
          <span className="flex h-9 items-center gap-1.5 rounded-full bg-mint px-3.5 text-sm font-bold text-deep">
            <Icon name="download" size={16} strokeWidth={2.2} className="text-deep" />
            {t('trips.readyOffline')}
          </span>
        }
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <Link href={`/trip?${sampleTrip}`} className="group grid overflow-hidden rounded-3xl border border-line bg-white transition hover:shadow-lg sm:grid-cols-5">
            <div className="relative h-48 sm:col-span-2 sm:h-auto">
              <Image src="/places/neelum.jpg" alt={pickText(neelum.name, lang)} fill loading="eager" sizes="(min-width: 640px) 40vw, 100vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center gap-2 p-6 sm:col-span-3">
              <span>
                <Tag className="bg-seg text-muted">{t('common.sample')}</Tag>
              </span>
              <span className="text-xl font-extrabold">{t('trip.title', { place: pickText(neelum.name, lang), days: NEELUM_SAMPLE.days })}</span>
              <span className="text-muted">{t('trips.tripMeta', { people: NEELUM_SAMPLE.people, amount: formatRs(NEELUM_SAMPLE.total, lang) })}</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-deep group-hover:gap-2.5">
                {t('trips.open')}
                <Icon name="arrow" size={18} className="text-deep" />
              </span>
            </div>
          </Link>

          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-extrabold">{t('trips.packing')}</h2>
              <span className="text-sm font-semibold text-muted">{t('trips.packed', { done: packedCount, total: PACK_ITEMS.length })}</span>
            </div>
            <ul className="grid overflow-hidden rounded-3xl border border-line bg-white sm:grid-cols-2">
              {PACK_ITEMS.map((id) => {
                const on = !!packed[id];
                return (
                  <li key={id} className="border-b border-seg sm:odd:border-e">
                    <label className="flex min-h-14 cursor-pointer items-center gap-3 px-5 hover:bg-bg">
                      <input type="checkbox" checked={on} onChange={() => toggle(id)} className="peer sr-only" />
                      <span className={`flex h-6 w-6 items-center justify-center rounded-[7px] border-2 peer-focus-visible:outline-3 peer-focus-visible:outline-green ${on ? 'border-green bg-green' : 'border-[#8A9A91] bg-white'}`}>
                        {on && <Icon name="check" size={16} strokeWidth={3} className="text-white" />}
                      </span>
                      <span className={`text-[15px] ${on ? 'text-muted line-through' : ''}`}>{t(`trips.pack.${id}`)}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <h2 className="text-xl font-extrabold">{t('trips.safety')}</h2>
          <Card className="flex items-center gap-3 p-5">
            <Icon name="sun" size={40} strokeWidth={1.8} className="text-gold-icon" />
            <p className="flex-1 text-sm text-muted">{t('trips.weatherSoon')}</p>
          </Card>
          {EMERGENCY_CONTACTS.map((c) => (
            <a key={c.id} href={`tel:${c.number}`} className={`flex items-center gap-4 rounded-3xl p-5 text-white transition hover:opacity-90 ${c.kind === 'rescue' ? 'bg-clay' : 'bg-deep'}`}>
              <Icon name={c.kind === 'rescue' ? 'phone' : 'shield'} size={28} className="text-white" />
              <span className="flex flex-col">
                <span className="latin text-3xl font-extrabold">{c.number}</span>
                <span className="text-sm font-semibold">{pickText(c.label, lang)}</span>
              </span>
            </a>
          ))}
        </aside>
      </div>
    </Container>
  );
}
