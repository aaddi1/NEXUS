/* =========================================================
   NEXUS — SERVICE WORKER & OFFLINE CACHE
   ========================================================= */

const CACHE_NAME = 'nexus-app-v1.0.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/css/style.css',
  '/js/auth.js',
  '/js/api.js',
  '/js/app.js',
  '/js/failsafe.js',
  '/js/live-data.js',
  '/js/live-products.js',
  '/js/live-inventory.js',
  '/js/live-orders.js',
  '/js/live-invoices.js',
  '/js/live-deals.js',
  '/js/password-toggle.js',
  '/js/converter-guard.js',
  '/js/legal.js',
  '/js/invoices-backend.js',
  '/js/deals-backend.js',
  '/js/live-dashboard.js',
  '/js/live-analytics.js',
  '/js/demand-intelligence.js',
  '/js/orders-backend.js',
  '/js/forecast.js',
  '/js/help-complaints.js',
  '/js/super-admin.js',
  '/js/three-bg.js',
  '/js/pwa.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('NEXUS Service Worker partial asset caching:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Do not cache API endpoints to ensure real-time PostgreSQL data freshness
  if (event.request.url.includes(':5000') || event.request.url.includes(':8000') || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Fallback
        return caches.match('/index.html');
      });
    })
  );
});
