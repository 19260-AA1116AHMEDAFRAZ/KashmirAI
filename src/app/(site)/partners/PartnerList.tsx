'use client';

import { useState, useTransition } from 'react';

import { createPartnerRequest } from '@/app/actions';
import { Icon } from '@/components/Icon';
import { EstimatedNote } from '@/components/Notes';
import { Segmented } from '@/components/Segmented';
import { Button, cx } from '@/components/ui';
import type { Partner, PartnerKind, RequestStatus } from '@/data/types';
import { useT } from '@/i18n/provider';
import { formatRs, pickText } from '@/lib/format';
import { isFeatured } from '@/lib/partners';

const OPEN: RequestStatus[] = ['new', 'contacted'];

// The Stays / Guides / Jeeps tabs and partner cards with the "Request" button.
// canRequest = false in sample-data mode (no accounts): the button is only remembered on screen.
export function PartnerList({ partners, initialStatuses, canRequest }: { partners: Partner[]; initialStatuses: Record<string, RequestStatus>; canRequest: boolean }) {
  const { t } = useT();
  const [kind, setKind] = useState<PartnerKind>('stay');
  const [statuses, setStatuses] = useState<Record<string, RequestStatus | undefined>>(initialStatuses);
  const [sending, setSending] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const list = partners.filter((p) => p.kind === kind);

  const request = (id: string) => {
    const status = statuses[id];
    if (!canRequest) {
      setStatuses((s) => ({ ...s, [id]: status ? undefined : 'new' }));
      return;
    }
    if (sending || (status && OPEN.includes(status))) return; // already asked: an admin will follow up
    setSending(id);
    setFailed(null);
    startTransition(async () => {
      const result = await createPartnerRequest(id);
      if (result.ok) setStatuses((s) => ({ ...s, [id]: result.status }));
      else setFailed(id);
      setSending(null);
    });
  };

  return (
    <>
      <div className="mb-5 max-w-md">
        <Segmented<PartnerKind>
          value={kind}
          onChange={setKind}
          options={[
            { id: 'stay', label: t('partners.tabs.stay') },
            { id: 'guide', label: t('partners.tabs.guide') },
            { id: 'jeep', label: t('partners.tabs.jeep') },
          ]}
        />
      </div>
      {list.length === 0 && <p className="py-10 text-center text-muted">{t('partners.empty')}</p>}
      <div className="grid items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <PartnerCard key={p.id} partner={p} status={statuses[p.id] ?? null} sending={sending === p.id} failed={failed === p.id} showNote={canRequest} onRequest={() => request(p.id)} />
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-muted">{t('partners.footer')}</p>
    </>
  );
}

function PartnerCard({
  partner: p,
  status,
  sending,
  failed,
  showNote,
  onRequest,
}: {
  partner: Partner;
  status: RequestStatus | null;
  sending: boolean;
  failed: boolean;
  showNote: boolean;
  onRequest: () => void;
}) {
  const { t, lang } = useT();
  const name = pickText(p.name, lang);
  const featured = isFeatured(p);
  // Open requests show their progress; after done / cancelled the traveller can ask again.
  const open = status === 'new' || status === 'contacted';
  const title = sending ? t('auth.working') : status === 'contacted' ? t('partners.inProgress') : open ? t('partners.requested') : t('partners.request');

  return (
    <article className={cx('flex flex-col gap-3 rounded-3xl bg-white p-5 transition hover:shadow-md', featured ? 'border-2 border-gold' : 'border border-line')}>
      <div className="flex items-start gap-3">
        <span className={cx('flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] text-xl font-extrabold', featured ? 'bg-deep text-white' : 'bg-mint text-deep')}>{name.charAt(0)}</span>
        <div className="flex flex-1 flex-col gap-1">
          {featured && <span className="self-start rounded-md bg-gold-soft px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-gold-dark uppercase">{t('partners.featured')}</span>}
          <h2 className="font-bold">{name}</h2>
          <p className="text-[13px] text-muted">{pickText(p.description, lang)}</p>
          {/* Only say "Verified" when the record really is verified */}
          <p className={cx('flex items-center gap-1 text-xs font-bold', p.verified ? 'text-green' : 'text-muted')}>
            <Icon name={p.verified ? 'shieldok' : 'shield'} size={16} strokeWidth={2.2} className="text-current" />
            {p.verified ? t('partners.verified') : t('partners.notVerified')}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
        <div className="flex flex-1 flex-col">
          {p.price_pkr != null ? (
            <>
              <span className="text-[17px] font-extrabold">{formatRs(p.price_pkr, lang)}</span>
              <span className="text-xs text-muted">{p.price_unit === 'night' ? t('common.perNight') : t('common.perDay')}</span>
            </>
          ) : (
            <span className="text-sm font-bold">{t('common.priceOnRequest')}</span>
          )}
          <EstimatedNote lastChecked={p.last_checked} />
        </div>
        <Button variant={open ? 'soft' : 'primary'} onClick={onRequest} disabled={sending} aria-live="polite" className="min-h-[46px] rounded-[14px] px-5 text-sm">
          {title}
        </Button>
      </div>
      {((open && showNote) || failed) && (
        <p role="status" className={cx('text-xs', failed ? 'text-clay' : 'text-muted')}>
          {failed ? t('partners.requestFailed') : status === 'contacted' ? t('partners.contactedNote') : t('partners.requestedNote')}
        </p>
      )}
    </article>
  );
}
