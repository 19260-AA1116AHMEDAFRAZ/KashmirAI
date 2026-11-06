// Place photos live in public/places. A place's `image_key` names its photo.
// Places without a photo get a drawn illustration in these colours: [sky, far hills, near hills].
export const PHOTOS: Record<string, string> = {
  neelum: '/places/neelum.jpg',
  arangkel: '/places/arangkel.jpg',
  mzd: '/places/mzd.jpg',
  toli: '/places/toli.jpg',
};

export function photoFor(key: string | null): string | null {
  return key ? (PHOTOS[key] ?? null) : null;
}

export const ILLUSTRATIONS: Record<string, [string, string, string]> = {
  banjosa: ['#DCE8DF', '#6FA486', '#2E7D57'],
  rawalakot: ['#DCE8DF', '#9CC1A8', '#4F8F6C'],
};
export const DEFAULT_ILLUSTRATION: [string, string, string] = ['#DCE8DF', '#9CC1A8', '#4F8F6C'];
