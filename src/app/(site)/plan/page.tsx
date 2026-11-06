import { fetchPlaces, fetchPrices } from '@/lib/data';
import { planFromParams } from '@/lib/plan';
import { Planner } from './Planner';

// Screen 4: Planner. The starting choices can come from the address (e.g. "Plan a trip here").
export default async function PlanPage({ searchParams }: PageProps<'/plan'>) {
  const [places, prices, params] = await Promise.all([fetchPlaces(), fetchPrices(), searchParams]);
  return <Planner places={places} prices={prices} initial={planFromParams(params)} />;
}
