import Link from 'next/link';

import { signOut } from '@/app/actions';
import { Icon } from '@/components/Icon';
import { SampleDataNotice } from '@/components/Notes';
import { Container, PageHeading } from '@/components/site/Container';
import { Avatar, Card, CountBadge, cx, Label, profileOf, Tag } from '@/components/ui';
import { getT } from '@/i18n/server';
import { countNewRequests, fetchAdmins, getViewer } from '@/lib/data';
import { MakeAdminForm } from './MakeAdminForm';

// Account: who is signed in, their role, language, sign out, and (for admins) Admin tools.
export default async function AccountPage() {
  const [{ t }, viewer] = await Promise.all([getT(), getViewer()]);
  const { user, role } = viewer;
  const { name, avatar } = profileOf(user);
  const isAdmin = role === 'admin';
  const [admins, newRequests] = isAdmin ? await Promise.all([fetchAdmins().catch(() => []), countNewRequests()]) : [[], 0];

  return (
    <Container narrow={!isAdmin}>
      <PageHeading title={t('account.title')} />
      <div className={cx('grid gap-6', isAdmin && 'lg:grid-cols-5')}>
        <div className="flex flex-col gap-4 lg:col-span-2">
          {user ? (
            <Card className="flex items-center gap-4 p-5">
              <Avatar src={avatar} name={name ?? user.email ?? '?'} size={64} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-lg font-bold">{name ?? t('account.traveller')}</span>
                {user.email && <span className="latin truncate text-sm text-muted">{user.email}</span>}
                <span>{isAdmin ? <Tag className="bg-gold-soft text-gold-dark">{t('account.roleAdmin')}</Tag> : <Tag>{t('account.roleTraveller')}</Tag>}</span>
              </div>
            </Card>
          ) : (
            <SampleDataNotice />
          )}

          <Card className="overflow-hidden">
            <Link href={`/welcome?next=${encodeURIComponent('/account')}`} className="flex min-h-14 items-center gap-3 px-5 hover:bg-bg">
              <Icon name="globe" className="text-deep" />
              <span className="flex-1 text-[15px] font-semibold">{t('discover.changeLanguage')}</span>
              <Icon name="chev" size={18} className="text-muted" />
            </Link>
          </Card>

          {user && (
            <form action={signOut}>
              <button type="submit" className="flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-deep bg-white text-base font-bold text-deep hover:bg-mint">
                {t('account.signOut')}
              </button>
            </form>
          )}
        </div>

        {isAdmin && (
          <section className="flex flex-col gap-4 lg:col-span-3">
            <div className="flex items-center gap-3 rounded-2xl bg-gold-soft p-4">
              <Icon name="shieldok" size={24} className="text-gold-icon" />
              <p className="flex-1 text-sm text-gold-dark">{t('account.adminNote')}</p>
            </div>

            <Card className="flex flex-col gap-5 p-6">
              <h2 className="flex items-center gap-2.5 text-xl font-extrabold">
                <Icon name="shieldok" className="text-gold-icon" />
                {t('account.adminTools')}
              </h2>

              <Link href="/admin" className="flex min-h-16 items-center gap-3 rounded-2xl bg-deep px-4 text-white transition hover:bg-green">
                <Icon name="grid" className="text-white" />
                <span className="flex flex-1 flex-col">
                  <span className="font-bold">{t('account.adminDashboard')}</span>
                  <span className="text-sm text-on-deep-muted">{t('account.adminDashboardSub')}</span>
                </span>
                <Icon name="chev" size={18} className="text-white" />
              </Link>

              <Link href="/admin/requests" className="flex min-h-16 items-center gap-3 rounded-2xl bg-mint px-4 text-deep transition hover:brightness-95">
                <Icon name="chat" className="text-deep" />
                <span className="flex flex-1 flex-col">
                  <span className="font-bold">{t('requests.title')}</span>
                  <span className="text-sm">{newRequests ? t('requests.newCount', { count: newRequests }) : t('requests.noneNew')}</span>
                </span>
                {newRequests > 0 && <CountBadge count={newRequests} />}
                <Icon name="chev" size={18} className="text-deep" />
              </Link>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>{t('account.admins')}</Label>
                  <ul className="latin flex flex-col gap-1.5 text-sm">
                    {admins.map((a) => (
                      <li key={a.user_id} className="flex items-center gap-2">
                        <Icon name="shieldok" size={16} className="text-gold-icon" />
                        <span className="truncate">{a.note ?? a.user_id}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <MakeAdminForm />
              </div>
            </Card>
          </section>
        )}
      </div>
    </Container>
  );
}
