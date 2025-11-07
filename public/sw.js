self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    if (self.registration.navigationPreload) {
      await self.registration.navigationPreload.enable();
    }
    await clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        return await fetch(event.request);
      } catch (err) {
        return new Response('Offline', { status: 200, headers: { 'Content-Type': 'text/plain' } });
      }
    })()
  );
});