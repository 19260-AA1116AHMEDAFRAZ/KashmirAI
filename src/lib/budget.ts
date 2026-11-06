import type { Lang, Place, Price, PriceCategory } from '@/data/types';
import type { TFunction } from '@/i18n/config';
import { formatRs } from './format';
import { DEFAULT_PLAN, type PlanInput } from './plan';

// The trip budget calculator. Its only input is the `prices` table, which admins edit in
// Admin → Trip prices, so a changed price shows up on Discover, the place page, the planner and
// the trip page straight away. Works in Server and Client Components (no data loading here).
//
// How a trip is priced (each part rounded to the nearest Rs 100):
//   transport = car round trip from the starting city × cars  +  jeep per day × jeep days × jeeps
//   stay      = room per night × nights × rooms
//   food      = food per person per day × people × days
//   extras    = extras per person × people
// Group sizes are assumptions until the team says otherwise:
export const SEATS_PER_CAR = 4;
export const SEATS_PER_JEEP = 6;
export const PEOPLE_PER_ROOM = 2;

export type BudgetSplit = { transport: number; stay: number; food: number; extras: number };
export type Estimate = {
  total: number;
  perPerson: number;
  split: BudgetSplit;
  // Oldest "last checked" date among the prices used, or null if any of them was never checked.
  lastChecked: string | null;
};

const round100 = (n: number) => Math.round(n / 100) * 100;

// The price line for one combination, e.g. ('transport', city 'isb') or ('stay', style 'budget').
export function findPrice(prices: Price[], placeId: string, category: PriceCategory, by: { city?: string | null; style?: string | null } = {}): Price | undefined {
  return prices.find((p) => p.place_id === placeId && p.category === category && p.from_city === (by.city ?? null) && p.style === (by.style ?? null));
}

// null = at least one price this trip needs is not set yet ("Price not set yet").
export function estimateTrip(plan: PlanInput, place: Pick<Place, 'id' | 'jeep_days'> | undefined, prices: Price[]): Estimate | null {
  if (!place) return null;
  const nights = Math.max(plan.days - 1, 0);
  const jeepDays = Math.min(place.jeep_days, plan.days);
  const cars = Math.ceil(plan.people / SEATS_PER_CAR);
  const jeeps = Math.ceil(plan.people / SEATS_PER_JEEP);
  const rooms = Math.ceil(plan.people / PEOPLE_PER_ROOM);

  const used: Price[] = [];
  let missing = false;
  // Amount of a price line this trip needs (and remember it was used).
  const amount = (row: Price | undefined): number => {
    if (!row || row.amount_pkr == null) {
      missing = true;
      return 0;
    }
    used.push(row);
    return row.amount_pkr;
  };

  const car = amount(findPrice(prices, place.id, 'transport', { city: plan.city }));
  const jeep = jeepDays > 0 ? amount(findPrice(prices, place.id, 'jeep')) : 0;
  const room = nights > 0 ? amount(findPrice(prices, place.id, 'stay', { style: plan.style })) : 0;
  const food = amount(findPrice(prices, place.id, 'food', { style: plan.style }));
  const extras = amount(findPrice(prices, place.id, 'extras'));
  if (missing) return null;

  const split: BudgetSplit = {
    transport: round100(car * cars + jeep * jeepDays * jeeps),
    stay: round100(room * nights * rooms),
    food: round100(food * plan.people * plan.days),
    extras: round100(extras * plan.people),
  };
  const total = split.transport + split.stay + split.food + split.extras;
  const dates = used.map((p) => p.last_checked);
  const lastChecked = dates.every((d): d is string => d !== null) && dates.length ? [...dates].sort()[0] : null;
  return { total, perPerson: total / plan.people, split, lastChecked };
}

// The example trip shown on cards: from Islamabad, 2 people, budget style, 3 days
// (or the nearest length the place suggests).
export function cardPlan(place: Pick<Place, 'id' | 'days_min' | 'days_max'>): PlanInput {
  const min = place.days_min ?? DEFAULT_PLAN.days;
  const max = place.days_max ?? min;
  return { ...DEFAULT_PLAN, place: place.id, days: Math.min(max, Math.max(min, DEFAULT_PLAN.days)) };
}

// Budget line for cards: "Rs 38,000 · 2 ppl", or "Price not set yet".
export function budgetLabel(place: Place, prices: Price[], lang: Lang, t: TFunction): string {
  const plan = cardPlan(place);
  const estimate = estimateTrip(plan, place, prices);
  return estimate ? t('place.budgetFor', { amount: formatRs(estimate.total, lang), people: plan.people }) : t('common.priceNotSet');
}
