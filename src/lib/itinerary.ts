import 'server-only';

import { connection } from 'next/server';

import { cityName } from '@/data/cities';
import type { I18nText, ItineraryDay, Lang, Place, RoadUpdate } from '@/data/types';
import { SEATS_PER_CAR } from './budget';
import { geminiText } from './gemini';
import { placeLine, roadLine } from './knowledge';
import type { PlanInput } from './plan';

// The day-by-day plan on the Trip page ("Build my plan"), written by Gemini Flash (src/lib/gemini.ts)
// for this traveller's starting city, trip length, group and style. If Gemini isn't available the page
// shows the team's stored itinerary instead (see trip/page.tsx).

const CACHE_MS = 6 * 60 * 60 * 1000;
const CACHE_MAX = 200;
const cache = new Map<string, { at: number; days: ItineraryDay[] }>();

const LANGUAGE_RULE: Record<Lang, string> = {
  en: 'Write all text in English.',
  ur: 'Write all text (titles and notes) in Urdu script (اردو). Keep times as digits like 07:30.',
  roman: 'Write all text (titles and notes) in Roman Urdu: Urdu written with English letters, the way people text in Pakistan. Keep times as digits like 07:30.',
};
const STYLE_HINT = { budget: 'budget guesthouses and simple local food', comfort: 'mid-range hotels and restaurants', premium: 'resorts / the best hotels and restaurants available' } as const;

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    days: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          day: { type: 'INTEGER' },
          title: { type: 'STRING' },
          steps: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: { time: { type: 'STRING' }, title: { type: 'STRING' }, note: { type: 'STRING' } },
              required: ['time', 'title', 'note'],
            },
          },
        },
        required: ['day', 'title', 'steps'],
      },
    },
  },
  required: ['days'],
};

function buildPrompt(plan: PlanInput, places: Place[], roads: RoadUpdate[], lang: Lang, template: ItineraryDay[]): string {
  const nights = Math.max(plan.days - 1, 0);
  const many = places.length > 1;
  const where = (p: Place) => `${p.name.en}${p.district ? `, ${p.district.en}` : ''}`;
  const templateText = template
    .map((d) => `Day ${d.day_number}: ${d.title.en}\n` + d.steps.map((s) => `  ${s.time} ${s.title.en} (${s.note.en})`).join('\n'))
    .join('\n');
  return [
    'You are a local trip planner for tourists visiting Azad Jammu & Kashmir (Pakistan). Plan a realistic day-by-day itinerary.',
    '',
    'THE TRIP',
    `- Starting city: ${cityName(plan.city, 'en')}, Pakistan (they travel by road, ${Math.ceil(plan.people / SEATS_PER_CAR)} car(s))`,
    many ? `- Destinations in Azad Kashmir, to visit in this order: ${places.map((p, i) => `${i + 1}) ${where(p)}`).join('; ')}` : `- Destination: ${where(places[0])}, Azad Kashmir`,
    `- Length: exactly ${plan.days} day(s), ${nights} night(s) in ${many ? 'these places or on the way' : `${places[0].name.en} or nearby`}`,
    `- Travellers: ${plan.people}`,
    `- Style: ${plan.style} (${STYLE_HINT[plan.style]})`,
    '',
    `WHAT WE KNOW ABOUT THE PLACE${many ? 'S' : ''} (our local data, prefer it):`,
    places.map(placeLine).join('\n'),
    '',
    'ROAD STATUS:',
    roads.length ? roads.map(roadLine).join('\n') : '- no road updates',
    template.length ? `\nOUR OWN SAMPLE ITINERARY for this place (a starting point: adapt it to the trip length and starting city, do not copy it blindly):\n${templateText}` : '',
    '',
    'RULES',
    `- Return exactly ${plan.days} day(s), numbered 1 to ${plan.days}, each with a short title and 3 to 6 steps.`,
    '- Day 1 starts with the drive from the starting city: give a realistic departure time and say roughly how long the drive takes. The last day ends with the drive home.',
    '- Steps have a 24-hour time ("07:30"), a short title (max 8 words) and a short practical note (max 14 words). Times go in order within a day.',
    '- Use real stops and food/rest breaks on the way. Suggest the kind of place to sleep and eat for the style (e.g. "riverside guesthouse"), but NEVER name a specific hotel, restaurant or business, and never give phone numbers or prices.',
    '- If a road is slow or closed, plan around it or warn about it in a note.',
    '- Do not pack too much into one day: roads in the mountains are slow.',
    ...(many
      ? [
          `- This is ONE trip through ${places.length} destinations, in the order given. Spread the ${plan.days} day(s) sensibly between them, plan the drive from each destination to the next (with realistic drive times) and say in the day title which place that day is in or heading to.`,
          `- If there are more destinations than days, group nearby ones into the same day and say honestly in a note when a place can only be a short stop.`,
        ]
      : []),
    LANGUAGE_RULE[lang],
  ]
    .filter((l) => l !== '')
    .join('\n');
}

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '');
function normaliseTime(v: unknown): string | null {
  const m = /^(\d{1,2})[:.](\d{2})$/.exec(typeof v === 'string' ? v.trim() : '');
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return null;
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}

// The text in the reader's language (and English, which the site falls back to).
const say = (s: string, lang: Lang): I18nText => ({ en: s, [lang]: s });

// Turns Gemini's answer into itinerary days, or null if it isn't a usable plan for this many days.
function parse(raw: string, plan: PlanInput, lang: Lang): ItineraryDay[] | null {
  let data: { days?: { day?: unknown; title?: unknown; steps?: { time?: unknown; title?: unknown; note?: unknown }[] }[] };
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(data?.days)) return null;
  const days: ItineraryDay[] = [];
  for (let n = 1; n <= plan.days; n++) {
    const d = data.days.find((x) => Number(x?.day) === n) ?? data.days[n - 1];
    const title = text(d?.title, 80);
    const steps = (Array.isArray(d?.steps) ? d.steps : [])
      .map((s) => ({ time: normaliseTime(s?.time), title: text(s?.title, 100), note: text(s?.note, 160) }))
      .filter((s): s is { time: string; title: string; note: string } => s.time !== null && s.title !== '')
      .slice(0, 8);
    if (!title || steps.length === 0) return null; // a missing or empty day: don't show a half plan
    days.push({ place_id: plan.places[0], day_number: n, title: say(title, lang), steps: steps.map((s) => ({ time: s.time, title: say(s.title, lang), note: say(s.note, lang) })) });
  }
  return days;
}

// null = Gemini isn't available or gave an unusable answer.
export async function buildItinerary(plan: PlanInput, places: Place[], roads: RoadUpdate[], lang: Lang, template: ItineraryDay[]): Promise<ItineraryDay[] | null> {
  if (places.length === 0) return null;
  await connection(); // reads the clock (cache age), which Next.js only allows once a real request is being served
  const key = `${plan.city}|${places.map((p) => p.id).join('+')}|${plan.days}|${plan.people}|${plan.style}|${lang}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.days;

  const raw = await geminiText({
    turns: [{ role: 'user', text: buildPrompt(plan, places, roads, lang, template) }],
    schema: SCHEMA,
    temperature: 0.5,
    maxOutputTokens: 6000,
    timeoutMs: 45_000,
  });
  const days = raw ? parse(raw, plan, lang) : null;
  if (days) {
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
    cache.set(key, { at: Date.now(), days });
  }
  return days;
}
