import Link from 'next/link';

import { cx } from '@/components/ui';
import type { RequestStatus } from '@/data/types';
import { countRequestsByStatus, fetchAdminPlaces, fetchAllRequests } from '@/lib/data';
import { AdminPage, Empty } from '../_components/page';
import { RequestCard } from './RequestCard';

type Filter = RequestStatus | 'all';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'done', label: 'Done' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'all', label: 'All' },
];

// Every traveller request for a stay, guide or jeep, newest first.
// Filtered by status (?status=…), place (?place=…) and a search (?q=… name, email or partner).
export default async function AdminRequestsPage({ searchParams }: PageProps<'/admin/requests'>) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === 'string' ? v : undefined);
  const status = one(params.status);
  const filter: Filter = FILTERS.some((f) => f.id === status) ? (status as Filter) : 'new';
  const placeFilter = one(params.place) ?? '';
  const q = (one(params.q) ?? '').trim().toLowerCase();

  const [places, counts] = await Promise.all([fetchAdminPlaces(), countRequestsByStatus()]);
  let requests: Awaited<ReturnType<typeof fetchAllRequests>> = [];
  let loadFailed = false;
  try {
    requests = await fetchAllRequests(filter === 'all' ? undefined : filter);
  } catch (e) {
    console.warn('Loading requests failed:', e);
    loadFailed = true;
  }
  const placeName = (id: string) => places.find((p) => p.id === id)?.name.en ?? id;
  const shown = requests
    .filter((r) => !placeFilter || r.partner?.place_id === placeFilter)
    .filter((r) => !q || [r.requester_name, r.requester_email, r.partner?.name.en, r.note].some((s) => s?.toLowerCase().includes(q)));

  const total = counts.new + counts.contacted + counts.done + counts.cancelled;
  const href = (changes: Record<string, string>) => {
    const next = new URLSearchParams({ status: filter, ...(placeFilter && { place: placeFilter }), ...(q && { q }), ...changes });
    for (const [k, v] of [...next]) if (!v) next.delete(k);
    return `/admin/requests?${next}`;
  };

  return (
    <AdminPage
      title="Partner requests"
      subtitle="Travellers tap “Request” on a stay, guide or jeep. Contact them (or the partner), then move the request along: New → Contacted → Done.">
      <div className="flex flex-col gap-3">
        <nav aria-label="Status" className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => {
            const on = filter === f.id;
            const count = f.id === 'all' ? total : counts[f.id];
            return (
              <Link
                key={f.id}
                href={href({ status: f.id })}
                aria-current={on ? 'page' : undefined}
                className={cx('inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-bold', on ? 'border-deep bg-deep text-white' : 'border-line bg-white text-ink hover:border-deep')}>
                {f.label}
                <span className={cx('rounded-full px-1.5 text-xs', on ? 'bg-white/20' : f.id === 'new' && count ? 'bg-clay text-white' : 'bg-seg text-muted')}>{count}</span>
              </Link>
            );
          })}
        </nav>

        {/* A plain GET form: filtering works without JavaScript and lives in the address. */}
        <form action="/admin/requests" className="flex flex-wrap gap-2">
          <input type="hidden" name="status" value={filter} />
          <select name="place" defaultValue={placeFilter} aria-label="Place" className="h-10 rounded-xl border border-line bg-white px-3 text-sm">
            <option value="">All places</option>
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name.en}
              </option>
            ))}
          </select>
          <input type="search" name="q" defaultValue={q} placeholder="Search name, email, partner…" aria-label="Search requests" className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-sm sm:max-w-xs" />
          <button type="submit" className="h-10 rounded-xl border border-deep bg-deep px-4 text-sm font-bold text-white">
            Filter
          </button>
          {(placeFilter || q) && (
            <Link href={`/admin/requests?status=${filter}`} className="inline-flex h-10 items-center px-2 text-sm font-bold text-muted hover:text-ink">
              Clear
            </Link>
          )}
        </form>
      </div>

      {loadFailed && <p className="py-10 text-center text-clay">Couldn&apos;t load the requests. Reload the page to try again.</p>}
      {!loadFailed && shown.length === 0 && <Empty>No requests here.</Empty>}
      {requests.length >= 200 && <p className="text-xs text-muted">Showing the newest 200. Narrow it down with the status filter.</p>}
      <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((r) => (
          <RequestCard key={r.id} request={r} placeName={r.partner ? placeName(r.partner.place_id) : ''} />
        ))}
      </div>
    </AdminPage>
  );
}
