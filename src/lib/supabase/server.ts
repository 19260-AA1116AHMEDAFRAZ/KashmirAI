import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from './config';

// Supabase client for Server Components, Server Actions and Route Handlers, signed in as the
// visitor (their session lives in cookies). Make a new one per request; never share it.
// Returns null in sample-data mode.
export async function createClient() {
  if (!supabaseConfigured) return null;
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
        } catch {
          // Server Components can't set cookies. proxy.ts refreshes the session instead.
        }
      },
    },
  });
}

export type ServerSupabase = NonNullable<Awaited<ReturnType<typeof createClient>>>;
