# Clopine

Application de suivi personnel de consommation de tabac : un bouton, un clic, une cigarette enregistrée.

## Philosophie du projet

L'application est conçue pour être **la plus simple et la plus efficace possible** à l'usage :

- **Réactivité maximale** : l'app doit se charger instantanément pour permettre d'enregistrer une cigarette sans friction, d'où un unique gros bouton "J'en grille une" en page d'accueil.
- **Données minimalistes** : seul l'essentiel est envoyé en base (date, localisation, lieu) — rien de superflu.
- **Pas d'authentification pour le moment** : accès ouvert, une éventuelle couche OAuth pourra être ajoutée plus tard.
- **Hors-ligne d'abord** : les données sont stockées en local (IndexedDB) et synchronisables avec une base distante quand une connexion est disponible.

## Fonctionnement

1. **Créer une entrée** : clic sur "J'en grille une" (vue Accueil). L'entrée est enregistrée immédiatement avec un horodatage — l'utilisateur n'attend rien.
2. **Enrichissement asynchrone et non-bloquant**, après coup :
   - géolocalisation du navigateur → latitude/longitude
   - géocodage inverse (Nominatim) → libellé de lieu lisible (ex. "Chinon (FR)")
   - chaque étape échoue silencieusement si indisponible (pas de géoloc, pas de réseau…), sans jamais remettre en cause l'entrée déjà créée
3. **Stockage local d'abord** : toutes les entrées vivent dans IndexedDB (`localDb.js`), l'appli fonctionne donc sans connexion.
4. **Synchronisation** (`sync.js`) avec le serveur distant :
   - les entrées absentes d'un côté sont poussées/importées
   - en cas de présence des deux côtés, la version dont `modifiedDate` est la plus récente l'emporte
   - les suppressions sont propagées via un "tombstone" (`deletedDate`) pour éviter qu'une entrée supprimée sur un appareil ne soit réimportée depuis un autre

## Structure du dépôt

```
client/               Front-end (SPA, PWA)
  index.html
  css/style.css
  manifest.webmanifest, service-worker.js   → installable, offline
  js/
    app.js            Routeur SPA
    types.js           Définition du type Entry (JSDoc)
    localDb.js         Persistance IndexedDB
    remoteDb.js        Appels API vers le serveur
    sync.js            Réconciliation local ↔ distant
    geoloc.js          Géolocalisation navigateur
    geocode.js         Appel au service de géocodage
    placeResolver.js   Résolution du libellé de lieu à partir des coordonnées
    views/             home.js, entries.js, entryTable.js, stats.js

server/                Cloudflare Worker (API + fichiers statiques)
  index.js             Routes /api/entries (GET, POST), sert client/ pour le reste
  serverDb.js           Accès à la base D1

wrangler.jsonc          Config Cloudflare Workers (assets = client/, D1 = clopine-db)
```

## Modèle de données (`Entry`)

Volontairement minimal — seuls date, localisation et lieu sont conservés.

| Champ | Description |
|---|---|
| `id` | UUID généré côté client |
| `timestamp` | Horodatage du clic |
| `locLatitude` / `locLongitude` | Coordonnées au moment du clic (ou `null`) |
| `placeLabel` | Nom de lieu lisible (ou `null`) |
| `modifiedDate` | Dernière modification du contenu — sert à l'arbitrage de synchro |
| `deletedDate` | Date de suppression, ou `null` si active (tombstone) |
| `syncedDate` | Dernière synchro réussie avec le serveur — **local uniquement**, jamais envoyé |

## Stack technique

- Front : HTML/CSS/JS vanilla (pas de framework), SPA avec routes `#/`, `#/entries`, `#/stats`
- PWA : `manifest.webmanifest` + `service-worker.js` (installable, fonctionne hors-ligne)
- Back : Cloudflare Workers (`server/index.js`)
- Base de données : Cloudflare D1 (`clopine-db`)
- Authentification : aucune pour le moment
- Déploiement : `wrangler.jsonc`
