'use client';

import { useState } from 'react';

import { Icon } from '@/components/Icon';
import { Segmented } from '@/components/Segmented';
import { Button, cx } from '@/components/ui';
import type { ItineraryDay } from '@/data/types';
import { useT } from '@/i18n/provider';
import { formatClock, pickText } from '@/lib/format';

// Day tabs and the timeline for the chosen day.
// `ai`: the plan was written by Gemini for this trip (not the stored itinerary).
export function DayPlan({ days, itinerary, ai }: { days: number; itinerary: ItineraryDay[]; ai?: boolean }) {
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
        {ai && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <Icon name="info" size={14} className="text-muted" />
            {t('trip.aiPlan')}
          </p>
        )}
      </section>
    </>
  );
}

// Every day of the plan, for the printed / PDF version only (the screen shows one day at a time).
export function PrintDays({ itinerary, ai }: { itinerary: ItineraryDay[]; ai?: boolean }) {
  const { t, lang } = useT();
  return (
    <div className="hidden flex-col gap-5 print:flex">
      {itinerary.map((d) => (
        <section key={d.day_number} className="break-inside-avoid">
          <h2 className="mb-2 border-b border-line pb-1 text-lg font-extrabold">{t('trip.dayTitle', { n: d.day_number, title: pickText(d.title, lang) })}</h2>
          <ul className="flex flex-col gap-2">
            {d.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-20 shrink-0 text-sm font-bold">{formatClock(s.time, lang)}</span>
                <span className="flex flex-col">
                  <span className="text-[15px] font-bold">{pickText(s.title, lang)}</span>
                  <span className="text-[13px]">{pickText(s.note, lang)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {ai && <p className="text-xs">{t('trip.aiPlan')}</p>}
    </div>
  );
}

// "Save plan as PDF": opens the browser's print window with the plan sheet, where "Save as PDF" is
// the destination (this keeps Urdu text and its right-to-left layout correct, and the text selectable).
// The page title becomes the PDF's file name while the window is open.
export function SavePdfButton({ fileName }: { fileName: string }) {
  const { t } = useT();
  const save = () => {
    const before = document.title;
    const restore = () => {
      document.title = before;
      window.removeEventListener('afterprint', restore);
    };
    document.title = fileName;
    window.addEventListener('afterprint', restore);
    window.print();
  };
  return (
    <div className="flex flex-col gap-2 print:hidden">
      <Button variant="outline" icon="download" onClick={save} className="min-h-[52px] text-[15px]">
        {t('trip.savePdf')}
      </Button>
      <p className="text-xs text-muted">{t('trip.pdfHint')}</p>
    </div>
  );
}
