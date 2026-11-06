import type { I18nText, Lang } from '@/data/types';

// Pick the right language from a database text field, falling back to English.
export function pickText(text: I18nText | null | undefined, lang: Lang): string {
  if (!text) return '';
  return text[lang] || text.en;
}

// 38000 -> "38,000"
export function groupDigits(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 38000 -> "Rs 38,000" (English / Roman Urdu) or "38,000 روپے" (Urdu)
export function formatRs(amount: number, lang: Lang): string {
  return lang === 'ur' ? `${groupDigits(amount)} روپے` : `Rs ${groupDigits(amount)}`;
}

// Times are shown in Pakistan time. A fixed zone (rather than the device's) also means the server
// and the browser write exactly the same text, so pages don't hit a hydration mismatch.
const TIME_ZONE = 'Asia/Karachi';

// ISO timestamp -> "3 Nov, 9:10 am" (or "3 نومبر، 9:10 صبح") in Pakistan time.
export function formatWhen(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const date = d.toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-GB', { day: 'numeric', month: 'short', timeZone: TIME_ZONE });
  const parts = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hourCycle: 'h23', timeZone: TIME_ZONE }).formatToParts(d);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';
  const hhmm = `${Number(part('hour'))}:${part('minute')}`;
  return `${date}${lang === 'ur' ? '،' : ','} ${formatClock(hhmm, lang)}`;
}

// "17:30" -> "5:30 pm" (English / Roman Urdu) or "5:30 شام" (Urdu)
export function formatClock(hhmm: string, lang: Lang): string {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const time = `${h12}:${String(m).padStart(2, '0')}`;
  if (lang !== 'ur') return `${time} ${h < 12 ? 'am' : 'pm'}`;
  const part = h < 12 ? 'صبح' : h < 16 ? 'دوپہر' : h < 19 ? 'شام' : 'رات';
  return `${time} ${part}`;
}

// ISO date "2026-11-03" -> "3 Nov 2026"
export function formatDate(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const locale = lang === 'ur' ? 'ur-PK' : 'en-GB';
  // A plain date ("2026-11-03") is midnight UTC: read it in UTC so it never shifts a day.
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: iso.length === 10 ? 'UTC' : TIME_ZONE });
}
