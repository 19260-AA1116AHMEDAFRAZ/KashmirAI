import Link from 'next/link';

import { EMERGENCY_CONTACTS } from '@/data/sample';
import type { Lang } from '@/data/types';
import type { TFunction } from '@/i18n/config';
import { pickText } from '@/lib/format';
import { Logo } from '../Brand';
import { Icon } from '../Icon';
import { Container } from './Container';
import { NAV } from './nav';

// Site footer: sections, emergency numbers and the "estimated" reminder.
export function SiteFooter({ t, lang }: { t: TFunction; lang: Lang }) {
  return (
    <footer className="mt-16 border-t border-line bg-white pb-24 md:pb-0">
      <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <Logo size={22} />
          <p className="max-w-md text-sm text-muted">{t('welcome.intro')}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Icon name="info" size={14} className="text-muted" />
            {t('common.estimated')}
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="font-semibold text-ink hover:text-deep">
              {t(`tabs.${item.key}`)}
            </Link>
          ))}
          <Link href="/partners?place=neelum" className="font-semibold text-ink hover:text-deep">
            {t('discover.partnersTitle')}
          </Link>
        </nav>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-extrabold">{t('trips.safety')}</p>
          {EMERGENCY_CONTACTS.map((c) => (
            <a key={c.id} href={`tel:${c.number}`} className="flex items-center gap-2 text-sm">
              <Icon name={c.kind === 'rescue' ? 'phone' : 'shield'} size={16} className={c.kind === 'rescue' ? 'text-clay' : 'text-deep'} />
              <span className="latin font-extrabold">{c.number}</span>
              <span className="text-muted">{pickText(c.label, lang)}</span>
            </a>
          ))}
        </div>
      </Container>
      <Container className="border-t border-line py-4 text-xs text-muted">© KashmirAI · Azad Kashmir</Container>
    </footer>
  );
}
