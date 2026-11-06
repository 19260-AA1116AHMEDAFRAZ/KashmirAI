'use client';

import { useState } from 'react';

import { Icon } from '@/components/Icon';
import { EstimatedNote } from '@/components/Notes';
import { Segmented } from '@/components/Segmented';
import type { Place, RoadStatus, RoadUpdate } from '@/data/types';
import { useT } from '@/i18n/provider';
import { formatWhen, pickText } from '@/lib/format';

type Tab = 'stops' | 'tips' | 'road';

const ROAD_COLORS: Record<RoadStatus, string> = {
  open: 'bg-mint text-deep',
  slow: 'bg-warn-bg text-warn-title',
  closed: 'bg-[#F6DCD3] text-[#8E2B12]',
};

// Stops / Local tips / Road tabs on a place page.
export function PlaceTabs({ place, roads }: { place: Place; roads: RoadUpdate[] }) {
  const { t, lang } = useT();
  const [tab, setTab] = useState<Tab>('stops');

  return (
    <>
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { id: 'stops', label: t('place.tabs.stops') },
          { id: 'tips', label: t('place.tabs.tips') },
          { id: 'road', label: t('place.tabs.road') },
        ]}
      />

      {tab === 'stops' &&
        (place.stops.length === 0 ? (
          <p className="text-muted">{t('place.noStops')}</p>
        ) : (
          <ol>
            {place.stops.map((s, i) => (
              <li key={i} className="flex gap-3.5 border-b border-line py-3">
                <span className="latin flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-deep text-[13px] font-bold text-white">{i + 1}</span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-bold">{pickText(s.name, lang)}</span>
                  <span className="text-[13px] text-muted">{pickText(s.note, lang)}</span>
                </div>
              </li>
            ))}
          </ol>
        ))}

      {tab === 'tips' &&
        (place.tips.length === 0 ? (
          <p className="text-muted">{t('place.noTips')}</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            <ul className="flex flex-col gap-2.5">
              {place.tips.map((tip, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <Icon name="check" size={20} strokeWidth={2.2} className="text-green" />
                  <span>{pickText(tip, lang)}</span>
                </li>
              ))}
            </ul>
            <EstimatedNote lastChecked={place.last_checked} />
          </div>
        ))}

      {tab === 'road' &&
        (roads.length === 0 ? (
          <p className="text-muted">{t('place.noRoad')}</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {roads.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 rounded-[14px] border border-line bg-white px-3.5 py-3">
                <span className="text-sm font-semibold">{pickText(r.segment, lang)}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ROAD_COLORS[r.status]}`}>{t(`road.${r.status}`)}</span>
              </div>
            ))}
            <p className="text-xs text-muted">{t('place.roadSource', { when: formatWhen(roads[0].updated_at, lang) })}</p>
            <EstimatedNote lastChecked={roads[0].last_checked} sample={roads[0].source === 'sample'} />
          </div>
        ))}
    </>
  );
}

// Bookmark toggle on the place photo (saving places for real comes in a later phase).
export function SaveButton() {
  const { t } = useT();
  const [saved, setSaved] = useState(false);
  return (
    <button type="button" aria-pressed={saved} aria-label={t('place.save')} onClick={() => setSaved(!saved)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
      <Icon name="bookmark" filled={saved} className="text-deep" />
    </button>
  );
}
