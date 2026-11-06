'use client';

import { useOffline } from 'next/offline';
import { useEffect } from 'react';

import { useT } from '@/i18n/provider';

// Registers the service worker (public/sw.js) that makes KashmirAI installable and shows the
// offline page when there's no internet. Production only: in `next dev` a service worker would
// get in the way of hot reload, so any left over from a production run on localhost is removed.
export function ServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
      return;
    }
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch((err) => console.warn('Service worker registration failed', err));
  }, []);
  return null;
}

// Small notice while the connection is down. Next.js (experimental.useOffline) keeps page changes
// and saves waiting meanwhile and finishes them once the internet is back. Hidden when online.
export function OfflineBanner() {
  const offline = useOffline();
  const { t } = useT();
  if (!offline) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[calc(max(env(safe-area-inset-bottom),12px)+76px)] z-40 mx-auto w-fit max-w-md rounded-2xl bg-ink px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg md:bottom-6 print:hidden"
    >
      {t('common.offline')}
    </div>
  );
}
