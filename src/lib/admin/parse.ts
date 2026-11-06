import 'server-only';

import { PHOTOS } from '@/data/images';
import type { I18nText } from '@/data/types';
import { PRICE_SLOTS, slotKey, UNIT_OF, type I18nDraft, type PartnerDraft, type PlaceDraft, type PriceDraft, type RoadDraft } from './drafts';

// Checks what an admin form sent and turns it into database rows. Server Actions can be called
// with any data, so nothing from the browser is trusted. A problem throws InvalidInput with a
// message the form shows as is.

export class InvalidInput extends Error {}

const fail = (message: string): never => {
  throw new InvalidInput(message);
};

const text = (v: unknown, max = 2000) => {
  const s = typeof v === 'string' ? v.trim() : '';
  if (s.length > max) fail(`Keep text under ${max} characters.`);
  return s;
};

// { en, ur, roman } → jsonb. English is required whenever anything is filled in.
function i18n(v: unknown, field: string, required: true): I18nText;
function i18n(v: unknown, field: string, required?: false): I18nText | null;
function i18n(v: unknown, field: string, required = false): I18nText | null {
  const d = (v && typeof v === 'object' ? v : {}) as Partial<I18nDraft>;
  const en = text(d.en);
  const ur = text(d.ur);
  const roman = text(d.roman);
  if (!en) {
    if (required) fail(`${field}: English is required.`);
    if (ur || roman) fail(`${field}: add the English text too (the site falls back to it).`);
    return null;
  }
  return { en, ...(ur && { ur }), ...(roman && { roman }) };
}

function int(v: unknown, field: string, { min = 0, max = 10_000_000, required = false } = {}): number | null {
  const s = text(v);
  if (!s) return required ? fail(`${field} is required.`) : null;
  const n = Number(s.replace(/,/g, ''));
  if (!Number.isInteger(n) || n < min || n > max) fail(`${field} must be a whole number from ${min} to ${max}.`);
  return n;
}

function decimal(v: unknown, field: string, min: number, max: number): number | null {
  const s = text(v);
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n < min || n > max) fail(`${field} must be a number from ${min} to ${max}.`);
  return n;
}

function date(v: unknown, field: string): string | null {
  const s = text(v);
  if (!s) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(new Date(s).getTime())) fail(`${field} must be a date.`);
  return s;
}

const bool = (v: unknown) => v === true;

function oneOf<T extends string>(v: unknown, options: readonly T[], field: string): T {
  if (typeof v === 'string' && (options as readonly string[]).includes(v)) return v as T;
  return fail(`Choose a ${field}.`);
}

export const PLACE_ID = /^[a-z0-9][a-z0-9-]{1,39}$/;

