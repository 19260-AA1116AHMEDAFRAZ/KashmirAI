import Link from 'next/link';

import { Logo, LogoMark } from '../Brand';
import { Icon } from '../Icon';
import { Avatar, CountBadge } from '../ui';
import { Container } from './Container';
import { NavLinks } from './NavLinks';

// Top bar on every site page: logo, main sections (desktop) and the account button.
export function SiteHeader({
  account,
  newRequests,
  isAdmin,
  labels,
}: {
  account: { name: string; avatar?: string } | null; // null = sample-data mode (no accounts)
  newRequests: number; // admins: new partner requests waiting
  isAdmin: boolean;
  labels: { account: string; language: string; admin: string; nav: Record<string, string> };
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur print:hidden">
      <Container className="flex h-16 items-center gap-6">
        <Link href="/discover" className="flex items-center gap-2.5" aria-label="KashmirAI">
          <LogoMark size={36} />
          <Logo size={20} />
        </Link>

        <NavLinks labels={labels.nav} />

        <div className="ms-auto flex items-center gap-3">
          {isAdmin && (
            <Link href="/admin" title={labels.admin} className="relative inline-flex h-10 items-center gap-1.5 rounded-full bg-gold-soft px-3 text-sm font-bold text-gold-dark hover:brightness-95">
              <Icon name="shieldok" size={18} className="text-gold-icon" />
              <span className="hidden sm:inline">{labels.admin}</span>
              {newRequests > 0 && <CountBadge count={newRequests} className="absolute -top-1 -end-1.5" />}
            </Link>
          )}
          <Link href={`/welcome?next=${encodeURIComponent('/discover')}`} aria-label={labels.language} title={labels.language} className="hidden h-10 w-10 items-center justify-center rounded-full border border-line sm:flex">
            <Icon name="globe" size={20} className="text-deep" />
          </Link>
          <Link href="/account" aria-label={labels.account} title={labels.account} className="relative">
            {account ? (
              <Avatar src={account.avatar} name={account.name} size={40} />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-deep">
                <Icon name="globe" size={20} className="text-white" />
              </span>
            )}
          </Link>
        </div>
      </Container>
    </header>
  );
}
