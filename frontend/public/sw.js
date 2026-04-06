const CACHE_NAME = 'eduai-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon_final.png'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

  // Fetch — network-first with cache fallback
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET, API requests, and non-http schemes (e.g. chrome-extension)
  if (
    event.request.method !== 'GET' || 
    url.pathname.includes('/api/') ||
    !['http:', 'https:'].includes(url.protocol)
  ) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        return cachedResponse || new Response("Network error", { status: 408, statusText: "Network Error" });
      })
  );
});
