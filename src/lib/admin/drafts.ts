import type { I18nText, Partner, Place, Price, PriceCategory, PriceUnit, RoadUpdate } from '@/data/types';

// What the admin forms edit and send to the server actions in src/app/admin/actions.ts.
// Everything is a plain string or boolean (exactly what the inputs hold); the server checks
// and converts it (src/lib/admin/parse.ts), because a Server Action can be called with anything.

export type I18nDraft = { en: string; ur: string; roman: string };

export type PlaceDraft = {
  id: string;
  name: I18nDraft;
  type: string;
  district: I18nDraft;
  blurb: I18nDraft;
  description: I18nDraft;
  best_season: I18nDraft;
  signal_note: I18nDraft;
  days_min: string;
  days_max: string;
  jeep_days: string;
  lat: string;
  lon: string;
  maps_query: string;
  image_key: string; // '' = drawn illustration
  image_credit: string;
  sort_order: string;
  stops: { name: I18nDraft; note: I18nDraft }[];
  tips: I18nDraft[];
  active: boolean;
  verified: boolean;
  last_checked: string; // YYYY-MM-DD or ''
  todo: string;
};

export type PartnerDraft = {
  place_id: string;
  kind: string;
  name: I18nDraft;
  description: I18nDraft;
  price_pkr: string; // '' = not set yet
  price_unit: string;
  phone: string;
  featured: boolean;
  featured_until: string;
  active: boolean;
  verified: boolean;
  last_checked: string;
  todo: string;
};

export type PriceDraft = {
  category: PriceCategory;
  from_city: string | null;
  style: string | null;
  amount_pkr: string; // '' = not set yet
  verified: boolean;
  notes: string;
};

export type RoadDraft = {
  place_id: string;
  segment: I18nDraft;
  status: string;
  note: I18nDraft;
  source: string;
  sort_order: string;
  verified: boolean;
  last_checked: string;
};

export type AdminResult = { ok: true; id?: string } | { ok: false; error: string };

// ---- Database record → draft ----

const str = (v: string | number | null | undefined) => (v == null ? '' : String(v));

export const emptyI18n = (): I18nDraft => ({ en: '', ur: '', roman: '' });
export const toI18nDraft = (t: I18nText | null | undefined): I18nDraft => ({ en: t?.en ?? '', ur: t?.ur ?? '', roman: t?.roman ?? '' });

export function placeDraft(p?: (Place & { active?: boolean; todo?: string | null }) | null): PlaceDraft {
  return {
    id: p?.id ?? '',
    name: toI18nDraft(p?.name),
    type: p?.type ?? 'valley',
    district: toI18nDraft(p?.district),
    blurb: toI18nDraft(p?.blurb),
    description: toI18nDraft(p?.description),
    best_season: toI18nDraft(p?.best_season),
    signal_note: toI18nDraft(p?.signal_note),
    days_min: str(p?.days_min),
    days_max: str(p?.days_max),
    jeep_days: str(p?.jeep_days ?? 0),
    lat: str(p?.lat),
    lon: str(p?.lon),
    maps_query: p?.maps_query ?? '',
    image_key: p?.image_key ?? '',
    image_credit: p?.image_credit ?? '',
    sort_order: str(p?.sort_order ?? 100),
    stops: (p?.stops ?? []).map((s) => ({ name: toI18nDraft(s.name), note: toI18nDraft(s.note) })),
    tips: (p?.tips ?? []).map(toI18nDraft),
    active: p?.active ?? true,
    verified: p?.verified ?? false,
    last_checked: p?.last_checked ?? '',
    todo: p?.todo ?? '',
  };
}

export function partnerDraft(p: (Partner & { todo?: string | null }) | null, placeId = ''): PartnerDraft {
  return {
    place_id: p?.place_id ?? placeId,
    kind: p?.kind ?? 'stay',
    name: toI18nDraft(p?.name),
    description: toI18nDraft(p?.description),
    price_pkr: str(p?.price_pkr),
    price_unit: p?.price_unit ?? 'night',
    phone: p?.phone ?? '',
    featured: p?.featured ?? false,
    featured_until: p?.featured_until ?? '',
    active: p?.active ?? true,
    verified: p?.verified ?? false,
    last_checked: p?.last_checked ?? '',
    todo: p?.todo ?? '',
  };
}

export function roadDraft(r: (RoadUpdate & { sort_order?: number }) | null, placeId = ''): RoadDraft {
  return {
    place_id: r?.place_id ?? placeId,
    segment: toI18nDraft(r?.segment),
    status: r?.status ?? 'open',
    note: toI18nDraft(r?.note),
    source: r?.source ?? '',
    sort_order: str(r?.sort_order ?? 100),
    verified: r?.verified ?? false,
    last_checked: r?.last_checked ?? '',
  };
}

// ---- The budget price list: every line a place should have ----

export type PriceSlot = { category: PriceCategory; from_city: string | null; style: string | null; unit: PriceUnit };

const CITY_SLOTS = ['isb', 'mzd', 'rwk', 'bagh'];
const STYLE_SLOTS = ['budget', 'comfort', 'premium'];

export const UNIT_OF: Record<PriceCategory, PriceUnit> = {
  transport: 'per_vehicle_round_trip',
  jeep: 'per_vehicle_day',
  stay: 'per_room_night',
  food: 'per_person_day',
  extras: 'per_person_trip',
};

export const PRICE_SLOTS: PriceSlot[] = [
  ...CITY_SLOTS.map((c) => ({ category: 'transport' as const, from_city: c, style: null, unit: UNIT_OF.transport })),
  { category: 'jeep', from_city: null, style: null, unit: UNIT_OF.jeep },
  ...STYLE_SLOTS.map((s) => ({ category: 'stay' as const, from_city: null, style: s, unit: UNIT_OF.stay })),
  ...STYLE_SLOTS.map((s) => ({ category: 'food' as const, from_city: null, style: s, unit: UNIT_OF.food })),
  { category: 'extras', from_city: null, style: null, unit: UNIT_OF.extras },
];

export const slotKey = (s: { category: string; from_city: string | null; style: string | null }) => `${s.category}:${s.from_city ?? ''}:${s.style ?? ''}`;

export function priceDrafts(prices: Price[]): PriceDraft[] {
  return PRICE_SLOTS.map((slot) => {
    const row = prices.find((p) => slotKey(p) === slotKey(slot));
    return { category: slot.category, from_city: slot.from_city, style: slot.style, amount_pkr: str(row?.amount_pkr), verified: row?.verified ?? false, notes: row?.notes ?? '' };
  });
}
