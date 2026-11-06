'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import type { PartnerDraft } from '@/lib/admin/drafts';
import { deletePartner, savePartner, setPartnerActive } from '../actions';
import { AdminButton, Check, ConfirmButton, Field, I18nField, Section, SaveBar, Select, TextArea, TextInput, useAdminAction } from '../_components/fields';

const KINDS = [
  { value: 'stay', label: 'Stay (guesthouse / hotel)' },
  { value: 'guide', label: 'Guide' },
  { value: 'jeep', label: 'Jeep' },
];
const UNITS = [
  { value: 'night', label: 'per night' },
  { value: 'day', label: 'per day' },
];

// Add or edit a stay, guide or jeep, including the price travellers see.
export function PartnerForm({ initial, id, places }: { initial: PartnerDraft; id: string | null; places: { value: string; label: string }[] }) {
  const router = useRouter();
  const [d, setD] = useState(initial);
  const { pending, message, run } = useAdminAction();
  const set = <K extends keyof PartnerDraft>(key: K, value: PartnerDraft[K]) => setD((prev) => ({ ...prev, [key]: value }));
  const input = (key: keyof PartnerDraft) => ({ value: d[key] as string, onChange: (e: { target: { value: string } }) => set(key, e.target.value as never) });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(() => savePartner(d, id), {
      success: id ? 'Saved. The site shows the change now.' : undefined,
      then: (r) => !id && router.push(`/admin/partners?place=${d.place_id}&added=${r.id}`),
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <Section title="Partner">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Place" htmlFor="place">
            <Select id="place" required options={[{ value: '', label: 'Choose a place…' }, ...places]} {...input('place_id')} />
          </Field>
          <Field label="Type" htmlFor="kind">
            <Select
              id="kind"
              options={KINDS}
              value={d.kind}
              // Stays are usually priced per night, guides and jeeps per day.
              onChange={(e) => setD((prev) => ({ ...prev, kind: e.target.value, price_unit: e.target.value === 'stay' ? 'night' : 'day' }))}
            />
          </Field>
        </div>
        <I18nField label="Name" required value={d.name} onChange={(v) => set('name', v)} />
        <I18nField label="Description" required multiline value={d.description} onChange={(v) => set('description', v)} />
        <Check label="Show on the site" hint="Untick to hide this partner from travellers." checked={d.active} onChange={(v) => set('active', v)} />
      </Section>

      <Section title="Price and contact" description="Travellers see “From Rs … per night/day”. Leave the price empty to show “Price not set yet”.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price (Rs)" htmlFor="price">
            <TextInput id="price" type="number" min={0} step={1} {...input('price_pkr')} placeholder="Not set" />
          </Field>
          <Field label="Per" htmlFor="unit">
            <Select id="unit" options={UNITS} {...input('price_unit')} />
          </Field>
          <Field label="Phone" htmlFor="phone" hint="International format, e.g. +923001234567">
            <TextInput id="phone" type="tel" inputMode="tel" {...input('phone')} />
          </Field>
        </div>
      </Section>

      <Section title="Featured listing" description="Paid listing (Rs 2,000 / month): shown first in its list until the end date.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Check label="Featured" checked={d.featured} onChange={(v) => set('featured', v)} />
          <Field label="Featured until" htmlFor="until" hint="Empty = no end date.">
            <TextInput id="until" type="date" disabled={!d.featured} {...input('featured_until')} />
          </Field>
        </div>
      </Section>

      <Section title="Checks">
        <div className="grid gap-4 sm:grid-cols-2">
          <Check label="Checked by the team" checked={d.verified} onChange={(v) => set('verified', v)} />
          <Field label="Last checked" htmlFor="checked">
            <TextInput id="checked" type="date" {...input('last_checked')} />
          </Field>
        </div>
        <Field label="Team note (not shown on the site)" htmlFor="todo">
          <TextArea id="todo" rows={2} {...input('todo')} />
        </Field>
      </Section>

      <SaveBar pending={pending} message={message} label={id ? 'Save changes' : 'Add partner'} />
    </form>
  );
}

export function DeletePartner({ id, name, placeId }: { id: string; name: string; placeId: string }) {
  const router = useRouter();
  const { pending, message, run } = useAdminAction();
  return (
    <Section title="Delete partner" description={`Removes ${name} for good, with its requests and referral counts. To take it off the site for now, untick “Show on the site” instead.`}>
      {message && <p className="text-sm text-clay">{message.text}</p>}
      <div>
        <ConfirmButton label="Delete partner" confirm={`Delete ${name}?`} disabled={pending} onConfirm={() => run(() => deletePartner(id), { then: () => router.push(`/admin/partners?place=${placeId}`) })} />
      </div>
    </Section>
  );
}

// Show / hide straight from the list.
export function ActiveToggle({ id, active }: { id: string; active: boolean }) {
  const { pending, message, run } = useAdminAction();
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <AdminButton kind="outline" className="h-8 px-3 text-xs" disabled={pending} onClick={() => run(() => setPartnerActive(id, !active))}>
        {pending ? '…' : active ? 'Hide' : 'Show'}
      </AdminButton>
      {message?.kind === 'error' && <span className="text-xs text-clay">{message.text}</span>}
    </span>
  );
}
