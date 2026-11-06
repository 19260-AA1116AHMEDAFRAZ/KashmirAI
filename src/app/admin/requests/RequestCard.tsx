'use client';

import { useState, useTransition } from 'react';

import { updateRequestStatus } from '@/app/actions';
import { Icon } from '@/components/Icon';
import { Button, Card, Tag } from '@/components/ui';
import type { PartnerRequest, RequestStatus } from '@/data/types';
import { useT } from '@/i18n/provider';
import { formatWhen, pickText } from '@/lib/format';

const STATUS_STYLES: Record<RequestStatus, string> = {
  new: 'bg-gold-soft text-gold-dark',
  contacted: 'bg-mint text-deep',
  done: 'bg-seg text-muted',
  cancelled: 'bg-warn-bg text-warn-title',
};

// What an admin can do next from each status.
const NEXT: Record<RequestStatus, RequestStatus[]> = {
  new: ['contacted', 'cancelled'],
  contacted: ['done', 'cancelled'],
  done: ['new'],
  cancelled: ['new'],
};

export function RequestCard({ request: r, placeName }: { request: PartnerRequest; placeName: string }) {
  const { t, lang } = useT();
  // Shown straight away; the server action also refreshes the list.
  const [status, setStatus] = useState(r.status);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  const change = (next: RequestStatus) => {
    setFailed(false);
    startTransition(async () => {
      const result = await updateRequestStatus(r.id, next);
      if (result.ok) setStatus(next);
      else setFailed(true);
    });
  };

  return (
    <Card className="flex flex-col gap-2.5 p-4">
      <div className="flex items-start gap-2.5">
        <div className="flex flex-1 flex-col gap-0.5">
          <h2 className="font-bold">{r.partner ? pickText(r.partner.name, lang) : t('requests.partnerRemoved')}</h2>
          <p className="text-[13px] text-muted">{[r.partner ? t(`partners.tabs.${r.partner.kind}`) : null, placeName].filter(Boolean).join(' · ')}</p>
        </div>
        <Tag className={STATUS_STYLES[status]}>{t(`requests.status.${status}`)}</Tag>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold">{r.requester_name || t('account.traveller')}</span>
        {r.requester_email && (
          <a href={`mailto:${r.requester_email}`} className="latin self-start text-[13px] text-deep underline-offset-2 hover:underline">
            {r.requester_email}
          </a>
        )}
        <span className="text-xs text-muted">{t('requests.sentAt', { when: formatWhen(r.created_at, lang) })}</span>
      </div>

      {r.note && <p className="rounded-[10px] bg-bg p-2.5 text-[13px]">{r.note}</p>}

      {r.partner?.phone && (
        <a href={`tel:${r.partner.phone}`} className="latin inline-flex items-center gap-1.5 self-start text-[13px] font-bold text-deep">
          <Icon name="phone" size={16} className="text-deep" />
          {r.partner.phone}
        </a>
      )}

      {failed && <p className="text-xs text-clay">{t('requests.updateFailed')}</p>}
      <div className="flex gap-2">
        {NEXT[status].map((next) => (
          <Button key={next} variant={next === 'cancelled' ? 'outline' : 'primary'} onClick={() => change(next)} disabled={pending} className="min-h-[42px] flex-1 rounded-xl px-2.5 text-[13px]">
            {t(`requests.actions.${next}`)}
          </Button>
        ))}
      </div>
    </Card>
  );
}
