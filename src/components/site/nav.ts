// The site's main sections, shared by the header, the phone tab bar and the footer.
// Kept out of the 'use client' files so Server Components (the footer) can use it too.
export const NAV = [
  { href: '/discover', key: 'discover' },
  { href: '/plan', key: 'plan' },
  { href: '/ask', key: 'ask' },
  { href: '/trips', key: 'trips' },
] as const;

// A place page belongs to Discover.
export const isActive = (path: string, href: string) => path === href || path.startsWith(href + '/') || (href === '/discover' && path.startsWith('/place/'));
