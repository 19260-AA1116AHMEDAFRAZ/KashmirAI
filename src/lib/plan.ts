import { findCity } from '@/data/cities';
import type { CityCode, StyleCode } from '@/data/types';

// The choices on the Plan page. They travel in the address (/trip?place=neelum&days=3…),
// so a trip can be bookmarked or shared and the Trip page needs no shared state.
// The budget for a plan comes from src/lib/budget.ts.
// "Starting from" can be any city in src/data/cities.ts. The price list only has car prices for the
// four CityCodes below (PRICE_CITIES, edited in Admin → Trip prices); every other city is priced by
// the Gemini estimate (src/lib/estimate.ts).
export type CityId = string;
export const PRICE_CITIES: CityCode[] = ['isb', 'mzd', 'rwk', 'bagh'];

export type TravelStyle = StyleCode;
// places: one or more destinations (ids from the Places table / src/data/ajk.ts) in the order they are visited.
export type PlanInput = { city: CityId; places: string[]; days: number; people: number; style: TravelStyle };

export const STYLES: TravelStyle[] = ['budget', 'comfort', 'premium'];
export const LIMITS = { days: { min: 1, max: 7 }, people: { min: 1, max: 12 }, places: { min: 1, max: 5 } };
export const DEFAULT_PLAN: PlanInput = { city: 'isb', places: ['neelum'], days: 3, people: 2, style: 'budget' };

const clamp = (n: number, { min, max }: { min: number; max: number }) => Math.min(max, Math.max(min, n));

// Reads a plan from the address, ignoring anything invalid.
export function planFromParams(params: Record<string, string | string[] | undefined>): PlanInput {
  const get = (k: string) => (typeof params[k] === 'string' ? (params[k] as string) : undefined);
  const city = get('city');
  const style = get('style') as TravelStyle | undefined;
  // ?place=neelum or ?place=neelum,banjosa (in visiting order). Only plain ids, no repeats, at most LIMITS.places.max.
  const places = [...new Set((get('place') ?? '').split(',').map((s) => s.trim()).filter((s) => /^[a-z0-9-]{1,40}$/.test(s)))].slice(0, LIMITS.places.max);
  const days = Number(get('days'));
  const people = Number(get('people'));
  return {
    city: city && findCity(city) ? city : DEFAULT_PLAN.city,
    places: places.length ? places : DEFAULT_PLAN.places,
    days: Number.isFinite(days) && days > 0 ? clamp(Math.round(days), LIMITS.days) : DEFAULT_PLAN.days,
    people: Number.isFinite(people) && people > 0 ? clamp(Math.round(people), LIMITS.people) : DEFAULT_PLAN.people,
    style: style && STYLES.includes(style) ? style : DEFAULT_PLAN.style,
  };
}

export function planQuery(plan: PlanInput): string {
  return new URLSearchParams({ place: plan.places.join(','), city: plan.city, days: String(plan.days), people: String(plan.people), style: plan.style }).toString();
}
