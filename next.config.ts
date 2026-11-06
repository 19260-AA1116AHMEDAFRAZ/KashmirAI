import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: lets a phone on the same Wi-Fi open the dev server by the PC's network address
  // (e.g. http://172.25.20.75:3000). Without this, `next dev` refuses its scripts to any address
  // except localhost, so the page shows but nothing can be tapped. Private network ranges only.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Every KashmirAI page is rendered per visitor (language cookie + sign-in, see app/layout.tsx),
    // so only check "instant navigation" on pages that opt in with `export const instant = true`.
    instantInsights: { validationLevel: "manual-warning" },
    // PWA: when the connection drops, page changes and Server Actions wait and retry once it's
    // back instead of failing. Also powers the `useOffline` hook (components/Pwa.tsx).
    useOffline: true,
  },
  async headers() {
    return [
      {
        // The service worker must never be served from a cache, or updates to it would be missed.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
