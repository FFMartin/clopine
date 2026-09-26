// client/service-worker.js — cache les fichiers statiques pour le fonctionnement hors ligne.

const CACHE_NAME = 'clopine-v10';

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
  './js/placeResolver.js',
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

self.addEventListener('fetch', (event) => {
  // Ne jamais intercepter les écritures (POST vers /api/entries) — toujours
  // réseau, jamais de cache. La Cache API ne supporte de toute façon que GET.
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Les données (/api/entries) restent en network-first : la fraîcheur
  // prime sur ces requêtes, et le mode hors-ligne est déjà géré par sync.js.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // La coquille de l'app (HTML/CSS/JS) : stale-while-revalidate. On répond
  // depuis le cache instantanément si possible (réactivité maximale au
  // lancement), et on rafraîchit le cache en tâche de fond pour la prochaine
  // visite — la mise à jour n'est jamais bloquante, juste "un lancement de
  // retard".
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkUpdate = fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => cached); // hors-ligne et rien en cache : tant pis

      return cached ?? networkUpdate;
    })
  );
});
