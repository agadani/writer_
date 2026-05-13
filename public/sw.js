const CACHE = 'writer-v10';
const PRECACHE = ['/', '/index.html', '/manifest.json', '/icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Don't cache external API calls (Google, Dropbox, etc.)
  if (url.origin !== self.location.origin) return;

  // Don't cache the OAuth token endpoint
  if (url.pathname.startsWith('/api/')) return;

  // For page navigations: network-first with cache fallback
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(r => {
        const c = r.clone();
        caches.open(CACHE).then(ca => ca.put(e.request, c));
        return r;
      }).catch(() => caches.match('/') || caches.match('/index.html'))
    );
    return;
  }

  // For static assets: cache-first with network update
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(r => {
        caches.open(CACHE).then(ca => ca.put(e.request, r.clone()));
        return r;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
