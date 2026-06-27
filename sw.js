const CACHE_NAME = 'xv-rapunzel-v2.0.0';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/offline.html',
    '/images/corona.png',
    '/images/rapunzel.png',
    '/images/pascal.png',
    '/images/flores.png',
    '/images/sol.png'
];

// Instalación
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cacheando recursos');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activación
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    
    // Estrategia Cache First para imágenes
    if (requestUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
        event.respondWith(cacheFirst(event.request));
        return;
    }
    
    // Cache First para CSS/JS
    if (requestUrl.pathname.match(/\.(css|js)$/)) {
        event.respondWith(cacheFirst(event.request));
        return;
    }
    
    // Network First para HTML
    if (event.request.mode === 'navigate') {
        event.respondWith(networkFirst(event.request));
        return;
    }
    
    // Default: Network First
    event.respondWith(networkFirst(event.request));
});

// Cache First Strategy
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        return caches.match('/offline.html');
    }
}

// Network First Strategy
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        return cached || caches.match('/offline.html');
    }
}
