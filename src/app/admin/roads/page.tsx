import { fetchAdminPlaces, fetchAdminRoadUpdates } from '@/lib/data';
import { AdminPage, PlaceChips } from '../_components/page';
import { RoadEditor } from './RoadEditor';

// Road updates for every place, newest change first (?place=… for one place).
export default async function AdminRoadsPage({ searchParams }: PageProps<'/admin/roads'>) {
  const [{ place }, places, all] = await Promise.all([searchParams, fetchAdminPlaces(), fetchAdminRoadUpdates()]);
  const current = typeof place === 'string' && places.some((p) => p.id === place) ? place : null;
  const roads = (current ? all.filter((r) => r.place_id === current) : all).sort((a, b) => b.updated_at.localeCompare(a.updated_at));

  return (
    <AdminPage title="Road updates" subtitle="Road status on the place pages and the warning banner on Discover. Saving an update stamps it with the current time.">
      <PlaceChips places={places.map((p) => ({ id: p.id, name: p.name.en, active: p.active }))} current={current} base="/admin/roads" allLabel={`All (${all.length})`} />
      <RoadEditor key={current ?? 'all'} roads={roads} places={places.map((p) => ({ value: p.id, label: p.name.en }))} placeFilter={current} />
    </AdminPage>
  );
}
