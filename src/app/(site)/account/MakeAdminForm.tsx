'use client';

import { useState, useTransition, type FormEvent } from 'react';

import { grantAdmin } from '@/app/actions';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/ui';
import { useT } from '@/i18n/provider';

// "Make someone an admin" by email. The database refuses unless the visitor is an admin.
export function MakeAdminForm() {
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const target = email.trim().toLowerCase();
    setResult(null);
    startTransition(async () => {
      const r = await grantAdmin(target);
      if (r.ok) {
        setEmail('');
        setResult({ ok: true, text: t('account.adminAdded', { email: target }) });
      } else {
        setResult({ ok: false, text: t(r.error) });
      }
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5">
      <TextField
        id="admin-email"
        label={t('account.addAdmin')}
        latin
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@example.com"
        autoCapitalize="none"
        spellCheck={false}
      />
      <p className="text-xs text-muted">{t('account.addAdminHint')}</p>
      {result && (
        <p role="status" className={`text-[13px] ${result.ok ? 'text-green' : 'text-clay'}`}>
          {result.text}
        </p>
      )}
      <Button type="submit" disabled={pending || !email.trim()} className="min-h-12 text-[15px]">
        {t('account.addAdminButton')}
      </Button>
    </form>
  );
}
