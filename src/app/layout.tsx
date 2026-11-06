import type { Metadata, Viewport } from 'next';
import { Noto_Nastaliq_Urdu, Plus_Jakarta_Sans } from 'next/font/google';

import { OfflineBanner, ServiceWorker } from '@/components/Pwa';
import { LanguageProvider } from '@/i18n/provider';
import { getLang } from '@/i18n/server';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ variable: '--font-jakarta', subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });
const nastaliq = Noto_Nastaliq_Urdu({ variable: '--font-nastaliq', subsets: ['arabic'], weight: ['400', '700'] });

export const metadata: Metadata = {
  title: 'KashmirAI',
  description: 'Plan trips across Azad Kashmir, see budgets in rupees and get local answers in English, Urdu or Roman Urdu.',
  applicationName: 'KashmirAI',
  // Installable app (see app/manifest.ts and public/sw.js). iOS reads these instead of the manifest.
  appleWebApp: { capable: true, title: 'KashmirAI', statusBarStyle: 'default' },
  icons: { apple: '/icons/apple-touch-icon.png?v=2' },
};

export const viewport: Viewport = { themeColor: '#15503C', width: 'device-width', initialScale: 1 };

// Every page depends on the visitor: the language cookie sets <html lang/dir> below, and almost
// every page needs a signed-in user. So there is no shared static shell to prerender; pages are
// rendered on the server for each request instead (Cache Components "instant" opt-out).
export const instant = false;

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  // The language cookie decides the language and direction before anything is shown.
  const lang = await getLang();
  // suppressHydrationWarning: browser extensions (LanguageTool, Grammarly, password managers…) add
  // attributes such as data-lt-installed to <html>/<body> before React loads, which React would
  // report as a hydration mismatch. It only covers these two tags' own attributes, so real
  // mismatches inside the page are still reported.
  return (
    <html lang={lang} dir={lang === 'ur' ? 'rtl' : 'ltr'} className={`${jakarta.variable} ${nastaliq.variable} antialiased`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col bg-bg" suppressHydrationWarning>
        <LanguageProvider lang={lang}>
          {children}
          <OfflineBanner />
        </LanguageProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
