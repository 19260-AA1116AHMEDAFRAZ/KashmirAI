import { notFound } from 'next/navigation';

import { placeDraft } from '@/lib/admin/drafts';
import { fetchAdminPartners, fetchAdminPlace } from '@/lib/data';
import { Notice } from '../../_components/fields';
import { AdminPage, LinkButton, Pill } from '../../_components/page';
import { DeletePlace, PlaceForm } from '../PlaceForm';

export default async function EditPlacePage({ params, searchParams }: PageProps<'/admin/places/[id]'>) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const [place, partners] = await Promise.all([fetchAdminPlace(id), fetchAdminPartners(id)]);
  if (!place) notFound();

  return (
    <AdminPage
      title={place.name.en}
      subtitle={
        <span className="inline-flex flex-wrap items-center gap-1.5">
          {place.active ? <Pill tone="green">Live on the site</Pill> : <Pill tone="grey">Hidden</Pill>}
          {place.updated_at && <span>Last saved {new Date(place.updated_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>}
        </span>
      }
      back={{ href: '/admin/places', label: 'Places' }}
      actions={
        <>
          <LinkButton href={`/admin/prices?place=${place.id}`} icon="tag" kind="outline">
            Trip prices
          </LinkButton>
          <LinkButton href={`/admin/partners?place=${place.id}`} icon="users" kind="outline">
            Partners ({partners.length})
          </LinkButton>
        </>
      }>
      {created && <Notice kind="ok">Place added. Next, set its trip prices so the budget shows.</Notice>}
      <PlaceForm initial={placeDraft(place)} isNew={false} />
      <DeletePlace id={place.id} name={place.name.en} partnerCount={partners.length} />
    </AdminPage>
  );
}
