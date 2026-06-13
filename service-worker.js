const CACHE_NAME = 'puzzle-master-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://picsum.photos/600/600'
];

// Instalar SW y Cachear Recursos del Core
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activar y Limpiar Caches Antiguos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de Cache: Network First, falling back to Cache
// Esto asegura que si hay internet busque imágenes nuevas, sino, cargue las de la caché local.
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).then((response) => {
      // Duplicar respuesta para guardarla en caché dinámicamente si es una imagen
      if (e.request.url.includes('picsum.photos') || e.request.destination === 'image') {
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
      }
      return response;
    }).catch(() => {
      return caches.match(e.request);
    })
  );
});
