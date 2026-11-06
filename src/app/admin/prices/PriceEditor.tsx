'use client';

import { type FormEvent, useMemo, useState } from 'react';

import type { Price, PriceCategory } from '@/data/types';
import { useT } from '@/i18n/provider';
import { PEOPLE_PER_ROOM, SEATS_PER_CAR, SEATS_PER_JEEP, cardPlan, estimateTrip } from '@/lib/budget';
import { PRICE_SLOTS, slotKey, type PriceDraft } from '@/lib/admin/drafts';
import { LIMITS, PRICE_CITIES, STYLES, type PlanInput } from '@/lib/plan';
import { savePrices } from '../actions';
import { Field, SaveBar, Section, Select, TextInput, useAdminAction } from '../_components/fields';
import { rs } from '../_components/page';

const GROUPS: { category: PriceCategory; title: string; unit: string; help: string }[] = [
  { category: 'transport', title: 'Transport', unit: 'per car, round trip', help: `Car from the starting city and back. One car per ${SEATS_PER_CAR} travellers.` },
  { category: 'jeep', title: 'Jeep', unit: 'per jeep, per day', help: `Only counted when the place has jeep days. One jeep per ${SEATS_PER_JEEP} travellers.` },
  { category: 'stay', title: 'Stay', unit: 'per room, per night', help: `Nights = days − 1. One room per ${PEOPLE_PER_ROOM} travellers.` },
  { category: 'food', title: 'Food', unit: 'per person, per day', help: 'Three meals and chai.' },
  { category: 'extras', title: 'Extras', unit: 'per person, per trip', help: 'Entry tickets, chairlift and the like.' },
];

const draftsToPrices = (placeId: string, drafts: PriceDraft[]): Price[] =>
  drafts.map((d, i) => {
    const n = d.amount_pkr.trim() === '' ? null : Number(d.amount_pkr);
    return {
      id: i,
      place_id: placeId,
      category: d.category,
      from_city: d.from_city as Price['from_city'],
      style: d.style as Price['style'],
      unit: PRICE_SLOTS[i].unit,
      amount_pkr: n != null && Number.isFinite(n) ? n : null,
      notes: d.notes || null,
      verified: d.verified,
      last_checked: null,
    };
  });

