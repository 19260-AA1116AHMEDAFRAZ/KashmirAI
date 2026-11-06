import type { Partner } from '@/data/types';

// Today's date as "YYYY-MM-DD" (the same format as featured_until).
export function todayISO(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

// A paid featured listing only counts until its featured_until date (inclusive).
export function isFeatured(p: Partner, today = todayISO()): boolean {
  return p.featured && (p.featured_until === null || p.featured_until >= today);
}

// Featured partners first, then alphabetical by English name. Hidden (inactive) partners are dropped.
export function sortPartners(list: Partner[], today = todayISO()): Partner[] {
  return list
    .filter((p) => p.active)
    .sort((a, b) => Number(isFeatured(b, today)) - Number(isFeatured(a, today)) || a.name.en.localeCompare(b.name.en));
}
