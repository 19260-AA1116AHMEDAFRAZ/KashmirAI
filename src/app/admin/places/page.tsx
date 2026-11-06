import Link from 'next/link';

import { PlaceThumb } from '@/components/PlaceImage';
import { cardPlan, estimateTrip } from '@/lib/budget';
import { fetchAdminPartners, fetchAdminPlaces, fetchPrices } from '@/lib/data';
import { AdminPage, Empty, LinkButton, Pill, rs } from '../_components/page';

const TYPE_LABEL = { valley: 'Valley', lake: 'Lake', hilltop: 'Hilltop', town: 'Town' } as const;

// All places, including hidden ones, in the order the site shows them.
export default async function AdminPlacesPage() {
  const [places, partners, prices] = await Promise.all([fetchAdminPlaces(), fetchAdminPartners(), fetchPrices()]);

  return (
    <AdminPage
      title="Places"
      subtitle="The destinations on Discover and in the planner. Hidden places stay in the database but don't show on the site."
      actions={
        <LinkButton href="/admin/places/new" icon="plus">
          Add place
        </LinkButton>
      }>
      {places.length === 0 ? (
        <Empty>No places yet. Add the first one.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line bg-bg text-left text-xs font-bold text-muted uppercase">
              <tr>
                <th className="px-4 py-3">Place</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Example budget</th>
                <th className="px-4 py-3">Partners</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {places.map((p) => {
                const estimate = estimateTrip(cardPlan(p), p, prices);
                const count = partners.filter((x) => x.place_id === p.id).length;
                return (
                  <tr key={p.id} className="border-b border-seg last:border-b-0 hover:bg-bg/60">
                    <td className="px-4 py-3">
                      <Link href={`/admin/places/${p.id}`} className="flex items-center gap-3">
                        <PlaceThumb place={p} label="" size={44} />
                        <span className="flex min-w-0 flex-col">
                          <span className="font-bold hover:text-deep">{p.name.en}</span>
                          <span className="text-xs text-muted">
                            {TYPE_LABEL[p.type]}
                            {p.district?.en ? ` · ${p.district.en}` : ''} · <span className="font-mono">{p.id}</span>
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap gap-1">
                        {p.active ? <Pill tone="green">Live</Pill> : <Pill tone="grey">Hidden</Pill>}
                        {p.verified ? <Pill tone="green">Checked</Pill> : <Pill tone="gold">Not checked</Pill>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/prices?place=${p.id}`} className="font-semibold text-deep hover:underline">
                        {estimate ? rs(estimate.total) : <span className="text-clay">Not set</span>}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/partners?place=${p.id}`} className="font-semibold text-deep hover:underline">
                        {count}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.sort_order}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/places/${p.id}`} className="font-bold text-deep hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted">Example budget: from Islamabad, 2 people, budget style, about 3 days (what the Discover cards show).</p>
    </AdminPage>
  );
}
