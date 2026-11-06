'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { RequestStatus } from '@/data/types';
import { isLang, LANG_COOKIE } from '@/i18n/config';
import { createClient } from '@/lib/supabase/server';

// Server Functions: every change the site makes goes through here and runs as the signed-in
// visitor, so the database's security rules have the final say (e.g. only admins can make admins).

// Only allow going back to a page on this site (never an outside address).
const safeNext = (next: unknown) => (typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/');

export async function chooseLanguage(lang: string, next?: string) {
  if (!isLang(lang)) return;
  (await cookies()).set(LANG_COOKIE, lang, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  // Go straight to the final page. (A redirect that proxy.ts redirects again leaves the browser
  // showing the old address, so don't rely on the proxy here.)
  const target = safeNext(next) === '/' ? '/discover' : safeNext(next);
  const sb = await createClient();
  const signedIn = !sb || Boolean((await sb.auth.getClaims()).data?.claims?.sub);
  if (!signedIn && !target.startsWith('/sign-in')) redirect(`/sign-in?next=${encodeURIComponent(target)}`);
  redirect(target);
}

export async function signOut() {
  const sb = await createClient();
  await sb?.auth.signOut();
  redirect('/sign-in');
}

export type ActionResult = { ok: true } | { ok: false; error: string };

// Makes the user with this email an admin (they must have an account). The database function
// refuses unless the caller is an admin.
export async function grantAdmin(email: string): Promise<ActionResult> {
  const target = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(target)) return { ok: false, error: 'auth.errors.badEmail' };
  const sb = await createClient();
  if (!sb) return { ok: false, error: 'account.adminError' };
  const { error } = await sb.rpc('grant_admin', { target_email: target });
  if (error) return { ok: false, error: error.code === 'P0002' ? 'account.adminNoAccount' : 'account.adminError' };
  revalidatePath('/account');
  return { ok: true };
}

// A traveller's "Request" on a stay, guide or jeep. The database fills in who asked.
// If one is already open for this partner, that one is returned instead.
export async function createPartnerRequest(partnerId: string): Promise<{ ok: true; status: RequestStatus } | { ok: false }> {
  const sb = await createClient();
  if (!sb) return { ok: false };
  const { data, error } = await sb.from('partner_requests').insert({ partner_id: partnerId }).select('status').single();
  if (!error) {
    // Still count the lead for the partner's referral report (5% model). No personal data.
    await sb.from('referral_clicks').insert({ partner_id: partnerId, device_id: 'web-' + crypto.randomUUID().slice(0, 12) });
    revalidatePath('/partners');
    return { ok: true, status: data.status as RequestStatus };
  }
  if (error.code === '23505') return { ok: true, status: 'new' }; // already asked
  console.warn('Partner request failed:', error.message);
  return { ok: false };
}

const STATUSES: RequestStatus[] = ['new', 'contacted', 'done', 'cancelled'];

// Admins only (the security rules turn anyone else's update into "0 rows changed").
export async function updateRequestStatus(id: string, status: RequestStatus): Promise<ActionResult> {
  if (!STATUSES.includes(status)) return { ok: false, error: 'requests.updateFailed' };
  const sb = await createClient();
  if (!sb) return { ok: false, error: 'requests.updateFailed' };
  const { data, error } = await sb.from('partner_requests').update({ status }).eq('id', id).select('id');
  if (error || !data?.length) return { ok: false, error: 'requests.updateFailed' };
  revalidatePath('/admin', 'layout'); // the list, the overview and the "new" badge in the sidebar
  return { ok: true };
}
