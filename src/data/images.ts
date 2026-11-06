// Place photos live in public/places. A place's `image_key` names its photo.
// Places without a photo get a drawn illustration in these colours: [sky, far hills, near hills].
export const PHOTOS: Record<string, string> = {
  neelum: '/places/neelum.jpg',
  arangkel: '/places/arangkel.jpg',
  mzd: '/places/mzd.jpg',
  toli: '/places/toli.jpg',
  banjosa: '/places/banjosa.jpg',
  rawalakot: '/places/rawalakot.jpg',
};

// Pictures made by Gemini's image model, not photographs. They are shown with an "AI illustration"
// label. Replace the file in public/places/ with a real photo (and remove its key here) when you have one.
export const AI_IMAGES: ReadonlySet<string> = new Set(['banjosa', 'rawalakot']);

// A place whose database row has no photo chosen still gets the picture made for its id.
const PHOTO_OF_PLACE: Record<string, string> = { neelum: 'neelum', kel: 'arangkel', muzaffarabad: 'mzd', toli: 'toli', banjosa: 'banjosa', rawalakot: 'rawalakot' };

// The key (into PHOTOS) of the picture to show for a place, or null for the drawn illustration.
export function imageKeyFor(place: { id: string; image_key: string | null }): string | null {
  if (place.image_key && place.image_key in PHOTOS) return place.image_key;
  return PHOTO_OF_PLACE[place.id] ?? null;
}

export function photoFor(key: string | null): string | null {
  return key ? (PHOTOS[key] ?? null) : null;
}

export const ILLUSTRATIONS: Record<string, [string, string, string]> = {
  banjosa: ['#DCE8DF', '#6FA486', '#2E7D57'],
  rawalakot: ['#DCE8DF', '#9CC1A8', '#4F8F6C'],
};
export const DEFAULT_ILLUSTRATION: [string, string, string] = ['#DCE8DF', '#9CC1A8', '#4F8F6C'];
