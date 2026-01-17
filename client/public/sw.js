// Service Worker for RoV SN Tournament PWA
// IMPORTANT: Change version when deploying updates to invalidate old cache
const CACHE_VERSION = 'v3';
const CACHE_NAME = `rov-sn-${CACHE_VERSION}`;

// Files to cache for offline use (minimal - let Vite handle hashed assets)
const urlsToCache = [
    '/',
    '/manifest.json',
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
    console.log(`🚀 PWA: Installing ${CACHE_NAME}`);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 PWA: Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // Force activation
    );
});

// Activate event - clean up ALL old caches aggressively
self.addEventListener('activate', (event) => {
    console.log(`✅ PWA: Activating ${CACHE_NAME}`);
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName.startsWith('rov-sn-') && cacheName !== CACHE_NAME)
                    .map((cacheName) => {
                        console.log(`🗑️ PWA: Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    })
            );
        }).then(() => {
            console.log('🎯 PWA: Claiming clients');
            return self.clients.claim(); // Take control immediately
        })
    );
});

// Fetch event - Network First strategy for HTML, Cache First for assets
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip non-http/https requests (e.g., chrome-extension://)
    if (!url.protocol.startsWith('http')) return;

    // Skip API requests (always fetch fresh)
    if (url.pathname.includes('/api/')) return;

    // For HTML pages - Network First (get fresh, fallback to cache)
    if (event.request.mode === 'navigate' ||
        event.request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Clone and cache the fresh response
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    // Offline - return cached version
                    return caches.match(event.request) || caches.match('/');
                })
        );
        return;
    }

    // For assets (JS/CSS with hash) - Network First with Cache Fallback
    // This prevents issues when hashed file names change after deploy
    if (url.pathname.match(/\.(js|css)$/) && url.pathname.includes('-')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (!response || response.status !== 200) {
                        // If network fails, try cache as fallback
                        return caches.match(event.request) || response;
                    }
                    // Cache the fresh response
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    // Network failed - try cache
                    return caches.match(event.request);
                })
        );
        return;
    }

    // For other assets - Stale While Revalidate
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});

// Listen for messages to skip waiting
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
