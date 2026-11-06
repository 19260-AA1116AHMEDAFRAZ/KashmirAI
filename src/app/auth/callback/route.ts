import { NextResponse, type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';

// Google sign-in and email-confirmation links come back here with a one-time ?code=.
// Swapping it for a session sets the sign-in cookies, then the visitor goes on into the site.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next');
  const goTo = next && next.startsWith('/') && !next.startsWith('//') ? next : '/discover';

  if (code) {
    const sb = await createClient();
    const { error } = (await sb?.auth.exchangeCodeForSession(code)) ?? { error: new Error('Supabase is not configured') };
    if (!error) return NextResponse.redirect(`${origin}${goTo}`);
    console.warn('Sign-in callback failed:', error.message);
  }
  return NextResponse.redirect(`${origin}/sign-in?error=callback`);
}
