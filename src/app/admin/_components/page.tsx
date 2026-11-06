import Link from 'next/link';
import type { ReactNode } from 'react';

import { Icon, type IconName } from '@/components/Icon';
import { cx } from '@/components/ui';

// Page frame and small pieces shared by the admin pages (Server and Client Components).

export function AdminPage({ title, subtitle, back, actions, children }: { title: string; subtitle?: ReactNode; back?: { href: string; label: string }; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-10">
      <header className="flex flex-col gap-2">
        {back && (
          <Link href={back.href} className="inline-flex items-center gap-1 self-start text-sm font-bold text-muted hover:text-deep">
            <Icon name="back" size={16} className="text-current" />
            {back.label}
          </Link>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </header>
      {children}
    </div>
  );
}

export function LinkButton({ href, children, icon, kind = 'primary' }: { href: string; children: ReactNode; icon?: IconName; kind?: 'primary' | 'outline' }) {
  return (
    <Link
      href={href}
      className={cx(
        'inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border px-4 text-sm font-bold transition',
        kind === 'primary' ? 'border-deep bg-deep text-white hover:border-green hover:bg-green' : 'border-line bg-white text-deep hover:border-deep',
      )}>
      {icon && <Icon name={icon} size={18} className="text-current" />}
      {children}
    </Link>
  );
}

// Small coloured status label.
const PILL = {
  green: 'bg-mint text-deep',
  gold: 'bg-gold-soft text-gold-dark',
  grey: 'bg-seg text-muted',
  red: 'bg-warn-bg text-warn-title',
} as const;
export function Pill({ tone, children }: { tone: keyof typeof PILL; children: ReactNode }) {
  return <span className={cx('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap', PILL[tone])}>{children}</span>;
}

// Place filter chips (?place=…) used by the partners, prices and roads pages.
export function PlaceChips({ places, current, base, allLabel }: { places: { id: string; name: string; active: boolean }[]; current: string | null; base: string; allLabel?: string }) {
  const chip = (on: boolean) => cx('inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-bold', on ? 'border-deep bg-deep text-white' : 'border-line bg-white text-ink hover:border-deep');
  return (
    <nav aria-label="Place" className="flex gap-2 overflow-x-auto pb-1">
      {allLabel && (
        <Link href={base} aria-current={current === null ? 'page' : undefined} className={chip(current === null)}>
          {allLabel}
        </Link>
      )}
      {places.map((p) => (
        <Link key={p.id} href={`${base}?place=${p.id}`} aria-current={current === p.id ? 'page' : undefined} className={chip(current === p.id)}>
          {p.name}
          {!p.active && <span className="text-[10px] font-bold uppercase opacity-70">hidden</span>}
        </Link>
      ))}
    </nav>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-line bg-white py-14 text-center text-sm text-muted">{children}</p>;
}

export const rs = (n: number | null | undefined) => (n == null ? '—' : `Rs ${Math.round(n).toLocaleString('en-US')}`);
