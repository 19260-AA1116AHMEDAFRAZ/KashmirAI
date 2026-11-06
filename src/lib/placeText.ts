import type { Place } from '@/data/types';
import type { TFunction } from '@/i18n/config';

// "Day trip", "3 days" or "2–4 days" from a place's days_min / days_max.
export function daysLabel(place: Place, t: TFunction): string {
  const { days_min: min, days_max: max } = place;
  if (min == null) return t('common.notSet');
  if (max == null || min === max) return min === 1 ? t('common.dayTrip') : t('common.daysCount', { count: min });
  return t('common.daysRange', { min, max });
}

export function googleMapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
