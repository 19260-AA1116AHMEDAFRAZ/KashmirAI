import 'server-only';

import type { User } from '@supabase/supabase-js';

import * as sample from '@/data/sample';
import type { AdminPlace, ItineraryDay, Partner, PartnerRequest, Place, Price, RequestStatus, RoadUpdate } from '@/data/types';
import { createClient } from '@/lib/supabase/server';

// All database reads for the site go through this file (Server Components call these).
// Each runs as the signed-in visitor, so the database's security rules decide what comes back.
// Without Supabase settings, each returns the built-in sample data instead.
//
// Public reads filter on `active` themselves: the admin security rule lets admins read hidden
// rows too, and a hidden place or partner must not appear on the site for them either.

const PLACE_COLUMNS =
  'id, name, type, district, blurb, description, best_season, days_min, days_max, signal_note, stops, tips, jeep_days, lat, lon, maps_query, image_key, image_credit, sort_order, verified, last_checked';
const PARTNER_COLUMNS = 'id, place_id, kind, name, description, price_pkr, price_unit, phone, featured, featured_until, active, verified, last_checked';
const ROAD_COLUMNS = 'id, place_id, segment, status, note, source, updated_at, verified, last_checked';
const REQUEST_COLUMNS = 'id, partner_id, user_id, requester_name, requester_email, note, status, created_at, updated_at';
const PRICE_COLUMNS = 'id, place_id, category, from_city, style, unit, amount_pkr, notes, verified, last_checked';

export async function fetchPlaces(): Promise<Place[]> {
  const sb = await createClient();
  if (!sb) return sample.PLACES;
  const { data, error } = await sb.from('places').select(PLACE_COLUMNS).eq('active', true).order('sort_order');
  if (error) throw error;
  return data as Place[];
}

export async function fetchPlace(id: string): Promise<Place | null> {
  const sb = await createClient();
  if (!sb) return sample.PLACES.find((p) => p.id === id) ?? null;
  const { data, error } = await sb.from('places').select(PLACE_COLUMNS).eq('id', id).eq('active', true).maybeSingle();
  if (error) throw error;
  return data as Place | null;
}

export async function fetchPartners(placeId: string): Promise<Partner[]> {
  const sb = await createClient();
  if (!sb) return sample.PARTNERS.filter((p) => p.place_id === placeId);
  const { data, error } = await sb.from('partners').select(PARTNER_COLUMNS).eq('place_id', placeId).eq('active', true);
  if (error) throw error;
  return data as Partner[];
}

// placeId = undefined returns updates for every place (used by the Discover banner).
export async function fetchRoadUpdates(placeId?: string): Promise<RoadUpdate[]> {
  const sb = await createClient();
  if (!sb) return sample.ROAD_UPDATES.filter((r) => !placeId || r.place_id === placeId);
  let query = sb.from('road_updates').select(ROAD_COLUMNS).order('sort_order');
  if (placeId) query = query.eq('place_id', placeId);
  const { data, error } = await query;
  if (error) throw error;
  return data as RoadUpdate[];
}

export async function fetchItinerary(placeId: string): Promise<ItineraryDay[]> {
  const sb = await createClient();
  if (!sb) return sample.ITINERARY.filter((d) => d.place_id === placeId);
  const { data, error } = await sb.from('itineraries').select('place_id, day_number, title, steps').eq('place_id', placeId).order('day_number');
  if (error) throw error;
  return data as ItineraryDay[];
}

// The budget calculator's price list. placeId = undefined returns every place's prices.
export async function fetchPrices(placeId?: string): Promise<Price[]> {
  const sb = await createClient();
  if (!sb) return sample.PRICES.filter((p) => !placeId || p.place_id === placeId);
  let query = sb.from('prices').select(PRICE_COLUMNS).order('id');
  if (placeId) query = query.eq('place_id', placeId);
  const { data, error } = await query;
  if (error) throw error;
  return data as Price[];
}

// ---- Who is visiting ----

export type Role = 'admin' | 'traveller';
export type Viewer = { user: User | null; role: Role | null; sampleMode: boolean };

// The signed-in user (validated with Supabase, not just read from the cookie) and their role.
// Admin = listed in the `admins` table; the security rules let users see only their own row.
export async function getViewer(): Promise<Viewer> {
  const sb = await createClient();
  if (!sb) return { user: null, role: null, sampleMode: true };
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user) return { user: null, role: null, sampleMode: false };
  const { data: row } = await sb.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  return { user, role: row ? 'admin' : 'traveller', sampleMode: false };
}

