import { placeDraft } from '@/lib/admin/drafts';
import { AdminPage } from '../../_components/page';
import { PlaceForm } from '../PlaceForm';

export default function NewPlacePage() {
  return (
    <AdminPage title="Add place" subtitle="It shows on the site as soon as you add it (untick “Show on the site” to prepare it first)." back={{ href: '/admin/places', label: 'Places' }}>
      <PlaceForm initial={placeDraft()} isNew />
    </AdminPage>
  );
}
