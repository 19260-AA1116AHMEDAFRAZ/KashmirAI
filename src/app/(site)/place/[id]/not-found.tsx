import { Container } from '@/components/site/Container';
import { Button } from '@/components/ui';
import { getT } from '@/i18n/server';

export default async function PlaceNotFound() {
  const { t } = await getT();
  return (
    <Container narrow className="flex flex-col items-center gap-6 py-24 text-center">
      <p className="text-2xl font-extrabold">{t('common.notFound')}</p>
      <Button href="/discover" icon="back" variant="outline">
        {t('place.backToDiscover')}
      </Button>
    </Container>
  );
}
