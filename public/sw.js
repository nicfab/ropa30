/*
 * ropa30 — sw.js (Service Worker)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Offline support for a local-first PWA. Precaches the app's static assets and
 * serves them cache-first, so ropa30 keeps working without a network. User data
 * lives in IndexedDB (Dexie) and is NOT handled here — the SW only caches assets.
 *
 * Cache is versioned: bump CACHE_NAME on every release to invalidate the old one.
 * Update model is simple (skipWaiting + clients.claim): the new SW takes over on
 * the next load, no prompt.
 */

const CACHE_NAME = 'ropa30-v1';

// Core assets to precache. Relative paths (scope-friendly: works at site root or
// in a subdirectory). Keep in sync with index.html and the module import graph.
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/ropa30.css',
  // App + modules
  './js/app.js',
  './js/db.js',
  './js/schema.js',
  './js/detail.js',
  './js/editor.js',
  './js/exporters/backup.js',
  './js/exporters/registro-common.js',
  './js/exporters/xlsx.js',
  './js/exporters/ods.js',
  './js/importers/restore.js',
  './js/importers/validate.js',
  // Vendored libraries
  './js/lib/alpine.min.js',
  './js/lib/dexie.min.js',
  './js/lib/xlsx.full.min.js',
  './js/lib/fflate.min.js',
  // Locales
  './locales/it.js',
  './locales/en.js',
  // Icons
  './icons/favicon.png',
  './icons/nicfab-logo.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png'
];

// Install: precache core assets, then activate immediately.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate: drop old caches, take control of open clients.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first for same-origin GET; network fallback (and cache it).
// Navigations fall back to the cached index.html (single-page app).
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // ignore cross-origin

  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cached) => cached || fetch(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Cache successful, basic (same-origin) responses for next time.
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
