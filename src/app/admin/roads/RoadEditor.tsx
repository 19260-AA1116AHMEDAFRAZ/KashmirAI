'use client';

import { type FormEvent, useState } from 'react';

import { Icon } from '@/components/Icon';
import { cx } from '@/components/ui';
import { roadDraft, type RoadDraft } from '@/lib/admin/drafts';
import type { AdminRoadUpdate } from '@/lib/data';
import { formatWhen } from '@/lib/format';
import { deleteRoadUpdate, saveRoadUpdate } from '../actions';
import { AdminButton, Check, ConfirmButton, Field, I18nField, Notice, Select, TextInput, useAdminAction } from '../_components/fields';
import { Pill } from '../_components/page';

const STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'slow', label: 'Slow (works, landslides…)' },
  { value: 'closed', label: 'Closed' },
];
const STATUS_TONE = { open: 'green', slow: 'gold', closed: 'red' } as const;

type PlaceOption = { value: string; label: string };

// Road updates: the newest one with a note is the banner on Discover; each place page lists its own.
export function RoadEditor({ roads, places, placeFilter }: { roads: AdminRoadUpdate[]; places: PlaceOption[]; placeFilter: string | null }) {
  const [adding, setAdding] = useState(false);
  const placeName = (id: string) => places.find((p) => p.value === id)?.label ?? id;

  return (
    <div className="flex flex-col gap-4">
      {adding ? (
        <RoadForm initial={roadDraft(null, placeFilter ?? places[0]?.value ?? '')} id={null} places={places} onDone={() => setAdding(false)} />
      ) : (
        <div>
          <AdminButton onClick={() => setAdding(true)}>
            <Icon name="plus" size={16} className="text-current" />
            Add road update
          </AdminButton>
        </div>
      )}
      {roads.length === 0 && !adding && <p className="rounded-2xl border border-dashed border-line bg-white py-14 text-center text-sm text-muted">No road updates.</p>}
      {roads.map((r) => (
        <RoadRow key={r.id} road={r} places={places} placeName={placeName(r.place_id)} />
      ))}
    </div>
  );
}

function RoadRow({ road, places, placeName }: { road: AdminRoadUpdate; places: PlaceOption[]; placeName: string }) {
  const [editing, setEditing] = useState(false);
  if (editing) return <RoadForm initial={roadDraft(road)} id={road.id} places={places} onDone={() => setEditing(false)} />;
  return (
    <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-line bg-white p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-bold">{road.segment.en}</span>
          <Pill tone={STATUS_TONE[road.status]}>{road.status}</Pill>
          {!road.verified && <Pill tone="gold">Not checked</Pill>}
          {road.source === 'sample' && <Pill tone="grey">Sample</Pill>}
        </span>
        {road.note?.en && <span className="text-sm text-muted">{road.note.en}</span>}
        <span className="text-xs text-muted">
          {placeName} · updated {formatWhen(road.updated_at, 'en')}
          {road.source && road.source !== 'sample' ? ` · source: ${road.source}` : ''}
        </span>
      </div>
      <AdminButton kind="outline" onClick={() => setEditing(true)}>
        <Icon name="edit" size={16} className="text-current" />
        Edit
      </AdminButton>
    </div>
  );
}

function RoadForm({ initial, id, places, onDone }: { initial: RoadDraft; id: string | null; places: PlaceOption[]; onDone: () => void }) {
  const [d, setD] = useState(initial);
  const { pending, message, run } = useAdminAction();
  const set = <K extends keyof RoadDraft>(key: K, value: RoadDraft[K]) => setD((prev) => ({ ...prev, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(() => saveRoadUpdate(d, id), { then: onDone });
  };

  return (
    <form onSubmit={submit} className={cx('flex flex-col gap-4 rounded-2xl border-2 bg-white p-5', id ? 'border-line' : 'border-green')}>
      <h2 className="font-extrabold">{id ? 'Edit road update' : 'New road update'}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Place" htmlFor={`place-${id}`}>
          <Select id={`place-${id}`} options={places} value={d.place_id} onChange={(e) => set('place_id', e.target.value)} />
        </Field>
        <Field label="Status" htmlFor={`status-${id}`}>
          <Select id={`status-${id}`} options={STATUSES} value={d.status} onChange={(e) => set('status', e.target.value)} />
        </Field>
        <Field label="Order" htmlFor={`order-${id}`}>
          <TextInput id={`order-${id}`} type="number" min={0} value={d.sort_order} onChange={(e) => set('sort_order', e.target.value)} />
        </Field>
      </div>
      <I18nField label="Road segment" required value={d.segment} onChange={(v) => set('segment', v)} hint="e.g. Sharda → Kel" />
      <I18nField label="Note" value={d.note} onChange={(v) => set('note', v)} hint="The road banner on Discover shows the newest update that has a note." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Source (who reported it)" htmlFor={`source-${id}`}>
          <TextInput id={`source-${id}`} value={d.source} onChange={(e) => set('source', e.target.value)} />
        </Field>
        <Field label="Last checked" htmlFor={`checked-${id}`}>
          <TextInput id={`checked-${id}`} type="date" value={d.last_checked} onChange={(e) => set('last_checked', e.target.value)} />
        </Field>
        <div className="flex items-end pb-2.5">
          <Check label="Checked by the team" checked={d.verified} onChange={(v) => set('verified', v)} />
        </div>
      </div>
      {message && <Notice kind={message.kind}>{message.text}</Notice>}
      <div className="flex flex-wrap items-center gap-2">
        <AdminButton type="submit" disabled={pending}>
          {pending ? 'Saving…' : id ? 'Save' : 'Add road update'}
        </AdminButton>
        <AdminButton kind="quiet" onClick={onDone} disabled={pending}>
          Cancel
        </AdminButton>
        {id && (
          <span className="ms-auto">
            <ConfirmButton label="Delete" confirm="Delete this road update?" disabled={pending} onConfirm={() => run(() => deleteRoadUpdate(id), { then: onDone })} />
          </span>
        )}
      </div>
    </form>
  );
}
