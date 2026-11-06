import type { ItineraryDay, Lang, Place } from '@/data/types';
import type { TFunction } from '@/i18n/config';
import { fetchRoadUpdates } from '@/lib/data';
import { buildItinerary } from '@/lib/itinerary';
import type { PlanInput } from '@/lib/plan';
import { DayPlan, PrintDays, SavePdfButton } from './TripParts';

// The day-by-day plan, written by Gemini for this trip. It is slower than the rest of the page, so
// the Trip page wraps it in <Suspense> and shows PlanLoading until it is ready. If Gemini is not
// available, the team's stored itinerary for the place is shown instead.
// The "Save plan as PDF" button is part of it, so it only appears once the days are there to print.
export async function PlannedDays({ plan, places, stored, lang, fileName }: { plan: PlanInput; places: Place[]; stored: ItineraryDay[]; lang: Lang; fileName: string }) {
  const roads = (await Promise.all(places.map((p) => fetchRoadUpdates(p.id)))).flat();
  // The stored itinerary is a template for one place only; with several destinations Gemini plans from scratch.
  const built = await buildItinerary(plan, places, roads, lang, places.length === 1 ? stored : []);
  const itinerary = built ?? stored;
  return (
    <>
      <div className="rounded-3xl border border-line bg-white p-5 sm:p-6 print:hidden">
        <DayPlan days={plan.days} itinerary={itinerary} ai={built !== null} />
      </div>
      <PrintDays itinerary={itinerary} ai={built !== null} />
      <SavePdfButton fileName={fileName} />
    </>
  );
}

export function PlanLoading({ t }: { t: TFunction }) {
  return (
    <div role="status" className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 sm:p-6 print:hidden">
      <p className="animate-pulse text-[15px] font-bold text-deep">{t('trip.building')}</p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex animate-pulse gap-3.5">
          <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-timeline" />
          <div className="flex flex-1 flex-col gap-2">
            <span className="h-3 w-16 rounded bg-timeline" />
            <span className="h-4 w-2/3 rounded bg-timeline" />
            <span className="h-3 w-full rounded bg-timeline" />
          </div>
        </div>
      ))}
    </div>
  );
}
