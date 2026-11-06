'use client';

import { useState } from 'react';

import { Segmented } from '@/components/Segmented';
import { Button, cx } from '@/components/ui';
import type { ItineraryDay } from '@/data/types';
import { useT } from '@/i18n/provider';
import { formatClock, pickText } from '@/lib/format';

// Day tabs and the timeline for the chosen day.
export function DayPlan({ days, itinerary }: { days: number; itinerary: ItineraryDay[] }) {
  const { t, lang } = useT();
  const [day, setDay] = useState(1);
  const today = itinerary.find((d) => d.day_number === day);
  const dayNumbers = Array.from({ length: days }, (_, i) => i + 1);

  return (
    <>
      {/* A segmented control for short trips, scrolling chips for long ones */}
      {days <= 4 ? (
        <Segmented<string> value={String(day)} onChange={(v) => setDay(Number(v))} options={dayNumbers.map((n) => ({ id: String(n), label: t('trip.day', { n }) }))} />
      ) : (
        <div className="flex gap-2 overflow-x-auto">
          {dayNumbers.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={day === n}
              onClick={() => setDay(n)}
              className={cx('h-10 shrink-0 rounded-full border px-4 text-sm font-bold', day === n ? 'border-deep bg-deep text-white' : 'border-line bg-white')}>
              {t('trip.day', { n })}
            </button>
          ))}
        </div>
      )}

      <section className="flex flex-col gap-1">
        {today ? (
          <>
            <h2 className="mb-1.5 text-[17px] font-extrabold">{t('trip.dayTitle', { n: day, title: pickText(today.title, lang) })}</h2>
            <ol>
              {today.steps.map((s, i) => (
                <li key={i} className="flex gap-3.5">
                  {/* Timeline dot and line */}
                  <span className="flex w-3 flex-col items-center">
                    <span className="mt-1 h-3 w-3 rounded-full bg-green" />
                    <span className="w-0.5 flex-1 bg-timeline" />
                  </span>
                  <div className="flex flex-1 flex-col gap-0.5 pb-3.5">
                    <span className="text-xs font-bold text-green">{formatClock(s.time, lang)}</span>
                    <span className="text-[15px] font-bold">{pickText(s.title, lang)}</span>
                    <span className="text-[13px] text-muted">{pickText(s.note, lang)}</span>
                  </div>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p className="text-muted">{t('trip.noPlan')}</p>
        )}
      </section>
    </>
  );
}

// "Save plan offline" toggle (real offline saving comes in a later phase).
export function SaveOfflineButton() {
  const { t } = useT();
  const [saved, setSaved] = useState(false);
  return (
    <Button variant={saved ? 'soft' : 'outline'} icon="download" aria-pressed={saved} onClick={() => setSaved(!saved)} className="min-h-[52px] text-[15px]">
      {saved ? t('trip.savedOffline') : t('trip.saveOffline')}
    </Button>
  );
}
