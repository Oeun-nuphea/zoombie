const CACHE_NAME = 'zoombie-app-v1'
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames
        .filter((cacheName) => cacheName !== CACHE_NAME)
        .map((cacheName) => caches.delete(cacheName)),
    )).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  const url = new URL(request.url)

  if (url.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseClone))
          return response
        })
        .catch(async () => (
          await caches.match(request)
          || await caches.match('/index.html')
        )),
    )
    return
  }

  if (
    request.destination === 'script'
    || request.destination === 'style'
    || request.destination === 'worker'
    || request.destination === 'image'
    || request.destination === 'font'
    || request.destination === 'manifest'
    || url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const networkResponse = fetch(request)
          .then((response) => {
            if (response?.ok) {
              const responseClone = response.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
            }

            return response
          })
          .catch(() => cachedResponse)

        return cachedResponse || networkResponse
      }),
    )
  }
})
