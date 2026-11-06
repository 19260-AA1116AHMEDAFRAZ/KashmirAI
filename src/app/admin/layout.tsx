import { redirect } from 'next/navigation';

import { profileOf } from '@/components/ui';
import { LanguageProvider } from '@/i18n/provider';
import { countNewRequests, getViewer } from '@/lib/data';
import { AdminNav } from './_components/AdminNav';

// The admin dashboard: its own shell (sidebar, no traveller header or tab bar), always in English
// and left-to-right whatever language the site is set to.
//
// Everything under /admin is for admins only. Checked on the server for every request; each
// action checks again, and so do the database's security rules.
export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const viewer = await getViewer();
  if (viewer.role !== 'admin') redirect('/account');
  const newRequests = await countNewRequests();
  const { name } = profileOf(viewer.user);

  return (
    <LanguageProvider lang="en">
      {/* font-sans / leading-normal undo the Urdu font the site uses when its language is Urdu. */}
      <div lang="en" dir="ltr" className="flex min-h-dvh flex-col font-sans leading-normal lg:flex-row">
        <AdminNav newRequests={newRequests} who={name ?? viewer.user?.email ?? 'Admin'} email={viewer.user?.email ?? ''} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </LanguageProvider>
  );
}
