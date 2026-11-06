import 'server-only';

import { connection } from 'next/server';

import type { Lang, Place, Price } from '@/data/types';
import type { TFunction } from '@/i18n/config';
import { cityName } from '@/data/cities';
import { cardPlan, estimateTrip, PEOPLE_PER_ROOM, SEATS_PER_CAR, SEATS_PER_JEEP, type Estimate } from './budget';
import { formatRs } from './format';
import { geminiText } from './gemini';
import type { PlanInput } from './plan';

// Automatic trip cost estimate from Gemini (src/lib/gemini.ts). Used by the Plan page (through the
// `estimateTripCost` server action) and by the Trip page, so both show the same numbers.
//
// If the key is missing or Gemini fails, estimateForPlan() falls back to the price list
// (Admin → Trip prices), which only covers the cities that have prices set.

const CACHE_MS = 6 * 60 * 60 * 1000;
const CACHE_MAX = 500;
const MAX_PART_PKR = 5_000_000; // anything above this for one part is nonsense, so we ignore the answer

const round100 = (n: number) => Math.round(n / 100) * 100;

// Same plan → same answer for a while: saves calls and keeps Plan and Trip pages in agreement.
const cache = new Map<string, { at: number; estimate: Estimate }>();

const STYLE_HINT = { budget: 'budget guesthouses, shared/basic meals', comfort: 'mid-range hotels, restaurant meals', premium: 'resorts / best available hotels, good restaurants' } as const;

function buildPrompt(plan: PlanInput, places: Place[], prices: Price[]): string {
  const nights = Math.max(plan.days - 1, 0);
  const jeepDays = Math.min(places.reduce((sum, p) => sum + p.jeep_days, 0), plan.days);
  const ids = new Set(places.map((p) => p.id));
  const where = (p: Place) => `${p.name.en}${p.district ? ` (${p.district.en})` : ''}`;
  const cars = Math.ceil(plan.people / SEATS_PER_CAR);
  const jeeps = Math.ceil(plan.people / SEATS_PER_JEEP);
  const rooms = Math.ceil(plan.people / PEOPLE_PER_ROOM);
  const reference = prices
    .filter((p) => ids.has(p.place_id) && p.amount_pkr != null)
    .map((p) => `- ${p.category}${p.from_city ? ` from ${cityName(p.from_city, 'en')}` : ''}${p.style ? ` (${p.style})` : ''}: Rs ${p.amount_pkr} ${p.unit.replaceAll('_', ' ')}`)
    .join('\n');

  return [
    'You are a travel cost estimator for tourists visiting Azad Jammu & Kashmir (Pakistan).',
    `Estimate the total cost in Pakistani rupees (PKR), at current ${new Date().getFullYear()} prices, for this trip:`,
    `- Starting city: ${cityName(plan.city, 'en')}, Pakistan`,
    places.length === 1 ? `- Destination: ${where(places[0])}, Azad Kashmir` : `- Destinations in Azad Kashmir, visited in this order: ${places.map((p, i) => `${i + 1}) ${where(p)}`).join(', ')}`,
    `- Length: ${plan.days} days, ${nights} nights`,
    `- Travellers: ${plan.people}`,
    `- Style: ${plan.style} (${STYLE_HINT[plan.style]})`,
    '',
    'Return the cost of the WHOLE group (not per person) split into four parts:',
    `- transport: round trip by road from the starting city to the destination${places.length > 1 ? 's and the drives between them' : ''} (private car/van for about ${SEATS_PER_CAR} people each, so ${cars} vehicle(s); fuel, tolls and driver included), plus local 4x4 jeep hire for ${jeepDays} day(s) for ${jeeps} jeep(s) (${SEATS_PER_JEEP} seats each)`,
    `- stay: ${nights} night(s) in ${rooms} room(s) (${PEOPLE_PER_ROOM} people per room); 0 if there are no nights`,
    `- food: all meals for ${plan.people} people over ${plan.days} days`,
    '- extras: entry fees, permits, small local costs',
    reference ? `\nThe team's own local price list for these destinations (PKR), use it where it applies:\n${reference}` : '',
    '\nUse realistic prices for the real distance and road conditions. All amounts are whole PKR numbers. "note" is one short sentence (max 25 words) on the main assumption.',
  ].join('\n');
}

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    transport: { type: 'INTEGER' },
    stay: { type: 'INTEGER' },
    food: { type: 'INTEGER' },
    extras: { type: 'INTEGER' },
    note: { type: 'STRING' },
  },
  required: ['transport', 'stay', 'food', 'extras'],
};

// null = no key, no answer, or an answer that doesn't look right.
async function askGemini(plan: PlanInput, places: Place[], prices: Price[]): Promise<Estimate | null> {
  const text = await geminiText({ turns: [{ role: 'user', text: buildPrompt(plan, places, prices) }], schema: SCHEMA, temperature: 0.2 });
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    const part = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= MAX_PART_PKR ? round100(v) : null);
    const split = { transport: part(parsed?.transport), stay: part(parsed?.stay), food: part(parsed?.food), extras: part(parsed?.extras) };
    if (split.transport == null || split.stay == null || split.food == null || split.extras == null) return null;
    const clean = { transport: split.transport, stay: split.stay, food: split.food, extras: split.extras };
    const total = clean.transport + clean.stay + clean.food + clean.extras;
    if (total <= 0) return null;
    return {
      total,
      perPerson: total / plan.people,
      split: clean,
      lastChecked: null,
      source: 'ai',
      note: typeof parsed.note === 'string' ? parsed.note.slice(0, 300) : undefined,
    };
  } catch (e) {
    console.warn('Gemini estimate unreadable:', e instanceof Error ? e.message : e);
    return null;
  }
}

// Gemini's estimate for this plan, or null if it isn't available.
export async function estimateWithAi(plan: PlanInput, places: Place[], prices: Price[]): Promise<Estimate | null> {
  // This reads the clock (cache age, the year in the prompt), which Next.js only allows once a real request is being served.
  await connection();
  const key = `${plan.city}|${places.map((p) => p.id).join('+')}|${plan.days}|${plan.people}|${plan.style}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.estimate;
  const estimate = await askGemini(plan, places, prices);
  if (estimate) {
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string); // oldest first
    cache.set(key, { at: Date.now(), estimate });
  }
  return estimate;
}

// What the site shows for a plan: Gemini first, then the price list (which only knows the first destination).
export async function estimateForPlan(plan: PlanInput, places: Place[], prices: Price[]): Promise<Estimate | null> {
  if (places.length === 0) return null;
  return (await estimateWithAi(plan, places, prices)) ?? estimateTrip(plan, places[0], prices);
}

// The example trip on Discover cards and place pages (from Islamabad, 2 people, budget style):
// Gemini's estimate for every place, so the price on the cards is never typed in by hand.
// A place with no estimate at all maps to null.
export async function estimateCards(places: Place[], prices: Price[]): Promise<Record<string, Estimate | null>> {
  const done = await Promise.all(places.map(async (p) => [p.id, await estimateForPlan(cardPlan(p), [p], prices)] as const));
  return Object.fromEntries(done);
}

// "Rs 38,000 · 2 ppl" for one place, or "Price not set yet".
export async function cardBudgetText(place: Place, prices: Price[], lang: Lang, t: TFunction): Promise<string> {
  const plan = cardPlan(place);
  const estimate = await estimateForPlan(plan, [place], prices);
  return estimate ? t('place.budgetFor', { amount: formatRs(estimate.total, lang), people: plan.people }) : t('common.priceNotSet');
}