export function parsePlaceId(v: unknown): string {
  const id = text(v).toLowerCase();
  if (!PLACE_ID.test(id)) fail('Place id: 2–40 lowercase letters, numbers or dashes, e.g. "arang-kel".');
  return id;
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function parseUuid(v: unknown): string {
  return typeof v === 'string' && UUID.test(v) ? v : fail('Unknown record.');
}

export function parsePlace(d: PlaceDraft) {
  const days_min = int(d.days_min, 'Shortest stay (days)', { min: 1, max: 30 });
  const days_max = int(d.days_max, 'Longest stay (days)', { min: 1, max: 30 });
  if (days_min != null && days_max != null && days_max < days_min) fail('Longest stay must be at least the shortest stay.');
  if (days_min == null && days_max != null) fail('Set the shortest stay too.');
  const image_key = text(d.image_key);
  if (image_key && !(image_key in PHOTOS)) fail('Choose a photo from the list.');
  const stops = (Array.isArray(d.stops) ? d.stops : []).slice(0, 30).map((s, i) => ({
    name: i18n(s?.name, `Stop ${i + 1} name`, true),
    note: i18n(s?.note, `Stop ${i + 1} note`) ?? { en: '' },
  }));
  const tips = (Array.isArray(d.tips) ? d.tips : []).slice(0, 30).map((t, i) => i18n(t, `Tip ${i + 1}`, true));
  const maps_query = text(d.maps_query, 200);
  if (!maps_query) fail('Google Maps search is required (what "Open in Google Maps" looks for).');

  return {
    name: i18n(d.name, 'Name', true),
    type: oneOf(d.type, ['valley', 'lake', 'hilltop', 'town'] as const, 'place type'),
    district: i18n(d.district, 'District'),
    blurb: i18n(d.blurb, 'Card line', true),
    description: i18n(d.description, 'Description', true),
    best_season: i18n(d.best_season, 'Best season'),
    signal_note: i18n(d.signal_note, 'Phone signal'),
    days_min,
    days_max,
    jeep_days: int(d.jeep_days, 'Jeep days', { min: 0, max: 30 }) ?? 0,
    lat: decimal(d.lat, 'Latitude', -90, 90),
    lon: decimal(d.lon, 'Longitude', -180, 180),
    maps_query,
    image_key: image_key || null,
    image_credit: text(d.image_credit, 200) || null,
    sort_order: int(d.sort_order, 'Sort order', { min: 0, max: 100_000 }) ?? 100,
    stops,
    tips,
    active: bool(d.active),
    verified: bool(d.verified),
    last_checked: date(d.last_checked, 'Last checked'),
    todo: text(d.todo) || null,
  };
}

export function parsePartner(d: PartnerDraft) {
  const featured = bool(d.featured);
  const phone = text(d.phone, 30).replace(/[\s-]/g, '');
  if (phone && !/^\+?\d{7,15}$/.test(phone)) fail('Phone: digits only, ideally in international format, e.g. +923001234567.');
  return {
    place_id: parsePlaceId(d.place_id),
    kind: oneOf(d.kind, ['stay', 'guide', 'jeep'] as const, 'partner type'),
    name: i18n(d.name, 'Name', true),
    description: i18n(d.description, 'Description', true),
    price_pkr: int(d.price_pkr, 'Price', { max: 10_000_000 }),
    price_unit: oneOf(d.price_unit, ['night', 'day'] as const, 'price unit'),
    phone: phone || null,
    featured,
    featured_until: featured ? date(d.featured_until, 'Featured until') : null,
    active: bool(d.active),
    verified: bool(d.verified),
    last_checked: date(d.last_checked, 'Last checked'),
    todo: text(d.todo) || null,
  };
}

export function parseRoad(d: RoadDraft) {
  return {
    place_id: parsePlaceId(d.place_id),
    segment: i18n(d.segment, 'Road segment', true),
    status: oneOf(d.status, ['open', 'slow', 'closed'] as const, 'road status'),
    note: i18n(d.note, 'Note'),
    source: text(d.source, 200) || null,
    sort_order: int(d.sort_order, 'Sort order', { min: 0, max: 100_000 }) ?? 100,
    verified: bool(d.verified),
    last_checked: date(d.last_checked, 'Last checked'),
  };
}

const SLOT_KEYS = new Set(PRICE_SLOTS.map(slotKey));

// Only the combinations the calculator knows (see PRICE_SLOTS), each at most once.
export function parsePrices(rows: PriceDraft[]) {
  if (!Array.isArray(rows) || rows.length > PRICE_SLOTS.length) fail('Unexpected price list.');
  const seen = new Set<string>();
  return rows.map((r) => {
    const key = slotKey({ category: String(r?.category), from_city: r?.from_city ?? null, style: r?.style ?? null });
    if (!SLOT_KEYS.has(key) || seen.has(key)) fail('Unexpected price line.');
    seen.add(key);
    return {
      key,
      category: r.category,
      from_city: r.from_city ?? null,
      style: r.style ?? null,
      unit: UNIT_OF[r.category],
      amount_pkr: int(r.amount_pkr, 'Price', { max: 10_000_000 }),
      verified: bool(r.verified),
      notes: text(r.notes, 500) || null,
    };
  });
}

// Postgres error codes → something an admin can act on.
export function dbMessage(error: { code?: string; message?: string }, what: string): string {
  switch (error.code) {
    case '23505':
      return `That ${what} already exists.`;
    case '23503':
      return `The ${what} points at something that doesn't exist (e.g. a deleted place).`;
    case '23514':
      return `The database refused a value in this ${what}. Check the numbers and options.`;
    case '42501':
      return 'Only admins can do this.';
    default:
      return `Couldn't save the ${what}: ${error.message ?? 'unknown error'}`;
  }
}
