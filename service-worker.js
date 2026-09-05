// service-worker.js — cache les fichiers statiques pour le fonctionnement hors ligne.
// Ne cache QUE nos propres fichiers : les appels à Nominatim (geocode.js) ou à la
// géolocalisation ne sont jamais interceptés, ils doivent toujours viser le réseau.

const CACHE_NAME = 'clopine-v3';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/db.js',
  './js/geoloc.js',
  './js/geocode.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// À l'installation : on télécharge et on met en cache tous les fichiers de l'app.
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
});

// À l'activation : on supprime les caches d'une ancienne version (utile le jour
// où CACHE_NAME change, pour éviter d'accumuler des fichiers obsolètes).
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
      )
  );
});

// Stratégie cache-first : on sert depuis le cache si possible, sinon on va sur le réseau.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => cachedResponse || fetch(event.request))
  );
});