// ---- Partner requests ----

// The visitor's own requests (admins would otherwise get everyone's).
export async function fetchMyRequests(userId: string): Promise<PartnerRequest[]> {
  const sb = await createClient();
  if (!sb) return [];
  const { data, error } = await sb.from('partner_requests').select(REQUEST_COLUMNS).eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data as PartnerRequest[];
}

// Admin list, newest first. status = undefined returns every request.
export async function fetchAllRequests(status?: RequestStatus): Promise<PartnerRequest[]> {
  const sb = await createClient();
  if (!sb) return [];
  let query = sb
    .from('partner_requests')
    .select(`${REQUEST_COLUMNS}, partner:partners (name, kind, phone, place_id)`)
    .order('created_at', { ascending: false })
    .limit(200);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as PartnerRequest[];
}

export async function countNewRequests(): Promise<number> {
  const sb = await createClient();
  if (!sb) return 0;
  const { count, error } = await sb.from('partner_requests').select('id', { count: 'exact', head: true }).eq('status', 'new');
  if (error) return 0; // e.g. the requests migration isn't run yet: just show no badge
  return count ?? 0;
}

export type AdminRow = { user_id: string; note: string | null; created_at: string };

export async function fetchAdmins(): Promise<AdminRow[]> {
  const sb = await createClient();
  if (!sb) return [];
  const { data, error } = await sb.from('admins').select('user_id, note, created_at').order('created_at');
  if (error) throw error;
  return data;
}

// ---- Admin dashboard reads ----
// Admins only: the security rules return hidden rows to admins, and nothing extra to anyone else.

export async function fetchAdminPlaces(): Promise<AdminPlace[]> {
  const sb = await createClient();
  if (!sb) return sample.PLACES.map((p) => ({ ...p, active: true, todo: null, updated_at: '' }));
  const { data, error } = await sb.from('places').select(`${PLACE_COLUMNS}, active, todo, updated_at`).order('sort_order').order('id');
  if (error) throw error;
  return data as AdminPlace[];
}

export async function fetchAdminPlace(id: string): Promise<AdminPlace | null> {
  return (await fetchAdminPlaces()).find((p) => p.id === id) ?? null;
}

export type AdminPartner = Partner & { todo: string | null; updated_at: string };

// placeId = undefined returns every partner.
export async function fetchAdminPartners(placeId?: string): Promise<AdminPartner[]> {
  const sb = await createClient();
  if (!sb) return sample.PARTNERS.filter((p) => !placeId || p.place_id === placeId).map((p) => ({ ...p, todo: null, updated_at: '' }));
  let query = sb.from('partners').select(`${PARTNER_COLUMNS}, todo, updated_at`).order('place_id').order('kind');
  if (placeId) query = query.eq('place_id', placeId);
  const { data, error } = await query;
  if (error) throw error;
  return data as AdminPartner[];
}

export async function fetchAdminPartner(id: string): Promise<AdminPartner | null> {
  const sb = await createClient();
  if (!sb) return (await fetchAdminPartners()).find((p) => p.id === id) ?? null;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null; // not a uuid: the database would reject it
  const { data, error } = await sb.from('partners').select(`${PARTNER_COLUMNS}, todo, updated_at`).eq('id', id).maybeSingle();
  if (error) throw error;
  return data as AdminPartner | null;
}

export type AdminRoadUpdate = RoadUpdate & { sort_order: number };

export async function fetchAdminRoadUpdates(): Promise<AdminRoadUpdate[]> {
  const sb = await createClient();
  if (!sb) return sample.ROAD_UPDATES.map((r, i) => ({ ...r, sort_order: (i + 1) * 10 }));
  const { data, error } = await sb.from('road_updates').select(`${ROAD_COLUMNS}, sort_order`).order('place_id').order('sort_order');
  if (error) throw error;
  return data as AdminRoadUpdate[];
}

// How many requests are in each status (for the dashboard and the filter chips).
export async function countRequestsByStatus(): Promise<Record<RequestStatus, number>> {
  const counts: Record<RequestStatus, number> = { new: 0, contacted: 0, done: 0, cancelled: 0 };
  const sb = await createClient();
  if (!sb) return counts;
  await Promise.all(
    (Object.keys(counts) as RequestStatus[]).map(async (status) => {
      const { count } = await sb.from('partner_requests').select('id', { count: 'exact', head: true }).eq('status', status);
      counts[status] = count ?? 0;
    }),
  );
  return counts;
}
