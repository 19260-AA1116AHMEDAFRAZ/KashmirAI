/* KashmirAI service worker.
 *
 * What it caches, and what it deliberately does not:
 *   - Pages (HTML) and page data (RSC) are NEVER cached. Every page depends on who is signed in
 *     and which language they chose, so a cached copy could show one person's account to the next
 *     person on a shared phone, or a stale budget. Pages always come from the network; if the
 *     network is down, the offline page (/offline.html) is shown instead.
 *   - Hashed build files (/_next/static: JS, CSS, fonts) never change, so they are cache-first.
 *   - Place photos, optimised images and app icons are served from cache and refreshed in the
 *     background (stale-while-revalidate).
 *   - Everything else (Server Actions, POSTs, /auth, Supabase, other sites) passes straight through.
 *
 * Bump VERSION to drop all old caches on the next visit.
 */
const VERSION = 'v1';
const SHELL_CACHE = `kashmirai-shell-${VERSION}`;
const STATIC_CACHE = `kashmirai-static-${VERSION}`;
const MEDIA_CACHE = `kashmirai-media-${VERSION}`;
const KEEP = [SHELL_CACHE, STATIC_CACHE, MEDIA_CACHE];

const OFFLINE_URL = '/offline.html';
const SHELL = [OFFLINE_URL, '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];

// Keep caches from growing forever across deploys (oldest entries are removed first).
const LIMITS = { [STATIC_CACHE]: 250, [MEDIA_CACHE]: 120 };

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n.startsWith('kashmirai-') && !KEEP.includes(n)).map((n) => caches.delete(n)));
      // Start the page request while the worker boots, so pages are not slowed down by it.
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

async function trim(cacheName) {
  const max = LIMITS[cacheName];
  if (!max) return;
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

async function cacheFirst(event, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(event.request);
  if (hit) return hit;
  const response = await fetch(event.request);
  if (response.ok) {
    event.waitUntil(cache.put(event.request, response.clone()).then(() => trim(cacheName)));
  }
  return response;
}

async function staleWhileRevalidate(event, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(event.request);
  const refresh = fetch(event.request).then(async (response) => {
    if (response.ok) {
      await cache.put(event.request, response.clone());
      await trim(cacheName);
    }
    return response;
  });
  if (hit) {
    event.waitUntil(refresh.catch(() => undefined));
    return hit;
  }
  return refresh;
}

async function pageOrOffline(event) {
  try {
    const preloaded = await event.preloadResponse;
    if (preloaded) return preloaded;
    return await fetch(event.request);
  } catch {
    const offline = await caches.match(OFFLINE_URL);
    return offline || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // Server Actions, form posts: untouched

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Supabase, Google sign-in, etc.

  // Full page loads (typing the address, reload, opening the installed app).
  if (request.mode === 'navigate') {
    event.respondWith(pageOrOffline(event));
    return;
  }

  // In-app navigations fetch RSC data; never cache it (see top). Next.js retries these itself
  // when the connection comes back (experimental.useOffline in next.config.ts).
  if (request.headers.get('RSC') || url.searchParams.has('_rsc')) return;

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(event, STATIC_CACHE));
    return;
  }

  if (url.pathname.startsWith('/_next/image') || url.pathname.startsWith('/places/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(staleWhileRevalidate(event, MEDIA_CACHE));
  }
});
