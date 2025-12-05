// Service Worker for Todone PWA
// Supports offline functionality and caching strategies

const CACHE_NAME = 'todone-v1'
const RUNTIME_CACHE = 'todone-runtime-v1'
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE)
    }).then(() => {
      return self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // Network first strategy for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const cache = caches.open(RUNTIME_CACHE)
            cache.then((c) => c.put(request, response.clone()))
          }
          return response
        })
        .catch(() => {
          // Fallback to cache on network error
          return caches.match(request)
            .then((response) => {
              return response || new Response('Offline - data not available', {
                status: 503,
                statusText: 'Service Unavailable',
              })
            })
        })
    )
    return
  }

  // Cache first strategy for assets (JS, CSS, images)
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request)
            .then((fetchResponse) => {
              // Cache successful asset responses
              if (fetchResponse.status === 200) {
                const cache = caches.open(RUNTIME_CACHE)
                cache.then((c) => c.put(request, fetchResponse.clone()))
              }
              return fetchResponse
            })
            .catch(() => {
              // Return offline placeholder
              if (request.destination === 'image') {
                return new Response(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">' +
                  '<rect fill="#f0f0f0" width="100" height="100"/>' +
                  '<text x="50" y="50" text-anchor="middle" dy=".3em" fill="#999">Offline</text>' +
                  '</svg>',
                  { headers: { 'Content-Type': 'image/svg+xml' } }
                )
              }
              return new Response('Resource not available offline', {
                status: 503,
                statusText: 'Service Unavailable',
              })
            })
        })
    )
    return
  }

  // Default: Network first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const cache = caches.open(RUNTIME_CACHE)
          cache.then((c) => c.put(request, response.clone()))
        }
        return response
      })
      .catch(() => {
        return caches.match(request)
          .then((response) => {
            return response || new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
            })
          })
      })
  )
})

// Background sync for offline operations (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(
      // Handle syncing pending operations
      Promise.resolve()
    )
  }
})

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/manifest.json',
      badge: '/manifest.json',
    }
    event.waitUntil(
      self.registration.showNotification('Todone', options)
    )
  }
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a window/tab is already open with the app, focus it
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})
