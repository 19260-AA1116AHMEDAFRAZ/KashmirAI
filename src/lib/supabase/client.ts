'use client';

import { createBrowserClient } from '@supabase/ssr';

import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from './config';

// Supabase client for the browser (sign-in forms). It keeps the session in cookies, so the
// server sees the same signed-in user. Returns null in sample-data mode.
export function createClient() {
  if (!supabaseConfigured) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
