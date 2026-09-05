// js/localDb.js — wrapper léger IndexedDB (CRUD)

const DB_NAME = 'clopine-db';
const DB_VERSION = 1;

let dbInstance = null;

/** @typedef {import('./types.js').Entry} Entry */

function initDB() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('entries')) {
        // Pas d'auto-increment : l'id (UUID) est généré côté client dans addEntry(),
        // pour rester unique même sur plusieurs appareils (utile pour la synchro en Phase 2).
        const entries = db.createObjectStore('entries', { keyPath: 'id' });
        entries.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

/**
 * @param {Pick<Entry, 'timestamp' | 'locLatitude' | 'locLongitude'>} entry
 * @returns {Promise<string>} l'id généré (UUID)
 */
function addEntry(entry) {
  const id = crypto.randomUUID();

  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('entries', 'readwrite');
      const store = tx.objectStore('entries');

      const request = store.add({
        id,
        timestamp: entry.timestamp,
        locLatitude: entry.locLatitude ?? null,
        locLongitude: entry.locLongitude ?? null,
        placeLabel: null,
        synced: false,
      });

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  });
}

/**
 * @returns {Promise<Entry[]>}
 */
function getAllEntries() {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('entries', 'readonly');
      // On passe par l'index "timestamp" plutôt que le store directement :
      // depuis le passage à l'UUID, l'id n'a plus aucun rapport avec l'ordre
      // chronologique. getAll() sur l'index trie par timestamp croissant —
      // à l'appelant de réordonner si un affichage précis le demande.
      const index = tx.objectStore('entries').index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

/**
 * @param {string} id
 * @param {Partial<Pick<Entry, 'locLatitude' | 'locLongitude' | 'placeLabel'>>} patch
 * @returns {Promise<void>}
 */
function updateEntry(id, patch) {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('entries', 'readwrite');
      const store = tx.objectStore('entries');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error(`Entrée ${id} introuvable`));
          return;
        }
        const updated = { ...existing, ...patch };
        store.put(updated);
      };
      getRequest.onerror = () => reject(getRequest.error);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

export { initDB, addEntry, getAllEntries, updateEntry };
