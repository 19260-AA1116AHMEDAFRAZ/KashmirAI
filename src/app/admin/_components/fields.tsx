'use client';

import { useState, useTransition, type ComponentProps, type ReactNode } from 'react';

import { Icon } from '@/components/Icon';
import { cx } from '@/components/ui';
import type { AdminResult, I18nDraft } from '@/lib/admin/drafts';

// Form building blocks for the admin dashboard.

const control = 'w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-green disabled:bg-seg';

export function Field({ label, hint, htmlFor, children, className }: { label: string; hint?: string; htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-xs font-bold text-muted">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function TextInput({ className, ...props }: ComponentProps<'input'>) {
  return <input {...props} className={cx(control, 'h-11', className)} />;
}

export function TextArea({ className, rows = 3, ...props }: ComponentProps<'textarea'>) {
  return <textarea rows={rows} {...props} className={cx(control, 'py-2.5 leading-relaxed', className)} />;
}

export function Select({ className, options, ...props }: Omit<ComponentProps<'select'>, 'children'> & { options: { value: string; label: string }[] }) {
  return (
    <select {...props} className={cx(control, 'h-11 pe-8', className)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Check({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4.5 w-4.5 accent-[var(--color-green)]" />
      <span className="flex flex-col">
        <span className="text-sm font-semibold">{label}</span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

// One piece of text in the three site languages. English is the fallback, so it's the one that matters.
export function I18nField({
  label,
  value,
  onChange,
  required,
  multiline,
  hint,
}: {
  label: string;
  value: I18nDraft;
  onChange: (v: I18nDraft) => void;
  required?: boolean;
  multiline?: boolean;
  hint?: string;
}) {
  const set = (k: keyof I18nDraft) => (e: { target: { value: string } }) => onChange({ ...value, [k]: e.target.value });
  const Input = multiline ? TextArea : TextInput;
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-xs font-bold text-muted">
        {label}
        {required && <span className="text-clay"> *</span>}
      </legend>
      <div className="grid gap-2 md:grid-cols-3">
        <Input aria-label={`${label} (English)`} placeholder="English" value={value.en} onChange={set('en')} required={required} />
        <Input aria-label={`${label} (Urdu)`} placeholder="اردو" dir="rtl" lang="ur" value={value.ur} onChange={set('ur')} className="font-urdu" />
        <Input aria-label={`${label} (Roman Urdu)`} placeholder="Roman Urdu" value={value.roman} onChange={set('roman')} />
      </div>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </fieldset>
  );
}

export function Section({ title, description, children, actions }: { title: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="text-base font-extrabold">{title}</h2>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Notice({ kind, children }: { kind: 'error' | 'ok'; children: ReactNode }) {
  const error = kind === 'error';
  return (
    <p role={error ? 'alert' : 'status'} className={cx('flex items-center gap-2 rounded-xl border p-3 text-sm', error ? 'border-warn-border bg-warn-bg text-warn-text' : 'border-green bg-mint text-deep')}>
      <Icon name={error ? 'alert' : 'check'} size={18} className={error ? 'text-warn-title' : 'text-deep'} />
      <span className="flex-1">{children}</span>
    </p>
  );
}

type ButtonKind = 'primary' | 'outline' | 'danger' | 'quiet';
const BUTTONS: Record<ButtonKind, string> = {
  primary: 'border-deep bg-deep text-white hover:bg-green hover:border-green',
  outline: 'border-line bg-white text-deep hover:border-deep',
  danger: 'border-clay bg-white text-clay hover:bg-warn-bg',
  quiet: 'border-transparent bg-transparent text-muted hover:bg-seg hover:text-ink',
};

export function AdminButton({ kind = 'primary', className, ...props }: ComponentProps<'button'> & { kind?: ButtonKind }) {
  return (
    <button
      type="button"
      {...props}
      className={cx('inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border px-4 text-sm font-bold transition disabled:opacity-50', BUTTONS[kind], className)}
    />
  );
}

// Runs a server action and keeps track of "saving…", the error and the success message.
export function useAdminAction() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  const run = (action: () => Promise<AdminResult>, { success, then }: { success?: string; then?: (r: AdminResult & { ok: true }) => void } = {}) => {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setMessage({ kind: 'error', text: result.error });
        return;
      }
      if (success) setMessage({ kind: 'ok', text: success });
      then?.(result);
    });
  };
  return { pending, message, setMessage, run };
}

// Sticky bar at the bottom of a long form.
export function SaveBar({ pending, message, label = 'Save changes', children }: { pending: boolean; message: { kind: 'error' | 'ok'; text: string } | null; label?: string; children?: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      {message && <Notice kind={message.kind}>{message.text}</Notice>}
      <div className="flex flex-wrap items-center gap-2">
        <AdminButton type="submit" disabled={pending} className="min-w-36">
          {pending ? 'Saving…' : label}
        </AdminButton>
        {children}
      </div>
    </div>
  );
}

// A button that asks once more before doing something hard to undo.
export function ConfirmButton({ label, confirm, onConfirm, disabled, kind = 'danger' }: { label: string; confirm: string; onConfirm: () => void; disabled?: boolean; kind?: ButtonKind }) {
  const [asking, setAsking] = useState(false);
  if (!asking)
    return (
      <AdminButton kind={kind} onClick={() => setAsking(true)} disabled={disabled}>
        {label}
      </AdminButton>
    );
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-clay">{confirm}</span>
      <AdminButton
        kind="danger"
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
        disabled={disabled}>
        Yes
      </AdminButton>
      <AdminButton kind="quiet" onClick={() => setAsking(false)}>
        No
      </AdminButton>
    </span>
  );
}
