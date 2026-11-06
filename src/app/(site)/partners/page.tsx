import Link from 'next/link';

import { Icon } from '@/components/Icon';
import { SampleDataNotice } from '@/components/Notes';
import { Container, PageHeading } from '@/components/site/Container';
import type { RequestStatus } from '@/data/types';
import { getT } from '@/i18n/server';
import { fetchMyRequests, fetchPartners, fetchPlace, getViewer } from '@/lib/data';
import { pickText } from '@/lib/format';
import { sortPartners } from '@/lib/partners';
import { PartnerList } from './PartnerList';

// Local partners (stays, guides, jeeps) for one place.
export default async function PartnersPage({ searchParams }: PageProps<'/partners'>) {
  const { place: placeParam } = await searchParams;
  const placeId = typeof placeParam === 'string' ? placeParam : 'neelum';
  const [{ t, lang }, partners, place, viewer] = await Promise.all([getT(), fetchPartners(placeId), fetchPlace(placeId), getViewer()]);

  // The latest request per partner, so each button can show its status.
  const statuses: Record<string, RequestStatus> = {};
  if (viewer.user) {
    for (const r of await fetchMyRequests(viewer.user.id).catch(() => [])) statuses[r.partner_id] ??= r.status;
  }

  return (
    <Container>
      <PageHeading
        title={t('partners.title')}
        subtitle={place ? pickText(place.name, lang) : placeId}
        back={
          <Link href={place ? `/place/${placeId}` : '/discover'} aria-label={t('partners.backToTrip')} className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white hover:border-deep">
            <Icon name="back" />
          </Link>
        }
      />
      <div className="mb-5">
        <SampleDataNotice />
      </div>
      <PartnerList partners={sortPartners(partners)} initialStatuses={statuses} canRequest={!viewer.sampleMode} />
    </Container>
  );
}
