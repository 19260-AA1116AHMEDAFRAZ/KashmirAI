import type { CityCode, StyleCode } from '@/data/types';

// The choices on the Plan page. They travel in the address (/trip?place=neelum&days=3…),
// so a trip can be bookmarked or shared and the Trip page needs no shared state.
// The budget for a plan comes from src/lib/budget.ts.
export type CityId = CityCode;
export type TravelStyle = StyleCode;
export type PlanInput = { city: CityId; place: string; days: number; people: number; style: TravelStyle };

export const CITIES: CityId[] = ['isb', 'mzd', 'rwk', 'bagh'];
export const STYLES: TravelStyle[] = ['budget', 'comfort', 'premium'];
export const LIMITS = { days: { min: 1, max: 7 }, people: { min: 1, max: 12 } };
export const DEFAULT_PLAN: PlanInput = { city: 'isb', place: 'neelum', days: 3, people: 2, style: 'budget' };

const clamp = (n: number, { min, max }: { min: number; max: number }) => Math.min(max, Math.max(min, n));

// Reads a plan from the address, ignoring anything invalid.
export function planFromParams(params: Record<string, string | string[] | undefined>): PlanInput {
  const get = (k: string) => (typeof params[k] === 'string' ? (params[k] as string) : undefined);
  const city = get('city') as CityId | undefined;
  const style = get('style') as TravelStyle | undefined;
  const days = Number(get('days'));
  const people = Number(get('people'));
  return {
    city: city && CITIES.includes(city) ? city : DEFAULT_PLAN.city,
    place: get('place') || DEFAULT_PLAN.place,
    days: Number.isFinite(days) && days > 0 ? clamp(Math.round(days), LIMITS.days) : DEFAULT_PLAN.days,
    people: Number.isFinite(people) && people > 0 ? clamp(Math.round(people), LIMITS.people) : DEFAULT_PLAN.people,
    style: style && STYLES.includes(style) ? style : DEFAULT_PLAN.style,
  };
}

export function planQuery(plan: PlanInput): string {
  return new URLSearchParams({ place: plan.place, city: plan.city, days: String(plan.days), people: String(plan.people), style: plan.style }).toString();
}
