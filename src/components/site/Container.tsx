import type { ReactNode } from 'react';

import { cx } from '../ui';

// Page width used across the site: full width on phones, centred up to 72rem on desktops.
export function Container({ children, className, narrow }: { children: ReactNode; className?: string; narrow?: boolean }) {
  return <div className={cx('mx-auto w-full px-4 sm:px-6 lg:px-8', narrow ? 'max-w-3xl' : 'max-w-6xl', className)}>{children}</div>;
}

// Page title row with an optional "back" link and actions on the right.
export function PageHeading({ title, subtitle, back, actions }: { title: string; subtitle?: string; back?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-6 pb-4 sm:pt-10 sm:pb-6">
      {back}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="text-sm text-muted sm:text-base">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
