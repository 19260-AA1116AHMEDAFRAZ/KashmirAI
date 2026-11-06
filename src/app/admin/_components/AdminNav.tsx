'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Spark } from '@/components/Icon';
import { Icon, type IconName } from '@/components/Icon';
import { CountBadge, cx } from '@/components/ui';

const ITEMS: { href: string; label: string; icon: IconName; exact?: boolean }[] = [
  { href: '/admin', label: 'Overview', icon: 'grid', exact: true },
  { href: '/admin/requests', label: 'Requests', icon: 'chat' },
  { href: '/admin/places', label: 'Places', icon: 'map' },
  { href: '/admin/partners', label: 'Partners & prices', icon: 'users' },
  { href: '/admin/prices', label: 'Trip budget prices', icon: 'tag' },
  { href: '/admin/roads', label: 'Road updates', icon: 'alert' },
];

// Sidebar on desktop, a scrolling row of tabs on phones.
export function AdminNav({ newRequests, who, email }: { newRequests: number; who: string; email: string }) {
  const path = usePathname();
  const on = (href: string, exact?: boolean) => (exact ? path === href : path === href || path.startsWith(href + '/'));

  return (
    <aside className="sticky top-0 z-30 flex shrink-0 flex-col border-b border-line bg-white lg:h-dvh lg:w-64 lg:border-e lg:border-b-0">
      <div className="flex items-center gap-2.5 px-4 py-3 lg:px-5 lg:py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-deep">
          <Spark size={20} />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-extrabold text-deep">KashmirAI</span>
          <span className="text-xs font-bold tracking-wider text-gold-dark uppercase">Admin</span>
        </span>
        <Link href="/discover" className="ms-auto inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-bold text-deep hover:border-deep lg:hidden">
          View site
        </Link>
      </div>

      <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-2 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {ITEMS.map((item) => {
          const active = on(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'flex h-10 shrink-0 items-center gap-2.5 rounded-xl px-3 text-sm font-bold whitespace-nowrap transition',
                active ? 'bg-mint text-deep' : 'text-muted hover:bg-seg hover:text-ink',
              )}>
              <Icon name={item.icon} size={18} className="text-current" />
              <span className="flex-1">{item.label}</span>
              {item.href === '/admin/requests' && newRequests > 0 && <CountBadge count={newRequests} />}
            </Link>
          );
        })}
      </nav>

      <div className="hidden flex-col gap-2 border-t border-line p-4 lg:flex">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-bold">{who}</span>
          {email && email !== who && <span className="truncate text-xs text-muted">{email}</span>}
        </div>
        <div className="flex gap-2">
          <Link href="/discover" className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-line text-xs font-bold text-deep hover:border-deep">
            <Icon name="globe" size={16} className="text-deep" />
            View site
          </Link>
          <Link href="/account" className="inline-flex h-9 flex-1 items-center justify-center rounded-xl border border-line text-xs font-bold text-deep hover:border-deep">
            Account
          </Link>
        </div>
      </div>
    </aside>
  );
}
