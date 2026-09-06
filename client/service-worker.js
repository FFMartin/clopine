// service-worker.js — cache les fichiers statiques pour le fonctionnement hors ligne.

const CACHE_NAME = 'clopine-v8';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/views/home.js',
  './js/views/entries.js',
  './js/views/stats.js',
  './js/views/entryTable.js',
  './js/localDb.js',
  './js/remoteDb.js',
  './js/sync.js',
  './js/types.js',
  './js/geoloc.js',
  './js/geocode.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// skipWaiting : la nouvelle version s'active dès son installation, sans
// attendre que tous les onglets/l'app installée soient fermés.
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
});

// clients.claim : prend le contrôle des pages déjà ouvertes immédiatement,
// plutôt que d'attendre leur prochain rechargement.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
        ),
    ])
  );
});

// Stratégie network-first : toujours essayer le réseau en premier (donc
// toujours la version fraîche quand on est en ligne), et ne retomber sur le
// cache qu'en cas d'échec réseau (mode hors-ligne). L'inverse du cache-first
// précédent, qui pouvait servir une version périmée même en étant en ligne.
self.addEventListener('fetch', (event) => {
  // Ne jamais intercepter les écritures (POST vers /api/entries) — toujours
  // réseau, jamais de cache. La Cache API ne supporte de toute façon que GET.
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
