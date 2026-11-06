import { notFound } from 'next/navigation';

import { partnerDraft } from '@/lib/admin/drafts';
import { fetchAdminPartner, fetchAdminPlaces } from '@/lib/data';
import { AdminPage, Pill } from '../../_components/page';
import { DeletePartner, PartnerForm } from '../PartnerForm';

export default async function EditPartnerPage({ params }: PageProps<'/admin/partners/[id]'>) {
  const { id } = await params;
  const [partner, places] = await Promise.all([fetchAdminPartner(id), fetchAdminPlaces()]);
  if (!partner) notFound();
  const placeName = places.find((p) => p.id === partner.place_id)?.name.en ?? partner.place_id;

  return (
    <AdminPage
      title={partner.name.en}
      subtitle={
        <span className="inline-flex flex-wrap items-center gap-1.5">
          {partner.active ? <Pill tone="green">Live on the site</Pill> : <Pill tone="grey">Hidden</Pill>}
          <span>{placeName}</span>
        </span>
      }
      back={{ href: `/admin/partners?place=${partner.place_id}`, label: 'Partners' }}>
      <PartnerForm initial={partnerDraft(partner)} id={partner.id} places={places.map((p) => ({ value: p.id, label: p.name.en + (p.active ? '' : ' (hidden)') }))} />
      <DeletePartner id={partner.id} name={partner.name.en} placeId={partner.place_id} />
    </AdminPage>
  );
}
