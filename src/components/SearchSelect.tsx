'use client';

import { useId, useMemo, useRef, useState } from 'react';

import { Icon } from './Icon';
import { cx } from './ui';

export type SearchOption = {
  id: string;
  label: string; // what is shown (in the current language)
  hint?: string; // smaller text on the right, e.g. the province
  keywords?: string; // extra words that should find this option (other spellings, district…)
};

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

// Lower = better. null = not a match. Starts-with beats word-starts-with beats contains.
function rank(option: SearchOption, q: string): number | null {
  const label = normalise(option.label);
  if (label.startsWith(q)) return 0;
  if (label.split(/[\s(),-]+/).some((w) => w.startsWith(q))) return 1;
  if (label.includes(q)) return 2;
  const extra = normalise(`${option.keywords ?? ''} ${option.hint ?? ''}`);
  if (extra.includes(q)) return 3;
  return null;
}

// A search box with a pick-list under it (the ARIA "combobox" pattern): type to filter, arrow keys
// and Enter to choose, Escape to close. Shows the chosen option while it is closed.
export function SearchSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
  emptyText,
  rtl,
}: {
  label: string; // accessible name of the box (the visible heading is outside)
  options: SearchOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  emptyText: string; // "No match" message
  rtl?: boolean;
}) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const selected = options.find((o) => o.id === value);
  const matches = useMemo(() => {
    const q = normalise(query);
    if (!q) return options;
    return options
      .map((o, i) => ({ o, r: rank(o, q), i }))
      .filter((m): m is { o: SearchOption; r: number; i: number } => m.r !== null)
      .sort((a, b) => a.r - b.r || a.i - b.i)
      .map((m) => m.o);
  }, [options, query]);

  const choose = (o: SearchOption) => {
    onChange(o.id);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };
  const optionId = (i: number) => `${listId}-${i}`;
  const current = Math.min(active, Math.max(matches.length - 1, 0));

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return setOpen(true);
      const next = e.key === 'ArrowDown' ? current + 1 : current - 1;
      setActive((next + matches.length) % Math.max(matches.length, 1));
      requestAnimationFrame(() => document.getElementById(optionId((next + matches.length) % Math.max(matches.length, 1)))?.scrollIntoView({ block: 'nearest' }));
    } else if (e.key === 'Enter') {
      if (open && matches[current]) {
        e.preventDefault();
        choose(matches[current]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="relative">
      <Icon name="search" size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted" />
      <input
        ref={inputRef}
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && matches[current] ? optionId(current) : undefined}
        autoComplete="off"
        dir={rtl ? 'rtl' : 'ltr'}
        value={open ? query : (selected?.label ?? '')}
        placeholder={open ? (selected?.label ?? placeholder) : placeholder}
        onFocus={() => {
          setOpen(true);
          setActive(Math.max(0, options.findIndex((o) => o.id === value)));
        }}
        onBlur={() => {
          setOpen(false);
          setQuery('');
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        className="h-12 w-full rounded-2xl border-2 border-line bg-white ps-11 pe-4 text-[15px] font-semibold text-ink outline-none transition focus:border-green"
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 top-[calc(100%+6px)] z-20 max-h-64 overflow-y-auto rounded-2xl border border-line bg-white p-1.5 shadow-lg"
          onMouseDown={(e) => e.preventDefault()} // keep focus in the box so a tap picks instead of closing first
        >
          {matches.length === 0 && <li className="px-3 py-3 text-sm text-muted">{emptyText}</li>}
          {matches.map((o, i) => (
            <li
              key={o.id}
              id={optionId(i)}
              role="option"
              aria-selected={o.id === value}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(o)}
              className={cx(
                'flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[15px]',
                i === current && 'bg-mint',
                o.id === value ? 'font-bold text-deep' : 'font-medium text-ink',
              )}>
              <span className="truncate">{o.label}</span>
              {o.hint && <span className="shrink-0 text-xs text-muted">{o.hint}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
