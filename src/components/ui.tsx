import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { Icon, type IconName } from './Icon';

// Small building blocks matching the prototype's CSS classes (.card, .pill, .chip, .btn, .round, .lbl).
// They work in both Server and Client Components.

export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('rounded-2xl border border-line bg-white', className)}>{children}</div>;
}

// Uppercase section label (.lbl). Urdu has no capitals, so only the spacing applies there.
export function Label({ children, className = 'text-muted' }: { children: ReactNode; className?: string }) {
  return <p className={cx('text-xs font-bold uppercase tracking-wider', className)}>{children}</p>;
}

// light / ghost are for dark backgrounds (photos, the green summary cards).
// Pick a variant rather than adding colour classes: clashing Tailwind colours don't override reliably.
type ButtonVariant = 'primary' | 'outline' | 'soft' | 'light' | 'ghost';
const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-deep border-deep text-white',
  outline: 'bg-white border-deep text-deep',
  soft: 'bg-mint border-green text-deep',
  light: 'bg-white border-white text-deep',
  ghost: 'bg-transparent border-white text-white',
};

type ButtonProps = {
  variant?: ButtonVariant;
  icon?: IconName;
  iconAfter?: IconName;
  leading?: ReactNode;
  className?: string;
  children: ReactNode;
};

// Big button (.btn). Pass `href` for a link that looks like a button.
export function Button({
  variant = 'primary',
  icon,
  iconAfter,
  leading,
  className,
  children,
  href,
  ...rest
}: ButtonProps & ({ href: string } | (Omit<ComponentProps<'button'>, 'children' | 'className'> & { href?: undefined })) & { href?: string }) {
  const classes = cx(
    'inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 px-5 text-base font-bold transition active:opacity-75 disabled:opacity-50',
    BUTTON_STYLES[variant],
    className,
  );
  const content = (
    <>
      {leading}
      {icon && <Icon name={icon} size={20} className="text-current" />}
      <span className="truncate">{children}</span>
      {iconAfter && <Icon name={iconAfter} size={20} className="text-current" />}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} {...(rest as ComponentProps<'button'>)}>
      {content}
    </button>
  );
}

// 44px round icon link (.round), used for "back".
export function RoundLink({ href, icon = 'back', label, className }: { href: string; icon?: IconName; label: string; className?: string }) {
  return (
    <Link href={href} aria-label={label} className={cx('flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-white', className)}>
      <Icon name={icon} />
    </Link>
  );
}

// Small rounded tag, e.g. the place type ("Valley") or a status.
export function Tag({ children, className = 'bg-mint text-deep' }: { children: ReactNode; className?: string }) {
  return <span className={cx('inline-block rounded-full px-2 py-0.5 text-[11px] font-bold', className)}>{children}</span>;
}

// Filter chip (.chip): dark green when selected. A link, so filters live in the address.
export function ChipLink({ href, selected, children }: { href: string; selected: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={selected ? 'page' : undefined}
      className={cx(
        'inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-sm font-bold',
        selected ? 'border-deep bg-deep text-white' : 'border-line bg-white text-ink',
      )}>
      {children}
    </Link>
  );
}

// Small round number, e.g. how many new requests are waiting.
export function CountBadge({ count, className }: { count: number; className?: string }) {
  return (
    <span className={cx('latin inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-clay px-1.5 text-xs font-extrabold text-white', className)}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

// Round profile photo, or the first letter of the name.
export function Avatar({ src, name, size = 44 }: { src?: string; name: string; size?: number }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- Google profile photos come from many hosts
    return <img src={src} alt="" width={size} height={size} referrerPolicy="no-referrer" className="rounded-full bg-mint object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span className="latin flex items-center justify-center rounded-full bg-deep font-bold text-white" style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}>
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

// Name and photo from the account (Google fills these in; email sign-up stores full_name).
export function profileOf(user: { user_metadata?: Record<string, unknown> } | null): { name?: string; avatar?: string } {
  const meta = user?.user_metadata ?? {};
  const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined);
  return { name: str(meta.full_name) ?? str(meta.name), avatar: str(meta.avatar_url) ?? str(meta.picture) };
}
