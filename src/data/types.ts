// Shapes of the records the app shows. They match the Supabase tables (Phase 2),
// so screens don't care whether data comes from the sample file, the server or the offline cache.

export type Lang = 'en' | 'ur' | 'roman';

// Text stored in up to three languages. English is required; the app falls back to it.
export type I18nText = { en: string; ur?: string; roman?: string };

// Every real-world fact carries these two fields so the app can say how reliable it is.
export type Verifiable = {
  verified: boolean;
  last_checked: string | null; // ISO date, e.g. "2026-11-03". null = never checked
};

export type PlaceType = 'valley' | 'lake' | 'hilltop' | 'town';

export type Stop = { name: I18nText; note: I18nText };

export type Place = Verifiable & {
  id: string; // slug, e.g. "neelum"
  name: I18nText;
  type: PlaceType;
  district: I18nText | null;
  blurb: I18nText; // one line for the Discover card
  description: I18nText;
  best_season: I18nText | null;
  days_min: number | null;
  days_max: number | null;
  signal_note: I18nText | null;
  stops: Stop[];
  tips: I18nText[];
  jeep_days: number; // jeep days the budget includes (e.g. Kel to Arang Kel base)
  lat: number | null;
  lon: number | null;
  maps_query: string; // what we search for in Google Maps
  image_key: string | null; // key into src/data/images.ts, null = drawn illustration
  image_credit: string | null;
  sort_order: number;
};

// Admin-only columns of a place (the public pages never need them).
export type AdminPlace = Place & { active: boolean; todo: string | null; updated_at: string };

// One line of the budget calculator's price list (the `prices` table).
// category   | from_city | style | unit
// transport  | yes       | -     | per_vehicle_round_trip
// jeep       | -         | -     | per_vehicle_day (x places.jeep_days)
// stay       | -         | yes   | per_room_night
// food       | -         | yes   | per_person_day
// extras     | -         | -     | per_person_trip
export type PriceCategory = 'transport' | 'jeep' | 'stay' | 'food' | 'extras';
export type CityCode = 'isb' | 'mzd' | 'rwk' | 'bagh';
export type StyleCode = 'budget' | 'comfort' | 'premium';
export type PriceUnit = 'per_vehicle_round_trip' | 'per_vehicle_day' | 'per_room_night' | 'per_person_day' | 'per_person_trip';

export type Price = Verifiable & {
  id: number;
  place_id: string;
  category: PriceCategory;
  from_city: CityCode | null;
  style: StyleCode | null;
  unit: PriceUnit;
  amount_pkr: number | null; // null = not set yet
  notes: string | null;
};

export type PartnerKind = 'stay' | 'guide' | 'jeep';

export type Partner = Verifiable & {
  id: string;
  place_id: string;
  kind: PartnerKind;
  name: I18nText;
  description: I18nText;
  price_pkr: number | null; // null = not set yet
  price_unit: 'night' | 'day';
  phone: string | null;
  featured: boolean;
  featured_until: string | null; // ISO date; featured stops showing after it
  active: boolean;
};

// A traveller's "Request" on a partner. Admins move it through the statuses.
export type RequestStatus = 'new' | 'contacted' | 'done' | 'cancelled';

export type PartnerRequest = {
  id: string;
  partner_id: string;
  user_id: string;
  requester_name: string | null;
  requester_email: string | null;
  note: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  // Filled in for the admin list: which partner and place the request is for.
  partner?: { name: I18nText; kind: PartnerKind; phone: string | null; place_id: string } | null;
};

export type RoadStatus = 'open' | 'slow' | 'closed';

export type RoadUpdate = Verifiable & {
  id: string;
  place_id: string;
  segment: I18nText;
  status: RoadStatus;
  note: I18nText | null;
  source: string | null;
  updated_at: string; // ISO timestamp
};

export type ItineraryStep = { time: string; title: I18nText; note: I18nText };

export type ItineraryDay = {
  place_id: string;
  day_number: number;
  title: I18nText;
  steps: ItineraryStep[];
};

export type EmergencyContact = {
  id: string;
  number: string;
  label: I18nText;
  kind: 'rescue' | 'police' | 'other';
};
