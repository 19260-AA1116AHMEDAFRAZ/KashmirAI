'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { LogoBadge, PhotoCredit } from '@/components/Brand';
import { GoogleLogo, Icon } from '@/components/Icon';
import { Banner } from '@/components/Notes';
import { Segmented } from '@/components/Segmented';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/ui';
import { useT } from '@/i18n/provider';
import { createClient } from '@/lib/supabase/client';

type Mode = 'sign-in' | 'sign-up';
type Notice = { kind: 'error' | 'info'; text: string } | null;

const MIN_PASSWORD = 6; // Supabase's default minimum
const looksLikeEmail = (s: string) => /^\S+@\S+\.\S+$/.test(s.trim());

// Turns a Supabase sign-in error into one of the `auth.errors.*` messages.
function authErrorKey(e: unknown): string {
  const code = typeof e === 'object' && e && 'code' in e ? String((e as { code?: unknown }).code) : '';
  const map: Record<string, string> = {
    invalid_credentials: 'invalid',
    user_already_exists: 'exists',
    email_exists: 'exists',
    weak_password: 'weakPassword',
    email_not_confirmed: 'notConfirmed',
    email_address_invalid: 'badEmail',
    validation_failed: 'badEmail',
    over_request_rate_limit: 'rateLimit',
    over_email_send_rate_limit: 'rateLimit',
    signup_disabled: 'signupOff',
    email_provider_disabled: 'signupOff',
  };
  return `auth.errors.${map[code] ?? 'generic'}`;
}

export function SignInForm({ next, callbackFailed }: { next: string; callbackFailed: boolean }) {
  const { t } = useT();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<'email' | 'google' | null>(null);
  const [notice, setNotice] = useState<Notice>(callbackFailed ? { kind: 'error', text: t('auth.error') } : null);
  const signingUp = mode === 'sign-up';
  const supabase = createClient();
  // Where Google and confirmation emails send people back to (must be in Supabase's Redirect URLs).
  const callbackUrl = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    // Check the form first, so people get a clear message without waiting for the server.
    if (signingUp && !name.trim()) return setNotice({ kind: 'error', text: t('auth.errors.needName') });
    if (!looksLikeEmail(email)) return setNotice({ kind: 'error', text: t('auth.errors.badEmail') });
    if (password.length < MIN_PASSWORD) return setNotice({ kind: 'error', text: t('auth.errors.weakPassword') });

    setBusy('email');
    setNotice(null);
    try {
      if (signingUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() }, emailRedirectTo: callbackUrl() },
        });
        if (error) throw error;
        // With "Confirm email" off in Supabase, the account is signed in straight away.
        if (!data.session) {
          setMode('sign-in');
          setPassword('');
          setNotice({ kind: 'info', text: t('auth.checkEmail', { email: email.trim() }) });
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
      router.replace(next);
      router.refresh();
    } catch (err) {
      console.warn('Email sign-in failed', err);
      setNotice({ kind: 'error', text: t(authErrorKey(err)) });
    } finally {
      setBusy(null);
    }
  };

  const google = async () => {
    if (!supabase) return;
    setBusy('google');
    setNotice(null);
    // The whole page goes to Google and comes back to /auth/callback.
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callbackUrl(), queryParams: { prompt: 'select_account' } } });
    if (error) {
      console.warn('Google sign-in failed', error);
      setNotice({ kind: 'error', text: t('auth.error') });
      setBusy(null);
    }
  };

  return (
    // Split screen: the photo on one half, the form on the other (stacked on phones).
    <main className="grid min-h-dvh flex-1 lg:grid-cols-2">
      <div className="relative h-[26dvh] min-h-44 overflow-hidden bg-mint lg:h-auto">
        <Image src="/places/neelum.jpg" alt="Neelum Valley river between green mountains" fill preload sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        <PhotoCredit text="Neelum Valley · Photo: Ab. Waheed / Unsplash" />
        <LogoBadge />
      </div>

      <form onSubmit={submit} noValidate className="mx-auto flex w-full max-w-md flex-col justify-center gap-4 px-6 py-10">

        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">{signingUp ? t('auth.titleSignUp') : t('auth.title')}</h1>
          <p className="text-sm text-muted">{t('auth.intro')}</p>
        </div>

        <Segmented<Mode>
          value={mode}
          onChange={(m) => {
            setMode(m);
            setNotice(null);
          }}
          options={[
            { id: 'sign-in', label: t('auth.modeSignIn') },
            { id: 'sign-up', label: t('auth.modeSignUp') },
          ]}
        />

        {signingUp && <TextField id="name" label={t('auth.name')} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}
        <TextField
          id="email"
          label={t('auth.email')}
          latin
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
        />
        <TextField
          id="password"
          label={t('auth.password')}
          latin
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={signingUp ? t('auth.passwordHint') : undefined}
          autoComplete={signingUp ? 'new-password' : 'current-password'}
        />

        {notice && <Banner kind={notice.kind}>{notice.text}</Banner>}

        <Button type="submit" disabled={busy !== null}>
          {busy === 'email' ? t('auth.working') : signingUp ? t('auth.signUp') : t('auth.signIn')}
        </Button>

        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="h-px flex-1 bg-line" />
          {t('auth.or')}
          <span className="h-px flex-1 bg-line" />
        </div>

        <Button variant="outline" leading={<GoogleLogo />} onClick={google} disabled={busy !== null}>
          {busy === 'google' ? t('auth.opening') : t('auth.google')}
        </Button>

        <Link href={`/welcome?next=${encodeURIComponent('/sign-in')}`} className="mt-1 inline-flex items-center justify-center gap-1.5 self-center text-sm font-bold text-deep">
          <Icon name="globe" size={16} className="text-deep" />
          {t('discover.changeLanguage')}
        </Link>
        <p className="text-center text-[11px] text-muted">{t('auth.privacy')}</p>
      </form>
    </main>
  );
}
