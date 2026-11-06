# KashmirAI Web

The website version of the KashmirAI travel app (the mobile app is in `../KashmirAI`).
Next.js 16 (App Router) + TypeScript + Tailwind CSS, using the **same Supabase project** as the
mobile app, so accounts, admins and partner requests are shared between web and mobile.

The design spec is [docs/KashmirAI-Prototype.html](docs/KashmirAI-Prototype.html).

## Run it

```
npm install
npm run dev        # http://localhost:3000
```

Settings live in `.env.local` (copy `.env.example`): the Supabase **Project URL** and
**Publishable key**. Without them the site runs on built-in sample data and skips sign-in.
Never put the secret / service_role key there.

Checks before calling something done:

```
npx tsc --noEmit   # TypeScript
npm run lint       # ESLint
npm run build      # production build
```

## One-time Supabase setup for the website

Everything in the mobile app's README (tables, `grant_admin`, `partner_requests` migrations) applies.
The website additionally needs its address allowed for sign-in redirects:

Supabase dashboard → Authentication → URL Configuration → **Redirect URLs** → add
`http://localhost:3000/**` (and your real website address followed by `/**` once it's online).

## What's where

| Path | What it does |
|---|---|
| `src/proxy.ts` | Runs before every page (Next 16 "proxy", formerly middleware): refreshes the Supabase session, sends first-time visitors to `/welcome`, signed-out visitors to `/sign-in`. |
| `src/app/welcome` | Language choice (English, Urdu, Roman Urdu). Saved in a cookie so the server renders the right language and right-to-left layout. |
| `src/app/sign-in` | Email + password sign-in / create account, and Continue with Google. |
| `src/app/auth/callback` | Google and email-confirmation links come back here; swaps the one-time code for a session. |
| `src/app/(tabs)` | Discover, Plan, Ask, My trips, with the bottom tab bar. |
| `src/app/place/[id]`, `trip`, `partners` | Place details, trip & budget (plan in the address, so it can be shared), partners with **Request**. |
| `src/app/account` | Profile, role, language, sign out; **Admin tools** for admins (make admins, partner requests). |
| `src/app/admin` | Admin-only pages. `admin/layout.tsx` checks the role on the server for every request. |
| `src/app/actions.ts` | Server Actions: every change (language, sign out, make admin, send request, change request status). |
| `src/lib/data.ts` | All database reads, run as the signed-in visitor (row-level security decides what comes back). |
| `src/i18n` | Translations (`locales/` are shared with the mobile app) and the language helpers. |
| `src/data` | Types and the built-in sample data (shared with the mobile app). |

## Installable app (PWA)

The site can be installed on phones and desktops ("Add to Home Screen" / the install icon in the address bar).

| Path | What it does |
|---|---|
| `src/app/manifest.ts` | App name, colours, icons, start page (served at `/manifest.webmanifest`). |
| `public/sw.js` | Service worker. Caches build files, fonts and photos only; **pages are never cached** because they depend on the signed-in user and language. With no internet it shows `public/offline.html`. Bump `VERSION` to clear old caches. |
| `src/components/Pwa.tsx` | Registers the service worker (production only) and shows the "You're offline" notice. |
| `public/icons/` | App icons (spark on deep green). |

Installing needs HTTPS (or `localhost`). The service worker is only active after `npm run build && npm start`;
in `npm run dev` it is switched off so it doesn't interfere with hot reload.

## Security

- The browser only has the public (publishable) key. What anyone can read or change is decided by the
  database's row-level security rules, the same ones the mobile app relies on.
- Admin pages are checked on the server (`src/app/admin/layout.tsx`) and again by the database for
  every read and change.
- Every page is rendered per visitor (language cookie + session), so `app/layout.tsx` sets
  `instant = false` for Next 16's Cache Components.