// The budget calculator's price list for one place, with a live preview of the result.
export function PriceEditor({
  place,
  initial,
}: {
  place: { id: string; name: string; jeep_days: number; days_min: number | null; days_max: number | null };
  initial: PriceDraft[];
}) {
  const { t } = useT();
  const [rows, setRows] = useState(initial);
  const [example, setExample] = useState<PlanInput>(() => cardPlan(place));
  const { pending, message, run } = useAdminAction();

  const update = (key: string, changes: Partial<PriceDraft>) => setRows((prev) => prev.map((r) => (slotKey(r) === key ? { ...r, ...changes } : r)));
  const estimate = useMemo(() => estimateTrip(example, place, draftsToPrices(place.id, rows)), [example, place, rows]);
  const setCount = rows.filter((r) => r.amount_pkr.trim() !== '').length;

  const label = (r: PriceDraft) => (r.from_city ? `From ${t(`cities.${r.from_city}`)}` : r.style ? `${t(`planner.styles.${r.style}`)} (${t(`planner.styleSubs.${r.style}`)})` : 'Price');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(() => savePrices(place.id, rows), { success: 'Prices saved. Budgets on the site use them now.' });
  };

  return (
    <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-5 lg:col-span-2">
        <p className="text-sm text-muted">
          {setCount} of {rows.length} prices set. Leave a price empty if you don&apos;t know it: trips that need it show &ldquo;Price not set yet&rdquo;. Tick
          &ldquo;Checked&rdquo; when someone has confirmed the price locally (it records today as the check date).
        </p>
        {GROUPS.map((g) => {
          const groupRows = rows.filter((r) => r.category === g.category);
          const unused = g.category === 'jeep' && place.jeep_days === 0;
          return (
            <Section key={g.category} title={`${g.title} · ${g.unit}`} description={unused ? `${g.help} This place has 0 jeep days, so the jeep price isn’t used.` : g.help}>
              <div className="flex flex-col divide-y divide-seg">
                {groupRows.map((r) => {
                  const key = slotKey(r);
                  return (
                    <div key={key} className="grid items-end gap-3 py-3 first:pt-0 last:pb-0 sm:grid-cols-12">
                      <Field label={groupRows.length > 1 ? label(r) : 'Amount'} htmlFor={key} className="sm:col-span-4">
                        <div className="relative">
                          <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-sm text-muted">Rs</span>
                          <TextInput id={key} type="number" min={0} step={1} inputMode="numeric" placeholder="Not set" value={r.amount_pkr} onChange={(e) => update(key, { amount_pkr: e.target.value })} className="ps-9" />
                        </div>
                      </Field>
                      <Field label="Note (team only)" htmlFor={`${key}-note`} className="sm:col-span-6">
                        <TextInput id={`${key}-note`} value={r.notes} onChange={(e) => update(key, { notes: e.target.value })} placeholder="Where the price came from" />
                      </Field>
                      <label className="flex h-11 cursor-pointer items-center gap-2 text-sm font-semibold sm:col-span-2">
                        <input type="checkbox" checked={r.verified} onChange={(e) => update(key, { verified: e.target.checked })} className="h-4.5 w-4.5 accent-[var(--color-green)]" />
                        Checked
                      </label>
                    </div>
                  );
                })}
              </div>
            </Section>
          );
        })}
        <SaveBar pending={pending} message={message} label="Save prices" />
      </div>

      <aside className="flex flex-col gap-4 rounded-2xl bg-deep p-5 text-white lg:sticky lg:top-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold tracking-wider text-on-deep-muted uppercase">Preview · {place.name}</span>
          <span className="text-sm text-on-deep-muted">What the planner shows for this trip (before saving).</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-ink">
          <Select aria-label="Starting city" value={example.city} onChange={(e) => setExample({ ...example, city: e.target.value as PlanInput['city'] })} options={PRICE_CITIES.map((c) => ({ value: c, label: t(`cities.${c}`) }))} />
          <Select aria-label="Style" value={example.style} onChange={(e) => setExample({ ...example, style: e.target.value as PlanInput['style'] })} options={STYLES.map((s) => ({ value: s, label: t(`planner.styles.${s}`) }))} />
          <Select
            aria-label="Days"
            value={String(example.days)}
            onChange={(e) => setExample({ ...example, days: Number(e.target.value) })}
            options={Array.from({ length: LIMITS.days.max }, (_, i) => ({ value: String(i + 1), label: `${i + 1} day${i ? 's' : ''}` }))}
          />
          <Select
            aria-label="Travellers"
            value={String(example.people)}
            onChange={(e) => setExample({ ...example, people: Number(e.target.value) })}
            options={Array.from({ length: LIMITS.people.max }, (_, i) => ({ value: String(i + 1), label: `${i + 1} traveller${i ? 's' : ''}` }))}
          />
        </div>
        {estimate ? (
          <>
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold tracking-tight">{rs(estimate.total)}</span>
              <span className="text-sm text-on-deep-muted">{rs(estimate.perPerson)} per person</span>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {(['transport', 'stay', 'food', 'extras'] as const).map((k) => (
                <div key={k}>
                  <dt className="text-xs text-on-deep-muted capitalize">{k === 'transport' ? 'Transport + jeep' : k}</dt>
                  <dd className="font-bold">{rs(estimate.split[k])}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="rounded-xl bg-white/10 p-3 text-sm">
            <span className="font-bold">Price not set yet.</span> This trip needs the {t(`cities.${example.city}`)} car price
            {place.jeep_days > 0 ? ', the jeep price' : ''}
            {example.days > 1 ? `, the ${t(`planner.styles.${example.style}`).toLowerCase()} stay price` : ''}, the {t(`planner.styles.${example.style}`).toLowerCase()} food price and extras.
          </p>
        )}
        <p className="text-xs text-on-deep-muted">Each part is rounded to the nearest Rs 100.</p>
      </aside>
    </form>
  );
}
