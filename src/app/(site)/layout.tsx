import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { TabBar } from '@/components/TabBar';
import { profileOf } from '@/components/ui';
import { getT } from '@/i18n/server';
import { countNewRequests, getViewer } from '@/lib/data';

// Every page of the site (not welcome / sign-in): header, page, footer, and the phone tab bar.
export default async function SiteLayout({ children }: LayoutProps<'/'>) {
  const [{ t, lang }, viewer] = await Promise.all([getT(), getViewer()]);
  const newRequests = viewer.role === 'admin' ? await countNewRequests() : 0;
  const { name, avatar } = profileOf(viewer.user);

  return (
    <>
      <SiteHeader
        account={viewer.user ? { name: name ?? viewer.user.email ?? '?', avatar } : null}
        newRequests={newRequests}
        isAdmin={viewer.role === 'admin'}
        labels={{
          account: t('account.title'),
          language: t('discover.changeLanguage'),
          admin: t('account.adminDashboard'),
          nav: { discover: t('tabs.discover'), plan: t('tabs.plan'), ask: t('tabs.ask'), trips: t('tabs.trips') },
        }}
      />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter t={t} lang={lang} />
      <TabBar />
    </>
  );
}
