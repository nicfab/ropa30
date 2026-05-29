/*
 * ropa30 — sw.js (Service Worker)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Offline support for a local-first PWA.
 *
 * Update model: NETWORK-FIRST for same-origin assets (app shell, JS, CSS,
 * modules). When online, the SW always fetches the latest file from the
 * network and refreshes the cache, so the user can never receive a mix of
 * new markup with stale logic. When offline, the SW falls back to the last
 * cached copy, so ropa30 keeps working without a network.
 *
 * User data lives in IndexedDB (Dexie) and is NOT handled here — the SW only
 * caches static assets.
 *
 * CACHE_NAME is still versioned as cache hygiene (old caches are dropped on
 * activate), but correctness of updates does NOT depend on bumping it: the
 * network-first strategy guarantees fresh files whenever the user is online.
 */

const CACHE_NAME = 'ropa30-v2';

// Core assets to precache for the first offline visit. Relative paths
// (scope-friendly: works at site root or in a subdirectory). Keep in sync
// with index.html and the module import graph.
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

// Install: precache core assets (for offline), then activate immediately.
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

// Fetch: NETWORK-FIRST for same-origin GET. On a successful network response
// we refresh the cache and return the fresh file. On network failure (offline)
// we fall back to the cached copy. Navigations fall back to the cached
// index.html (single-page app).
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // ignore cross-origin

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          }
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Refresh the cache with the latest same-origin asset.
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
