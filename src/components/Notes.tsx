'use client';

import { useT } from '@/i18n/provider';
import { formatDate } from '@/lib/format';
import { supabaseConfigured } from '@/lib/supabase/config';
import { Icon } from './Icon';

// The "Estimated, check locally" line shown next to any price, road status or partner,
// with when the data was last checked (or that it never was).
// `ai`: the estimate came from Gemini, so it has no "last checked" date.
export function EstimatedNote({ lastChecked, sample, ai, className = 'text-muted' }: { lastChecked: string | null; sample?: boolean; ai?: boolean; className?: string }) {
  const { t, lang } = useT();
  const checked = lastChecked ? t('common.lastChecked', { date: formatDate(lastChecked, lang) }) : t('common.notChecked');
  const parts = ai ? [t('planner.aiEstimate')] : [t('common.estimated'), checked];
  if (sample) parts.push(t('common.sample'));
  return (
    <p className={`flex items-center gap-1.5 text-xs ${className}`}>
      <Icon name="info" size={14} className="text-current" />
      <span>{parts.join(' · ')}</span>
    </p>
  );
}

// Small notice while the site has no Supabase project connected.
export function SampleDataNotice() {
  const { t } = useT();
  if (supabaseConfigured) return null;
  return (
    <p className="flex items-center gap-2 rounded-xl bg-gold-soft p-2.5 text-xs text-gold-dark">
      <Icon name="info" size={16} className="text-gold-dark" />
      <span className="flex-1">{t('common.sampleMode')}</span>
    </p>
  );
}

// Error / info banner used by forms.
export function Banner({ kind, children }: { kind: 'error' | 'info'; children: React.ReactNode }) {
  const error = kind === 'error';
  return (
    <div role={error ? 'alert' : 'status'} className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${error ? 'border-warn-border bg-warn-bg text-warn-text' : 'border-green bg-mint text-deep'}`}>
      <Icon name={error ? 'alert' : 'info'} size={18} className={error ? 'text-warn-title' : 'text-deep'} />
      <span className="flex-1">{children}</span>
    </div>
  );
}
