import type { Place, RoadUpdate } from '@/data/types';

// How a place and its road status are written for Gemini (the Ask answers and the trip day plan),
// so both work from the same facts the rest of the site shows.

export function placeLine(p: Place): string {
  const bits = [
    `${p.name.en} [id: ${p.id}] (${p.type}${p.district ? `, ${p.district.en}` : ''})`,
    p.blurb.en,
    p.best_season && `Best season: ${p.best_season.en}`,
    p.days_min != null && `Ideal stay: ${p.days_min === p.days_max || p.days_max == null ? p.days_min : `${p.days_min}-${p.days_max}`} days`,
    p.signal_note && `Phone signal: ${p.signal_note.en}`,
    p.stops.length > 0 && `Stops: ${p.stops.map((s) => `${s.name.en} (${s.note.en})`).join('; ')}`,
    p.tips.length > 0 && `Tips: ${p.tips.map((t) => t.en).join('; ')}`,
    p.jeep_days > 0 && `Needs ${p.jeep_days} jeep day(s)`,
    p.last_checked ? `Last checked ${p.last_checked}` : 'Never checked by our team yet',
  ];
  return '- ' + bits.filter(Boolean).join('. ');
}

export const roadLine = (r: RoadUpdate) => `- ${r.place_id}: ${r.segment.en} is ${r.status}${r.note ? ` (${r.note.en})` : ''}${r.last_checked ? `, checked ${r.last_checked}` : ', not checked yet'}`;
