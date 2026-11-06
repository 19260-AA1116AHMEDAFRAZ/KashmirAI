'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, type ReactNode, useState } from 'react';

import { Icon } from '@/components/Icon';
import { PHOTOS } from '@/data/images';
import { emptyI18n, type I18nDraft, type PlaceDraft } from '@/lib/admin/drafts';
import { deletePlace, savePlace } from '../actions';
import { AdminButton, Check, ConfirmButton, Field, I18nField, Section, SaveBar, Select, TextArea, TextInput, useAdminAction } from '../_components/fields';

const TYPES = [
  { value: 'valley', label: 'Valley' },
  { value: 'lake', label: 'Lake' },
  { value: 'hilltop', label: 'Hilltop' },
  { value: 'town', label: 'Town' },
];
const PHOTO_OPTIONS = [{ value: '', label: 'No photo (drawn hills)' }, ...Object.keys(PHOTOS).map((k) => ({ value: k, label: `${k} (${PHOTOS[k]})` }))];

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

// Add or edit a place. Everything Discover, the place page and the planner show about it.
export function PlaceForm({ initial, isNew }: { initial: PlaceDraft; isNew: boolean }) {
  const router = useRouter();
  const [d, setD] = useState(initial);
  const [idTouched, setIdTouched] = useState(!isNew);
  const { pending, message, run } = useAdminAction();
  const set = <K extends keyof PlaceDraft>(key: K, value: PlaceDraft[K]) => setD((prev) => ({ ...prev, [key]: value }));
  const input = (key: keyof PlaceDraft) => ({ value: d[key] as string, onChange: (e: { target: { value: string } }) => set(key, e.target.value as never) });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(() => savePlace(d, isNew), {
      success: isNew ? undefined : 'Saved. The site shows the change now.',
      then: (r) => isNew && router.push(`/admin/places/${r.id}?created=1`),
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <Section title="Basics">
        <I18nField
          label="Name"
          required
          value={d.name}
          onChange={(name) => setD((prev) => ({ ...prev, name, id: idTouched ? prev.id : slug(name.en) }))}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Place id (in the address: /place/…)" htmlFor="id" hint={isNew ? 'Lowercase letters, numbers and dashes. Can’t be changed later.' : 'Can’t be changed.'}>
            <TextInput
              id="id"
              value={d.id}
              disabled={!isNew}
              required
              pattern="[a-z0-9][a-z0-9\-]{1,39}"
              className="font-mono"
              onChange={(e) => {
                setIdTouched(true);
                set('id', e.target.value.toLowerCase());
              }}
            />
          </Field>
          <Field label="Type" htmlFor="type">
            <Select id="type" options={TYPES} {...input('type')} />
          </Field>
          <Field label="Order on the site" htmlFor="sort" hint="Smaller numbers come first.">
            <TextInput id="sort" type="number" min={0} {...input('sort_order')} />
          </Field>
        </div>
        <I18nField label="District" value={d.district} onChange={(v) => set('district', v)} />
        <Check label="Show on the site" hint="Untick to hide the place from Discover, the planner and its page." checked={d.active} onChange={(v) => set('active', v)} />
      </Section>

      <Section title="What travellers read">
        <I18nField label="Card line (one sentence on Discover)" required value={d.blurb} onChange={(v) => set('blurb', v)} />
        <I18nField label="Description (top of the place page)" required multiline value={d.description} onChange={(v) => set('description', v)} />
        <I18nField label="Best season" value={d.best_season} onChange={(v) => set('best_season', v)} hint="e.g. May – October" />
        <I18nField label="Phone signal" value={d.signal_note} onChange={(v) => set('signal_note', v)} hint="e.g. Weak after Keran" />
      </Section>

      <Section title="Trip length" description="Used for “Ideal stay” and for the example budget on the cards.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Shortest stay (days)" htmlFor="dmin">
            <TextInput id="dmin" type="number" min={1} max={30} {...input('days_min')} />
          </Field>
          <Field label="Longest stay (days)" htmlFor="dmax">
            <TextInput id="dmax" type="number" min={1} max={30} {...input('days_max')} />
          </Field>
          <Field label="Jeep days in the budget" htmlFor="jeep" hint="e.g. 1 for the Kel → Arang Kel jeep.">
            <TextInput id="jeep" type="number" min={0} max={30} {...input('jeep_days')} />
          </Field>
        </div>
      </Section>

      <Section title="Map and photo">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Google Maps search" htmlFor="maps" hint="What “Open in Google Maps” looks for." className="sm:col-span-3">
            <TextInput id="maps" required {...input('maps_query')} placeholder="e.g. Neelum Valley, Azad Kashmir" />
          </Field>
          <Field label="Latitude" htmlFor="lat">
            <TextInput id="lat" inputMode="decimal" {...input('lat')} placeholder="34.59" />
          </Field>
          <Field label="Longitude" htmlFor="lon">
            <TextInput id="lon" inputMode="decimal" {...input('lon')} placeholder="73.91" />
          </Field>
          <Field label="Photo" htmlFor="photo" hint="Photos live in public/places (add a file there and to src/data/images.ts for a new one).">
            <Select id="photo" options={PHOTO_OPTIONS} {...input('image_key')} />
          </Field>
          <Field label="Photo credit" htmlFor="credit" className="sm:col-span-3">
            <TextInput id="credit" {...input('image_credit')} placeholder="Photo: Name / Unsplash" />
          </Field>
        </div>
      </Section>

      <ListSection
        title="Stops"
        description="The route on the place page, in order."
        items={d.stops}
        onChange={(stops) => set('stops', stops)}
        make={() => ({ name: emptyI18n(), note: emptyI18n() })}
        render={(stop, update, i) => (
          <>
            <I18nField label={`Stop ${i + 1}`} required value={stop.name} onChange={(name) => update({ ...stop, name })} />
            <I18nField label="Note" value={stop.note} onChange={(note) => update({ ...stop, note })} />
          </>
        )}
      />

      <ListSection
        title="Tips"
        description="Local tips on the place page."
        items={d.tips}
        onChange={(tips) => set('tips', tips)}
        make={emptyI18n}
        render={(tip: I18nDraft, update, i) => <I18nField label={`Tip ${i + 1}`} required value={tip} onChange={update} />}
      />

      <Section title="Checks" description="Travellers see “Estimated, check locally” with the last-checked date.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Check label="Checked by the team" checked={d.verified} onChange={(v) => set('verified', v)} />
          <Field label="Last checked" htmlFor="checked">
            <TextInput id="checked" type="date" {...input('last_checked')} />
          </Field>
        </div>
        <Field label="Team note (not shown on the site)" htmlFor="todo">
          <TextArea id="todo" rows={2} {...input('todo')} placeholder="What still needs filling in or checking" />
        </Field>
      </Section>

      <SaveBar pending={pending} message={message} label={isNew ? 'Add place' : 'Save changes'}>
        {!isNew && (
          <a href={`/place/${d.id}`} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-1.5 px-2 text-sm font-bold text-deep hover:underline">
            View on site
            <Icon name="arrow" size={16} className="text-deep" />
          </a>
        )}
      </SaveBar>
    </form>
  );
}

// A list of rows that can be added, removed and reordered.
function ListSection<T>({
  title,
  description,
  items,
  onChange,
  make,
  render,
}: {
  title: string;
  description: string;
  items: T[];
  onChange: (items: T[]) => void;
  make: () => T;
  render: (item: T, update: (item: T) => void, index: number) => ReactNode;
}) {
  const update = (i: number) => (item: T) => onChange(items.map((x, j) => (j === i ? item : x)));
  const move = (i: number, by: number) => {
    const next = [...items];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    onChange(next);
  };
  return (
    <Section
      title={title}
      description={description}
      actions={
        <AdminButton kind="outline" onClick={() => onChange([...items, make()])}>
          <Icon name="plus" size={16} className="text-current" />
          Add
        </AdminButton>
      }>
      {items.length === 0 && <p className="text-sm text-muted">None yet.</p>}
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl border border-seg bg-bg/60 p-3">
          {render(item, update(i), i)}
          <div className="flex gap-1">
            <AdminButton kind="quiet" disabled={i === 0} onClick={() => move(i, -1)}>
              Move up
            </AdminButton>
            <AdminButton kind="quiet" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
              Move down
            </AdminButton>
            <AdminButton kind="quiet" className="ms-auto text-clay!" onClick={() => onChange(items.filter((_, j) => j !== i))}>
              Remove
            </AdminButton>
          </div>
        </div>
      ))}
    </Section>
  );
}

// Delete a place for good (its partners, requests, prices, itinerary and road updates go too).
export function DeletePlace({ id, name, partnerCount }: { id: string; name: string; partnerCount: number }) {
  const router = useRouter();
  const { pending, message, run } = useAdminAction();
  return (
    <Section
      title="Delete place"
      description={`Removes ${name} for good, with its ${partnerCount} partner(s) and their requests, its prices, itinerary and road updates. To take it off the site for now, untick “Show on the site” instead.`}>
      {message && <p className="text-sm text-clay">{message.text}</p>}
      <div>
        <ConfirmButton label="Delete place" confirm={`Delete ${name} and everything linked to it?`} disabled={pending} onConfirm={() => run(() => deletePlace(id), { then: () => router.push('/admin/places') })} />
      </div>
    </Section>
  );
}
