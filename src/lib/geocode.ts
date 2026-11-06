import 'server-only';

import { findCity } from '@/data/cities';
import type { Place } from '@/data/types';

// Finds where a city or place is on the map, using OpenStreetMap's search service (Nominatim), so the
// Plan page map needs no hand-typed coordinates. Nominatim's usage rules, which this follows: at most
// one request per second, an identifying User-Agent, and never searching as the user types. Every
// answer is remembered, so each city or place is looked up once per server run.
// A place's own saved coordinates (places.lat / places.lon) are always preferred.

export type MapPoint = { lat: number; lon: number };

const SEARCH = 'https://nominatim.openstreetmap.org/search';
const GAP_MS = 1100;
const FOUND_CACHE_MAX = 1000;
const MISS_RETRY_MS = 30 * 60 * 1000;

const found = new Map<string, MapPoint>();
const missed = new Map<string, number>(); // query → when we last found nothing

// One lookup at a time, at least GAP_MS apart.
let queue: Promise<unknown> = Promise.resolve();
let lastAt = 0;
function throttled<T>(job: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = lastAt + GAP_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastAt = Date.now();
    return job();
  });
  queue = run.catch(() => undefined);
  return run;
}

// Rough box around Pakistan: anything outside it is a wrong match.
const inPakistan = ({ lat, lon }: MapPoint) => lat > 23 && lat < 37.5 && lon > 60 && lon < 77.9;

// ajkOnly: only accept a match that OpenStreetMap places inside Azad Kashmir (ISO code PK-JK), so a
// village with the same name elsewhere can't put the pin in the wrong region.
async function search(query: string, ajkOnly = false): Promise<MapPoint | null> {
  const cacheKey = ajkOnly ? `ajk|${query}` : query;
  const hit = found.get(cacheKey);
  if (hit) return hit;
  const missedAt = missed.get(cacheKey);
  if (missedAt && Date.now() - missedAt < MISS_RETRY_MS) return null;

  const point = await throttled(async () => {
    try {
      const url = `${SEARCH}?format=jsonv2&limit=${ajkOnly ? 5 : 1}&addressdetails=1&countrycodes=pk&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'KashmirAI-web/1.0', 'Accept-Language': 'en' }, signal: AbortSignal.timeout(8000), cache: 'no-store' });
      if (!res.ok) return undefined; // undefined = try again later, don't remember it as a miss
      const results = (await res.json()) as { lat: string; lon: string; address?: Record<string, string> }[];
      const first = ajkOnly ? results.find((r) => r.address?.['ISO3166-2-lvl4'] === 'PK-JK') : results[0];
      const p = first && { lat: Number(first.lat), lon: Number(first.lon) };
      return p && Number.isFinite(p.lat) && Number.isFinite(p.lon) && inPakistan(p) ? p : null;
    } catch (e) {
      console.warn('Map search failed:', e instanceof Error ? e.message : e);
      return undefined;
    }
  });

  if (point) {
    if (found.size >= FOUND_CACHE_MAX) found.delete(found.keys().next().value as string);
    found.set(cacheKey, point);
  } else if (point === null) {
    missed.set(cacheKey, Date.now());
  }
  return point ?? null;
}

async function firstHit(queries: string[], ajkOnly = false): Promise<MapPoint | null> {
  for (const q of [...new Set(queries)]) {
    const p = await search(q, ajkOnly);
    if (p) return p;
  }
  return null;
}

export function locateCity(id: string): Promise<MapPoint | null> {
  const city = findCity(id);
  if (!city) return Promise.resolve(null);
  const name = city.name.replace(/\s*\(.*\)/, ''); // "Mingora (Swat)" → "Mingora"
  const province = city.province === 'Islamabad' ? 'Islamabad Capital Territory' : city.province;
  return firstHit([`${name}, ${province}, Pakistan`, `${name}, Pakistan`]);
}

export async function locatePlace(place: Pick<Place, 'lat' | 'lon' | 'maps_query' | 'name'>): Promise<MapPoint | null> {
  if (place.lat != null && place.lon != null) return { lat: place.lat, lon: place.lon };
  // "Banjosa Lake, Azad Kashmir": OpenStreetMap often knows the place only as "Banjosa", so also try without the generic word.
  const [base, ...rest] = place.maps_query.split(',');
  const region = rest.join(',').trim();
  const short = base.replace(/\b(lake|valley|peak|pass|jheel)\b/gi, '').replace(/\s+/g, ' ').trim();
  return firstHit([place.maps_query, short && region ? `${short}, ${region}` : '', short, place.name.en].filter(Boolean), true);
}
