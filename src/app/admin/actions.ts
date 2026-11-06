'use server';

import { revalidatePath } from 'next/cache';

import type { AdminResult, PartnerDraft, PlaceDraft, PriceDraft, RoadDraft } from '@/lib/admin/drafts';
import { dbMessage, InvalidInput, parsePartner, parsePlace, parsePlaceId, parsePrices, parseRoad, parseUuid } from '@/lib/admin/parse';
import { todayISO } from '@/lib/partners';
import { createClient, type ServerSupabase } from '@/lib/supabase/server';

// Admin dashboard changes: places, partners (and their prices), the budget price list and road
// updates. Every function checks the caller is an admin before touching anything, and the
// database's security rules check again (anyone else's write changes 0 rows).
// After a change the whole site is refreshed, so travellers see it on their next page load.

type Run = (sb: ServerSupabase) => Promise<AdminResult>;

async function asAdmin(run: Run): Promise<AdminResult> {
  const sb = await createClient();
  if (!sb) return { ok: false, error: 'Connect Supabase (.env.local) to edit data. Sample data is read-only.' };
  const { data } = await sb.auth.getUser();
  if (!data.user) return { ok: false, error: 'Sign in again.' };
  const { data: admin } = await sb.from('admins').select('user_id').eq('user_id', data.user.id).maybeSingle();
  if (!admin) return { ok: false, error: 'Only admins can do this.' };
  try {
    const result = await run(sb);
    if (result.ok) revalidatePath('/', 'layout');
    return result;
  } catch (e) {
    if (e instanceof InvalidInput) return { ok: false, error: e.message };
    console.error('Admin action failed:', e);
    return { ok: false, error: 'Something went wrong. Try again.' };
  }
}

// An update/delete the security rules refused, or a row that's gone, changes 0 rows.
const NOT_FOUND: AdminResult = { ok: false, error: 'Not found, or you are not allowed to change it. Reload the page.' };

// ---- Places ----

export async function savePlace(draft: PlaceDraft, isNew: boolean): Promise<AdminResult> {
  return asAdmin(async (sb) => {
    const id = parsePlaceId(draft.id);
    const row = parsePlace(draft);
    if (isNew) {
      const { error } = await sb.from('places').insert({ id, ...row });
      if (error) return { ok: false, error: error.code === '23505' ? `A place with id "${id}" already exists.` : dbMessage(error, 'place') };
      return { ok: true, id };
    }
    const { data, error } = await sb.from('places').update(row).eq('id', id).select('id');
    if (error) return { ok: false, error: dbMessage(error, 'place') };
    return data.length ? { ok: true, id } : NOT_FOUND;
  });
}

export async function setPlaceActive(id: string, active: boolean): Promise<AdminResult> {
  return asAdmin(async (sb) => {
    const { data, error } = await sb.from('places').update({ active: active === true }).eq('id', parsePlaceId(id)).select('id');
    if (error) return { ok: false, error: dbMessage(error, 'place') };
    return data.length ? { ok: true } : NOT_FOUND;
  });
}

// Also deletes the place's partners (and their requests), prices, itinerary and road updates.
export async function deletePlace(id: string): Promise<AdminResult> {
  return asAdmin(async (sb) => {
    const { data, error } = await sb.from('places').delete().eq('id', parsePlaceId(id)).select('id');
    if (error) return { ok: false, error: dbMessage(error, 'place') };
    return data.length ? { ok: true } : NOT_FOUND;
  });
}

// ---- Partners (stays, guides, jeeps) ----

export async function savePartner(draft: PartnerDraft, id: string | null): Promise<AdminResult> {
  return asAdmin(async (sb) => {
    const row = parsePartner(draft);
    if (id === null) {
      const { data, error } = await sb.from('partners').insert(row).select('id').single();
      if (error) return { ok: false, error: dbMessage(error, 'partner') };
      return { ok: true, id: data.id as string };
    }
    const { data, error } = await sb.from('partners').update(row).eq('id', parseUuid(id)).select('id');
    if (error) return { ok: false, error: dbMessage(error, 'partner') };
    return data.length ? { ok: true, id } : NOT_FOUND;
  });
}

export async function setPartnerActive(id: string, active: boolean): Promise<AdminResult> {
  return asAdmin(async (sb) => {
    const { data, error } = await sb.from('partners').update({ active: active === true }).eq('id', parseUuid(id)).select('id');
    if (error) return { ok: false, error: dbMessage(error, 'partner') };
    return data.length ? { ok: true } : NOT_FOUND;
  });
}

// Also deletes the partner's requests and referral clicks.
export async function deletePartner(id: string): Promise<AdminResult> {
  return asAdmin(async (sb) => {
    const { data, error } = await sb.from('partners').delete().eq('id', parseUuid(id)).select('id');
    if (error) return { ok: false, error: dbMessage(error, 'partner') };
    return data.length ? { ok: true } : NOT_FOUND;
  });
}

// ---- Budget price list (the `prices` table) ----

// Saves the lines that changed. A line ticked "checked" gets today's date as last checked.
export async function savePrices(placeId: string, drafts: PriceDraft[]): Promise<AdminResult> {
  return asAdmin(async (sb) => {
    const place_id = parsePlaceId(placeId);
    const rows = parsePrices(drafts);
    const { data: existing, error: readError } = await sb.from('prices').select('id, category, from_city, style, amount_pkr, verified, notes, last_checked').eq('place_id', place_id);
    if (readError) return { ok: false, error: dbMessage(readError, 'price list') };

    const today = todayISO();
    const writes = rows.flatMap((r) => {
      const { key, ...values } = r;
      const old = existing.find((e) => `${e.category}:${e.from_city ?? ''}:${e.style ?? ''}` === key);
      const changed = !old || old.amount_pkr !== r.amount_pkr || old.verified !== r.verified || (old.notes ?? null) !== r.notes;
      if (!changed) return [];
      const last_checked = r.verified ? today : (old?.last_checked ?? null);
      if (!old && r.amount_pkr === null && !r.verified && !r.notes) return []; // nothing to store yet
      return [old ? sb.from('prices').update({ amount_pkr: r.amount_pkr, verified: r.verified, notes: r.notes, last_checked }).eq('id', old.id).select('id') : sb.from('prices').insert({ place_id, ...values, last_checked }).select('id')];
    });

    const results = await Promise.all(writes);
    const failed = results.find((res) => res.error || !res.data?.length);
    if (failed) return failed.error ? { ok: false, error: dbMessage(failed.error, 'price') } : NOT_FOUND;
    return { ok: true };
  });
}

// ---- Road updates ----

export async function saveRoadUpdate(draft: RoadDraft, id: string | null): Promise<AdminResult> {
  return asAdmin(async (sb) => {
    const row = parseRoad(draft);
    if (id === null) {
      const { data, error } = await sb.from('road_updates').insert(row).select('id').single();
      if (error) return { ok: false, error: dbMessage(error, 'road update') };
      return { ok: true, id: data.id as string };
    }
    const { data, error } = await sb.from('road_updates').update(row).eq('id', parseUuid(id)).select('id');
    if (error) return { ok: false, error: dbMessage(error, 'road update') };
    return data.length ? { ok: true, id } : NOT_FOUND;
  });
}

export async function deleteRoadUpdate(id: string): Promise<AdminResult> {
  return asAdmin(async (sb) => {
    const { data, error } = await sb.from('road_updates').delete().eq('id', parseUuid(id)).select('id');
    if (error) return { ok: false, error: dbMessage(error, 'road update') };
    return data.length ? { ok: true } : NOT_FOUND;
  });
}
