import { priceDrafts } from '@/lib/admin/drafts';
import { fetchAdminPlaces, fetchPrices } from '@/lib/data';
import { AdminPage, Empty, LinkButton, PlaceChips } from '../_components/page';
import { PriceEditor } from './PriceEditor';

// The trip budget price list for one place (?place=…): what the planner and trip budget use.
export default async function AdminPricesPage({ searchParams }: PageProps<'/admin/prices'>) {
  const [{ place }, places] = await Promise.all([searchParams, fetchAdminPlaces()]);
  const current = places.find((p) => p.id === place) ?? places[0];
  if (!current) {
    return (
      <AdminPage title="Trip budget prices">
        <Empty>Add a place first.</Empty>
      </AdminPage>
    );
  }
  const prices = await fetchPrices(current.id);

  return (
    <AdminPage
      title="Trip budget prices"
      subtitle="The planner and trip pages add these up into the budget travellers see. Partner prices are set on each partner."
      actions={
        <LinkButton href={`/admin/places/${current.id}`} icon="edit" kind="outline">
          Edit {current.name.en}
        </LinkButton>
      }>
      <PlaceChips places={places.map((p) => ({ id: p.id, name: p.name.en, active: p.active }))} current={current.id} base="/admin/prices" />
      {/* key: a fresh editor (and preview) for each place */}
      <PriceEditor
        key={current.id}
        place={{ id: current.id, name: current.name.en, jeep_days: current.jeep_days, days_min: current.days_min, days_max: current.days_max }}
        initial={priceDrafts(prices)}
      />
    </AdminPage>
  );
}
