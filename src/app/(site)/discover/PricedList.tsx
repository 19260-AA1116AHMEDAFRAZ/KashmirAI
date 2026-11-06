import type { Place, Price } from '@/data/types';
import { estimateCards } from '@/lib/estimate';
import { DiscoverList } from './DiscoverList';

// The place grid with each card's price estimated by Gemini. This takes a few seconds the first time
// (the answers are then remembered), so Discover wraps it in <Suspense> and shows the grid without
// prices until it is ready.
export async function PricedList({ places, prices }: { places: Place[]; prices: Price[] }) {
  return <DiscoverList places={places} estimates={await estimateCards(places, prices)} />;
}
