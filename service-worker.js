// ============================================
// SERVICE WORKER - ProfitCalculator
// ============================================

const APP_VERSION = '2.0.0';
const CACHE_NAME = `profitcalc-cache-v${APP_VERSION}`;
const CACHE_NAME_PREFIX = 'profitcalc-cache-';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    // Fallback offline page
    '/offline.html'
];

// External resources to cache (optional)
const EXTERNAL_RESOURCES = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap'
];

// ============================================
// INSTALL EVENT
// ============================================
self.addEventListener('install', event => {
    console.log(`[Service Worker] Installing version ${APP_VERSION}`);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Installation complete');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

// ============================================
// ACTIVATE EVENT
// ============================================
self.addEventListener('activate', event => {
    console.log(`[Service Worker] Activating version ${APP_VERSION}`);
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Delete old caches that don't match current version
                        if (cacheName.startsWith(CACHE_NAME_PREFIX) && cacheName !== CACHE_NAME) {
                            console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activation complete');
                return self.clients.claim();
            })
    );
});

// ============================================
// FETCH EVENT - Cache Strategy
// ============================================
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Skip chrome-extension requests
    if (url.protocol === 'chrome-extension:') return;
    
    // Skip analytics and external APIs (optional)
    if (url.hostname.includes('google-analytics') || 
        url.hostname.includes('analytics')) {
        return;
    }
    
    event.respondWith(
        // Try cache first
        caches.match(request)
            .then(cachedResponse => {
                // If found in cache and not stale, return it
                if (cachedResponse) {
                    console.log(`[Service Worker] Serving from cache: ${url.pathname}`);
                    return cachedResponse;
                }
                
                // Otherwise fetch from network
                return fetch(request)
                    .then(networkResponse => {
                        // Check if valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // Clone response for caching
                        const responseToCache = networkResponse.clone();
                        
                        // Cache new resources (except external resources for now)
                        if (shouldCacheRequest(request)) {
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, responseToCache);
                                    console.log(`[Service Worker] Cached new resource: ${url.pathname}`);
                                });
                        }
                        
                        return networkResponse;
                    })
                    .catch(error => {
                        console.error('[Service Worker] Fetch failed:', error);
                        
                        // If offline and HTML request, show offline page
                        if (request.headers.get('Accept').includes('text/html')) {
                            return caches.match('/offline.html');
                        }
                        
                        // If offline and CSS request, return empty CSS
                        if (request.url.endsWith('.css')) {
                            return new Response(
                                '/* Offline - CSS not available */',
                                { headers: { 'Content-Type': 'text/css' } }
                            );
                        }
                        
                        // If offline and JS request, return empty JS
                        if (request.url.endsWith('.js')) {
                            return new Response(
                                '// Offline - JavaScript not available',
                                { headers: { 'Content-Type': 'application/javascript' } }
                            );
                        }
                        
                        // Return fallback for other requests
                        return new Response(
                            JSON.stringify({ error: 'Offline', message: 'Network unavailable' }),
                            { 
                                headers: { 
                                    'Content-Type': 'application/json',
                                    'Cache-Control': 'no-cache'
                                }
                            }
                        );
                    });
            })
    );
});

// ============================================
// CACHE STRATEGY HELPER FUNCTIONS
// ============================================

function shouldCacheRequest(request) {
    const url = new URL(request.url);
    
    // Cache all local assets
    if (url.origin === location.origin) {
        return true;
    }
    
    // Cache external fonts and FontAwesome
    if (url.hostname === 'fonts.googleapis.com' || 
        url.hostname === 'cdnjs.cloudflare.com') {
        return true;
    }
    
    return false;
}

// ============================================
// BACKGROUND SYNC
// ============================================
self.addEventListener('sync', event => {
    if (event.tag === 'sync-calculations') {
        console.log('[Service Worker] Background sync started');
        event.waitUntil(syncCalculations());
    }
});

function syncCalculations() {
    // This would sync saved calculations with server when online
    // For now, just log
    console.log('[Service Worker] Syncing calculations...');
    return Promise.resolve();
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', event => {
    console.log('[Service Worker] Push notification received');
    
    const options = {
        body: event.data?.text() || 'Cập nhật từ ProfitCalculator',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'open',
                title: 'Mở ứng dụng'
            },
            {
                action: 'close',
                title: 'Đóng'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('ProfitCalculator', options)
    );
});

self.addEventListener('notificationclick', event => {
    console.log('[Service Worker] Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then(clientList => {
                    // If a window is already open, focus it
                    for (const client of clientList) {
                        if (client.url === '/' && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    // Otherwise open a new window
                    if (clients.openWindow) {
                        return clients.openWindow('/');
                    }
                })
        );
    }
});

// ============================================
// MESSAGE HANDLING
// ============================================
self.addEventListener('message', event => {
    console.log('[Service Worker] Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME)
            .then(success => {
                console.log('[Service Worker] Cache cleared:', success);
                event.ports[0].postMessage({ success: success });
            });
    }
    
    if (event.data && event.data.type === 'GET_CACHE_INFO') {
        caches.open(CACHE_NAME)
            .then(cache => cache.keys())
            .then(requests => {
                event.ports[0].postMessage({
                    version: APP_VERSION,
                    cacheSize: requests.length,
                    cacheName: CACHE_NAME
                });
            });
    }
});

// ============================================
// PERIODIC SYNC (for future use)
// ============================================
self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-market-data') {
        console.log('[Service Worker] Periodic sync for market data');
        event.waitUntil(updateMarketData());
    }
});

function updateMarketData() {
    // This would update cached market data periodically
    // For now, just log
    console.log('[Service Worker] Updating market data...');
    return Promise.resolve();
}
