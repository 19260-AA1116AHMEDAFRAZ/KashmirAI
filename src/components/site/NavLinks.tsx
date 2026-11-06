'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cx } from '../ui';
import { isActive, NAV } from './nav';

// Main sections in the header (tablet and desktop; phones use the bottom tab bar).
export function NavLinks({ labels }: { labels: Record<string, string> }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
      {NAV.map((item) => {
        const on = isActive(path, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={on ? 'page' : undefined}
            className={cx('rounded-full px-4 py-2 text-[15px] font-bold transition', on ? 'bg-mint text-deep' : 'text-muted hover:bg-seg hover:text-ink')}>
            {labels[item.key]}
          </Link>
        );
      })}
    </nav>
  );
}
