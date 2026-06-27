/* ============================================
   SERVICE WORKER - PWA OFFLINE
   ============================================ */

const CACHE_NAME = 'xv-rapunzel-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Recursos a cachear
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
    '/images/sol.png',
    '/music/cancion.mp3'
];

// ============================================
// INSTALACIÓN
// ============================================

self.addEventListener('install', event => {
    console.log('[SW] Instalando Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cacheando recursos estáticos');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch(error => {
                console.error('[SW] Error al cachear:', error);
            })
    );
});

// ============================================
// ACTIVACIÓN
// ============================================

self.addEventListener('activate', event => {
    console.log('[SW] Activando Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== CACHE_NAME)
                        .map(cacheName => {
                            console.log('[SW] Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// ============================================
// FETCH - INTERCEPTAR PETICIONES
// ============================================

self.addEventListener('fetch', event => {
    // Estrategia: Stale-While-Revalidate para imágenes
    // Estrategia: Network First para HTML
    // Estrategia: Cache First para CSS/JS
    
    const requestUrl = new URL(event.request.url);
    
    // Imágenes
    if (requestUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
        event.respondWith(cacheFirst(event.request));
        return;
    }
    
    // CSS y JS
    if (requestUrl.pathname.match(/\.(css|js)$/)) {
        event.respondWith(cacheFirst(event.request));
        return;
    }
    
    // HTML
    if (event.request.mode === 'navigate') {
        event.respondWith(networkFirst(event.request));
        return;
    }
    
    // API o recursos dinámicos
    event.respondWith(networkFirst(event.request));
});

// ============================================
// ESTRATEGIAS DE CACHE
// ============================================

// Cache First - Para recursos estáticos
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Error en cache-first:', error);
        return new Response('Offline', { status: 503 });
    }
}

// Network First - Para contenido dinámico
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Sin conexión, usando cache');
        
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Si es navegación y no hay cache, mostrar offline
        if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
        }
        
        return new Response('Offline', { status: 503 });
    }
}

// ============================================
// PUSH NOTIFICATIONS (OPCIONAL)
// ============================================

self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Nueva actualización',
        icon: '/images/corona.png',
        badge: '/images/corona.png',
        vibrate: [200, 100, 200],
        tag: 'xv-invitation',
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('XV Años - Antonella', options)
    );
});

// ============================================
// BACKGROUND SYNC (OPCIONAL)
// ============================================

self.addEventListener('sync', event => {
    if (event.tag === 'sync-rsvp') {
        console.log('[SW] Sincronizando confirmación de asistencia...');
        event.waitUntil(syncRSVP());
    }
});

async function syncRSVP() {
    // Lógica para sincronizar confirmaciones cuando haya conexión
    console.log('[SW] RSVP sincronizado');
}

// ============================================
// MENSAJES ENTRE SW Y APP
// ============================================

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(cache => cache.addAll(event.data.urls))
        );
    }
});

console.log('[SW] Service Worker cargado correctamente');