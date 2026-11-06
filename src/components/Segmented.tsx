'use client';

import { cx } from './ui';

// Segmented control (.seg): equal-width options on a grey track.
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: {
  options: { id: T; label: string; latin?: boolean; urdu?: boolean }[];
  value: T;
  onChange: (id: T) => void;
  size?: 'sm' | 'md';
}) {
  return (
    <div role="tablist" className="flex gap-1 rounded-[14px] bg-seg p-1">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.id)}
            className={cx(
              'flex-1 truncate rounded-[10px] px-2 font-bold',
              size === 'sm' ? 'h-9 text-[13px]' : 'h-10 text-sm',
              on ? 'bg-white text-deep shadow-sm' : 'text-muted',
              o.latin && 'latin',
              o.urdu && 'font-urdu',
            )}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
