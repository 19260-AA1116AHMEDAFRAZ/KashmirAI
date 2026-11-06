'use client';

import { useRef, useState, type FormEvent } from 'react';

import { Icon, Spark } from '@/components/Icon';
import { Segmented } from '@/components/Segmented';
import { Container } from '@/components/site/Container';
import { cx } from '@/components/ui';
import type { Lang } from '@/data/types';
import { makeT, tList } from '@/i18n/config';
import { useT } from '@/i18n/provider';

type Message = { id: number; me: boolean; lang: Lang; text: string };

// Ask KashmirAI: a chat window. For now replies are a fixed "preview" message (as in the mobile
// app); live answers from checked local data come in a later phase.
export default function AskPage() {
  const { t, lang: appLang } = useT();
  // The reply language can differ from the site language.
  const [chatLang, setChatLang] = useState<Lang>(appLang);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const tc = makeT(chatLang);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { id: Date.now(), me: true, lang: chatLang, text: q }, { id: Date.now() + 1, me: false, lang: chatLang, text: tc('ask.previewReply') }]);
    setDraft('');
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }));
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
  };

  // The greeting is always first, in the current chat language.
  const shown: Message[] = [{ id: 0, me: false, lang: chatLang, text: tc('ask.greeting') }, ...messages];

  return (
    <Container narrow className="py-6 sm:py-10">
      <div className="flex h-[calc(100dvh-12rem)] min-h-[520px] flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
        <header className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-deep">
              <Spark />
            </span>
            <div>
              <h1 className="text-xl font-extrabold">{t('ask.title')}</h1>
              <p className="text-sm font-semibold text-green">{t('ask.subtitle')}</p>
            </div>
          </div>
          <div className="sm:w-72">
            <Segmented<Lang>
              value={chatLang}
              onChange={setChatLang}
              size="sm"
              options={[
                { id: 'en', label: 'English', latin: true },
                { id: 'ur', label: 'اردو', urdu: true },
                { id: 'roman', label: 'Roman Urdu', latin: true },
              ]}
            />
          </div>
        </header>

        <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto bg-bg p-5" aria-live="polite">
          <p className="text-center text-xs font-semibold text-muted">{t('ask.today')}</p>
          {shown.map((m) => (
            <p
              key={m.id}
              lang={m.lang}
              dir={m.lang === 'ur' ? 'rtl' : 'ltr'}
              className={cx(
                'max-w-[80%] rounded-2xl px-4 py-3 text-[15px]',
                m.lang === 'ur' && 'font-urdu leading-loose',
                m.me ? 'self-end rounded-ee-md bg-deep text-white' : 'self-start rounded-es-md border border-line bg-white',
              )}>
              {m.text}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-line p-4">
          <div className="flex gap-2 overflow-x-auto">
            {tList(chatLang, 'ask.prompts').map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => send(p)}
                lang={chatLang}
                className={cx('h-9 shrink-0 rounded-full border border-line bg-white px-4 text-[13px] font-semibold hover:border-deep', chatLang === 'ur' && 'font-urdu')}>
                {p}
              </button>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex items-center gap-2.5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={tc('ask.placeholder')}
              aria-label={t('ask.message')}
              lang={chatLang}
              dir={chatLang === 'ur' ? 'rtl' : 'ltr'}
              className={cx('h-12 flex-1 rounded-full border border-line bg-bg px-5 text-[15px] outline-none focus:border-green', chatLang === 'ur' && 'font-urdu')}
            />
            <button type="submit" aria-label={t('ask.send')} className="flex h-12 w-12 items-center justify-center rounded-full bg-deep hover:opacity-90">
              <Icon name="send" size={20} className="text-white" />
            </button>
          </form>
        </div>
      </div>
    </Container>
  );
}
