import Link from 'next/link';

import { Icon, type IconName } from '@/components/Icon';
import { cardPlan, estimateTrip } from '@/lib/budget';
import { countRequestsByStatus, fetchAdminPartners, fetchAdminPlaces, fetchAdminRoadUpdates, fetchAllRequests, fetchPrices } from '@/lib/data';
import { formatWhen } from '@/lib/format';
import { AdminPage, Empty, LinkButton, Pill } from './_components/page';

// Admin overview: what's waiting (requests) and what's missing (prices, checks).
export default async function AdminOverviewPage() {
  const [places, partners, prices, roads, counts, latest] = await Promise.all([
    fetchAdminPlaces(),
    fetchAdminPartners(),
    fetchPrices(),
    fetchAdminRoadUpdates(),
    countRequestsByStatus(),
    fetchAllRequests('new').catch(() => []),
  ]);

  const placeName = (id: string) => places.find((p) => p.id === id)?.name.en ?? id;
  const live = places.filter((p) => p.active);
  const noBudget = live.filter((p) => !estimateTrip(cardPlan(p), p, prices));
  const activePartners = partners.filter((p) => p.active);
  const noPrice = activePartners.filter((p) => p.price_pkr == null);
  const unverified = places.filter((p) => !p.verified).length + partners.filter((p) => !p.verified).length + prices.filter((p) => !p.verified).length;
  const closedRoads = roads.filter((r) => r.status === 'closed').length;

  const stats: { label: string; value: number; sub: string; href: string; icon: IconName; alert?: boolean }[] = [
    { label: 'New requests', value: counts.new, sub: `${counts.contacted} being handled`, href: '/admin/requests?status=new', icon: 'chat', alert: counts.new > 0 },
    { label: 'Places on the site', value: live.length, sub: `${places.length - live.length} hidden`, href: '/admin/places', icon: 'map' },
    { label: 'Active partners', value: activePartners.length, sub: `${noPrice.length} without a price`, href: '/admin/partners', icon: 'users' },
    { label: 'Road updates', value: roads.length, sub: `${closedRoads} closed`, href: '/admin/roads', icon: 'alert' },
  ];

  return (
    <AdminPage
      title="Overview"
      subtitle="Everything travellers see on the site comes from here. Changes show up on the site straight away."
      actions={
        <>
          <LinkButton href="/admin/places/new" icon="plus">
            Add place
          </LinkButton>
          <LinkButton href="/admin/partners/new" icon="plus" kind="outline">
            Add partner
          </LinkButton>
        </>
      }>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-5 transition hover:border-deep">
            <span className="flex items-center gap-2 text-sm font-bold text-muted">
              <Icon name={s.icon} size={18} className={s.alert ? 'text-clay' : 'text-deep'} />
              {s.label}
            </span>
            <span className={`text-3xl font-extrabold ${s.alert ? 'text-clay' : 'text-ink'}`}>{s.value}</span>
            <span className="text-xs text-muted">{s.sub}</span>
          </Link>
        ))}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <section className="flex flex-col gap-3 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Waiting requests</h2>
            <Link href="/admin/requests" className="text-sm font-bold text-deep hover:underline">
              All requests
            </Link>
          </div>
          {latest.length === 0 ? (
            <Empty>No new requests. Travellers&apos; requests for stays, guides and jeeps appear here.</Empty>
          ) : (
            <ul className="overflow-hidden rounded-2xl border border-line bg-white">
              {latest.slice(0, 8).map((r) => (
                <li key={r.id} className="border-b border-seg last:border-b-0">
                  <Link href="/admin/requests?status=new" className="flex items-center gap-3 px-4 py-3 hover:bg-bg">
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-bold">{r.requester_name || r.requester_email || 'Traveller'}</span>
                      <span className="truncate text-xs text-muted">
                        {r.partner ? `${r.partner.name.en} · ${placeName(r.partner.place_id)}` : 'Partner removed'}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">{formatWhen(r.created_at, 'en')}</span>
                    <Icon name="chev" size={16} className="text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3 lg:col-span-2">
          <h2 className="text-lg font-extrabold">Needs attention</h2>
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
            {noBudget.length === 0 && noPrice.length === 0 && <p className="text-sm text-muted">Every place has a budget and every partner has a price.</p>}
            {noBudget.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-bold">Budget shows &ldquo;Price not set yet&rdquo;</p>
                <div className="flex flex-wrap gap-1.5">
                  {noBudget.map((p) => (
                    <Link key={p.id} href={`/admin/prices?place=${p.id}`} className="rounded-full border border-line px-2.5 py-1 text-xs font-bold text-deep hover:border-deep">
                      {p.name.en}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {noPrice.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-bold">Partners without a price</p>
                <div className="flex flex-wrap gap-1.5">
                  {noPrice.map((p) => (
                    <Link key={p.id} href={`/admin/partners/${p.id}`} className="rounded-full border border-line px-2.5 py-1 text-xs font-bold text-deep hover:border-deep">
                      {p.name.en}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <p className="flex items-center gap-2 border-t border-seg pt-3 text-sm">
              <Pill tone={unverified ? 'gold' : 'green'}>{unverified}</Pill>
              <span className="text-muted">places, partners and prices not checked locally yet</span>
            </p>
          </div>
        </section>
      </div>
    </AdminPage>
  );
}
