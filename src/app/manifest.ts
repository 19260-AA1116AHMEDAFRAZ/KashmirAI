import type { MetadataRoute } from 'next';

// Web app manifest (served at /manifest.webmanifest): lets phones and desktops install KashmirAI
// as an app with its own icon and window. Colours are the theme tokens from globals.css.
// start_url "/" goes through proxy.ts, which sends each visitor to the right first screen
// (language → sign-in → Discover).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'KashmirAI',
    short_name: 'KashmirAI',
    description: 'Plan trips across Azad Kashmir, see budgets in rupees and get local answers in English, Urdu or Roman Urdu.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F4F2EC',
    theme_color: '#15503C',
    categories: ['travel'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
