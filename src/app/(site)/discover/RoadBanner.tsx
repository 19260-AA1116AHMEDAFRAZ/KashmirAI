import { Icon } from '@/components/Icon';
import { EstimatedNote } from '@/components/Notes';
import type { Lang, Place, RoadUpdate } from '@/data/types';
import type { TFunction } from '@/i18n/config';
import { formatWhen, pickText } from '@/lib/format';
import { buildRoadAdvisory } from '@/lib/roadAdvisory';

// The road banner on Discover. Gemini writes it from the season and the team's road updates; if Gemini
// is not available, the newest team update (the one with a note) is shown as before.
export async function RoadBanner({ places, roads, lang, t }: { places: Place[]; roads: RoadUpdate[]; lang: Lang; t: TFunction }) {
  const advisory = await buildRoadAdvisory(lang, places, roads);

  if (advisory) {
    const caution = advisory.level === 'caution';
    return (
      <div className={`flex gap-3 rounded-2xl border p-4 sm:p-5 ${caution ? 'border-warn-border bg-warn-bg' : 'border-green bg-mint'}`}>
        <Icon name={caution ? 'alert' : 'info'} className={`mt-0.5 ${caution ? 'text-warn-title' : 'text-deep'}`} />
        <div className="flex flex-1 flex-col gap-1">
          <p className={`font-bold ${caution ? 'text-warn-title' : 'text-deep'}`}>{advisory.title}</p>
          <p className={`text-sm ${caution ? 'text-warn-text' : 'text-ink'}`}>
            {advisory.note} {t('discover.updated', { when: formatWhen(advisory.asOf, lang) })}
          </p>
          <p className={`flex items-center gap-1.5 text-xs ${caution ? 'text-warn-text' : 'text-muted'}`}>
            <Icon name="info" size={14} className="text-current" />
            {t('discover.roadAiNote')}
          </p>
        </div>
      </div>
    );
  }

  // Fallback: the newest team update that has a note.
  const road = roads.filter((r) => r.note).sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
  if (!road) return null;
  return (
    <div className="flex gap-3 rounded-2xl border border-warn-border bg-warn-bg p-4 sm:p-5">
      <Icon name="alert" className="mt-0.5 text-warn-title" />
      <div className="flex flex-1 flex-col gap-1">
        <p className="font-bold text-warn-title">{t('discover.roadUpdate', { segment: pickText(road.segment, lang) })}</p>
        <p className="text-sm text-warn-text">
          {pickText(road.note, lang)} {t('discover.updated', { when: formatWhen(road.updated_at, lang) })}
        </p>
        <EstimatedNote lastChecked={road.last_checked} sample={road.source === 'sample'} className="text-warn-text" />
      </div>
    </div>
  );
}

// Shown for the few seconds Gemini needs the first time (afterwards the answer is remembered).
export function RoadBannerLoading() {
  return <div aria-hidden className="h-24 animate-pulse rounded-2xl border border-line bg-white" />;
}
