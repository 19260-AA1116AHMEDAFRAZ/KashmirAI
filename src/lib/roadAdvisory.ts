import 'server-only';

import { connection } from 'next/server';

import type { Lang, Place, RoadUpdate } from '@/data/types';
import { geminiText } from './gemini';
import { roadLine } from './knowledge';
import { withoutVerificationTalk } from './scrub';

// The road banner on Discover, written by Gemini (src/lib/gemini.ts) from today's date, the season and
// the team's own road updates (Admin → Roads), so no banner text is typed in by hand.
//
// Gemini has NO live road information. It is told to state a road's condition only when it comes from
// the team's road updates (and may mention its update date); otherwise to talk about what the
// season usually brings and to send travellers to local people and Rescue 1122.

export type RoadAdvisory = { title: string; note: string; level: 'info' | 'caution'; asOf: string };

const CACHE_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; advisory: RoadAdvisory }>();

const LANGUAGE_RULE: Record<Lang, string> = {
  en: 'Write in English.',
  ur: 'Write in Urdu, in Urdu script (اردو).',
  roman: 'Write in Roman Urdu: Urdu written with English letters, the way people text in Pakistan.',
};

const SCHEMA = {
  type: 'OBJECT',
  properties: { title: { type: 'STRING' }, note: { type: 'STRING' }, level: { type: 'STRING', enum: ['info', 'caution'] } },
  required: ['title', 'note', 'level'],
};

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '');

// null = Gemini isn't available or gave nothing usable (the page then shows the team's own latest update).
export async function buildRoadAdvisory(lang: Lang, places: Place[], roads: RoadUpdate[]): Promise<RoadAdvisory | null> {
  await connection(); // reads the clock, which Next.js only allows once a real request is being served
  const today = new Date().toISOString().slice(0, 10);
  const key = `${lang}|${today}|${roads.map((r) => `${r.id}:${r.updated_at}`).join(',')}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.advisory;

  const prompt = [
    'You write the road-conditions banner on the home page of a travel app for visitors to Azad Jammu & Kashmir (Pakistan).',
    `Today is ${today}. Main destinations: ${places.map((p) => p.name.en).join(', ') || 'Neelum Valley, Rawalakot, Muzaffarabad'}.`,
    '',
    'ROAD UPDATES (the only live information you have):',
    roads.length ? roads.map(roadLine).join('\n') : '- none at the moment',
    '',
    'Write ONE short advisory for travellers who are about to set out:',
    '- "title": at most 8 words.',
    '- "note": at most 35 words, practical.',
    '- "level": "caution" if the road updates mention a slow or closed road, or if this time of year brings real risk on these mountain roads (for example landslides in the monsoon, snow or ice in winter, fog); otherwise "info".',
    '',
    'Rules:',
    '- You do NOT have live road data. Say a specific road is open, slow or closed ONLY if it is in the road updates above (you may mention the update date if one is given). Never invent a road status, closure or date.',
    '- Otherwise describe what this season usually brings on these roads, using words like "may" and "expect".',
    '- Always end the note by telling people to ask local people or check before travelling; in an emergency call Rescue 1122.',
    LANGUAGE_RULE[lang],
  ].join('\n');

  const raw = await geminiText({ turns: [{ role: 'user', text: prompt }], schema: SCHEMA, temperature: 0.3, maxOutputTokens: 400 });
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    const title = withoutVerificationTalk(clean(data?.title, 90));
    const note = withoutVerificationTalk(clean(data?.note, 400));
    if (!title || !note) return null;
    const advisory: RoadAdvisory = { title, note, level: data?.level === 'caution' ? 'caution' : 'info', asOf: new Date().toISOString() };
    if (cache.size >= 50) cache.delete(cache.keys().next().value as string);
    cache.set(key, { at: Date.now(), advisory });
    return advisory;
  } catch {
    return null;
  }
}
