import Image from 'next/image';

import { DEFAULT_ILLUSTRATION, ILLUSTRATIONS, photoFor } from '@/data/images';
import type { Place } from '@/data/types';

// 96x96 picture for a place card: the photo, or a drawn hills illustration.
export function PlaceThumb({ place, label, size = 96 }: { place: Place; label: string; size?: number }) {
  const photo = photoFor(place.image_key);
  if (photo) return <Image src={photo} alt={label} width={size} height={size} className="shrink-0 rounded-xl object-cover" style={{ width: size, height: size }} />;
  const [sky, far, near] = ILLUSTRATIONS[place.id] ?? DEFAULT_ILLUSTRATION;
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} role="img" aria-label={label} className="shrink-0 rounded-xl">
      <rect width="96" height="96" fill={sky} rx="12" />
      <circle cx="72" cy="26" r="11" fill="#F2D98A" />
      <path d="M0 64 L26 34 L44 54 L62 30 L96 66 L96 84 Q96 96 84 96 L12 96 Q0 96 0 84 Z" fill={far} />
      <path d="M0 78 L30 60 L58 80 L96 70 L96 84 Q96 96 84 96 L12 96 Q0 96 0 84 Z" fill={near} />
    </svg>
  );
}

// Full-width picture at the top of a place page. Fills its (relative) parent.
// `sizes` = how wide it shows on screen (default: a card in the 3-column grid).
export function PlaceHero({ place, label, preload, sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw' }: { place: Place; label: string; preload?: boolean; sizes?: string }) {
  const photo = photoFor(place.image_key);
  if (photo) return <Image src={photo} alt={label} fill preload={preload} sizes={sizes} className="object-cover transition duration-500 group-hover:scale-105" />;
  const [sky, far, near] = ILLUSTRATIONS[place.id] ?? DEFAULT_ILLUSTRATION;
  return (
    <svg viewBox="0 0 96 64" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label} className="absolute inset-0 h-full w-full">
      <rect width="96" height="64" fill={sky} />
      <circle cx="74" cy="18" r="7" fill="#F2D98A" />
      <path d="M0 42 L26 20 L44 34 L62 16 L96 44 L96 64 L0 64 Z" fill={far} />
      <path d="M0 52 L30 40 L58 54 L96 46 L96 64 L0 64 Z" fill={near} />
    </svg>
  );
}
