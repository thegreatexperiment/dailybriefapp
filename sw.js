// Service worker — shell only, all network requests pass through untouched
const CACHE = 'daily-brief-v3';
const BASE = self.location.pathname.replace(/\/sw\.js$/, '');

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled([
        c.add(BASE + '/index.html'),
        c.add(BASE + '/manifest.json')
      ])
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Pass ALL fetch requests straight to the network — no interception
  // This avoids any service worker interference with API calls or external resources
  e.respondWith(fetch(e.request).catch(() => {
    // Only fall back to cache for navigation (so the app shell loads offline)
    if (e.request.mode === 'navigate') {
      return caches.match(BASE + '/index.html');
    }
  }));
});
