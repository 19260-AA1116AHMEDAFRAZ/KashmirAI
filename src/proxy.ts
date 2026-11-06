import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { LANG_COOKIE } from '@/i18n/config';
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from '@/lib/supabase/config';

// Pages anyone can open without choosing a language or signing in.
const OPEN_TO_ALL = ['/welcome', '/auth'];
const SIGN_IN = '/sign-in';

const startsWith = (path: string, prefix: string) => path === prefix || path.startsWith(prefix + '/');

// Runs before every page (Next.js 16 "proxy", formerly middleware):
//   1. keeps the Supabase session fresh (refreshed tokens are written back to cookies),
//   2. first visit → language screen, then signed-out visitors → sign-in screen,
//   3. signed-in visitors skip the sign-in screen.
// Pages and the database check again; this is the first line, not the only one.
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  let response = NextResponse.next({ request });

  let signedIn = !supabaseConfigured; // sample-data mode has no accounts, everyone is "in"
  if (supabaseConfigured) {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet, headers) => {
          for (const { name, value } of toSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
          for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, String(value));
        },
      },
    });
    // getClaims() validates the token (and refreshes it when needed). Don't put code between
    // creating the client and this call.
    const { data } = await supabase.auth.getClaims();
    signedIn = Boolean(data?.claims?.sub);
  }

  // Redirects keep any refreshed session cookies.
  const redirect = (to: string, keepNext = true) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    url.search = keepNext && path !== '/' ? `?next=${encodeURIComponent(path + request.nextUrl.search)}` : '';
    const r = NextResponse.redirect(url);
    for (const c of response.cookies.getAll()) r.cookies.set(c);
    return r;
  };

  if (OPEN_TO_ALL.some((p) => startsWith(path, p))) return response;
  if (!request.cookies.get(LANG_COOKIE)) return redirect('/welcome');
  if (startsWith(path, SIGN_IN)) return signedIn ? redirect('/discover', false) : response;
  if (!signedIn) return redirect(SIGN_IN);
  if (path === '/') return redirect('/discover', false);
  return response;
}

export const config = {
  // Every page, but not Next.js files, images or other static files. The PWA files (manifest,
  // service worker, offline page, icons) must also skip it: browsers fetch them without the
  // language cookie, and a redirect to /welcome would break installing the app.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|places/|icons/|sw\\.js$|manifest\\.webmanifest$|offline\\.html$|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
