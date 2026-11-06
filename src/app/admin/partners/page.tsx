import Link from 'next/link';

import { isFeatured } from '@/lib/partners';
import { fetchAdminPartners, fetchAdminPlaces } from '@/lib/data';
import { Notice } from '../_components/fields';
import { AdminPage, Empty, LinkButton, PlaceChips, Pill, rs } from '../_components/page';
import { ActiveToggle } from './PartnerForm';

const KIND_LABEL = { stay: 'Stay', guide: 'Guide', jeep: 'Jeep' } as const;

// Stays, guides and jeeps with their prices, for one place (?place=…) or all of them.
export default async function AdminPartnersPage({ searchParams }: PageProps<'/admin/partners'>) {
  const { place, added } = await searchParams;
  const [places, all] = await Promise.all([fetchAdminPlaces(), fetchAdminPartners()]);
  const current = typeof place === 'string' && places.some((p) => p.id === place) ? place : null;
  const partners = current ? all.filter((p) => p.place_id === current) : all;
  const placeName = (id: string) => places.find((p) => p.id === id)?.name.en ?? id;

  return (
    <AdminPage
      title="Partners & prices"
      subtitle="Guesthouses, guides and jeep drivers travellers can request, with the price they see."
      actions={
        <LinkButton href={`/admin/partners/new${current ? `?place=${current}` : ''}`} icon="plus">
          Add partner
        </LinkButton>
      }>
      {added && <Notice kind="ok">Partner added.</Notice>}
      <PlaceChips places={places.map((p) => ({ id: p.id, name: p.name.en, active: p.active }))} current={current} base="/admin/partners" allLabel={`All (${all.length})`} />

      {partners.length === 0 ? (
        <Empty>No partners {current ? `for ${placeName(current)} ` : ''}yet.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line bg-bg text-left text-xs font-bold text-muted uppercase">
              <tr>
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className={`border-b border-seg last:border-b-0 ${p.active ? '' : 'bg-bg/60 text-muted'}`}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/partners/${p.id}`} className="flex flex-col">
                      <span className="font-bold hover:text-deep">{p.name.en}</span>
                      <span className="text-xs text-muted">
                        {KIND_LABEL[p.kind]} · {placeName(p.place_id)}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {p.price_pkr == null ? <span className="font-semibold text-clay">Not set</span> : <span className="font-semibold">{rs(p.price_pkr)}</span>}
                    <span className="text-xs text-muted"> / {p.price_unit}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{p.phone ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="flex flex-wrap gap-1">
                      {p.active ? <Pill tone="green">Live</Pill> : <Pill tone="grey">Hidden</Pill>}
                      {isFeatured(p) && <Pill tone="gold">Featured{p.featured_until ? ` to ${p.featured_until}` : ''}</Pill>}
                      {p.featured && !isFeatured(p) && <Pill tone="red">Featured ended</Pill>}
                      {!p.verified && <Pill tone="gold">Not checked</Pill>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center justify-end gap-3">
                      <ActiveToggle id={p.id} active={p.active} />
                      <Link href={`/admin/partners/${p.id}`} className="font-bold text-deep hover:underline">
                        Edit
                      </Link>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPage>
  );
}
