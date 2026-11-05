// Service worker tối giản: cache mọi file cùng origin sau lần tải đầu (stale-while-revalidate).
const CACHE = 'xoifortune-v3'
self.addEventListener('install', (e) => { self.skipWaiting() })
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req)
      const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res }).catch(() => cached)
      return cached || net
    }),
  )
})
