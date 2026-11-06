'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useT } from '@/i18n/provider';
import { Icon, type IconName } from './Icon';
import { isActive, NAV } from './site/nav';

const ICONS: Record<string, IconName> = { discover: 'compass', plan: 'cal', ask: 'chat', trips: 'bookmark' };

// Phones only: bottom navigation (the header shows the same links on larger screens).
export function TabBar() {
  const { t } = useT();
  const path = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-line bg-white px-2 pt-2 pb-[max(env(safe-area-inset-bottom),12px)] md:hidden print:hidden">
      {NAV.map((tab) => {
        const on = isActive(path, tab.href);
        return (
          <Link key={tab.href} href={tab.href} aria-current={on ? 'page' : undefined} className="flex min-h-13 min-w-18 flex-col items-center justify-center gap-1">
            <span className={`rounded-full px-4 py-1 ${on ? 'bg-mint' : ''}`}>
              <Icon name={ICONS[tab.key]} size={22} strokeWidth={1.9} className={on ? 'text-deep' : 'text-muted'} />
            </span>
            <span className={`text-[11px] leading-none ${on ? 'font-bold text-deep' : 'font-semibold text-muted'}`}>{t(`tabs.${tab.key}`)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
