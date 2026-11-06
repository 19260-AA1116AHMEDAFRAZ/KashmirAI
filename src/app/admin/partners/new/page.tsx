import { partnerDraft } from '@/lib/admin/drafts';
import { fetchAdminPlaces } from '@/lib/data';
import { AdminPage } from '../../_components/page';
import { PartnerForm } from '../PartnerForm';

export default async function NewPartnerPage({ searchParams }: PageProps<'/admin/partners/new'>) {
  const [{ place }, places] = await Promise.all([searchParams, fetchAdminPlaces()]);
  const placeId = typeof place === 'string' && places.some((p) => p.id === place) ? place : '';
  return (
    <AdminPage title="Add partner" back={{ href: `/admin/partners${placeId ? `?place=${placeId}` : ''}`, label: 'Partners' }}>
      <PartnerForm initial={partnerDraft(null, placeId)} id={null} places={places.map((p) => ({ value: p.id, label: p.name.en + (p.active ? '' : ' (hidden)') }))} />
    </AdminPage>
  );
}
