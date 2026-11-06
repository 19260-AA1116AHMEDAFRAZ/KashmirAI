import type { ComponentProps } from 'react';

import { Label } from './ui';

// Labelled text box, styled like the search card on Discover.
// `latin` keeps emails and passwords left-to-right in Urdu pages.
export function TextField({ label, latin, id, ...input }: ComponentProps<'input'> & { label: string; latin?: boolean; id: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id}>
        <Label>{label}</Label>
      </label>
      <input
        id={id}
        {...input}
        className={`h-[52px] rounded-2xl border border-line bg-white px-4 text-[15px] text-ink outline-none focus:border-green ${latin ? 'latin text-left' : ''}`}
      />
    </div>
  );
}
