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
 * N'insère l'Entry QUE telle qu'on la lui donne — id, dates, tout doit déjà
 * être décidé par l'appelant (app.js pour une création, sync.js pour un
 * import). localDb.js n'a plus à savoir ce qu'est une "nouvelle" entrée.
 * @param {Entry} entry - Entry complète
 * @returns {Promise<void>}
 */
function addEntry(entry) {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('entries', 'readwrite');
      const request = tx.objectStore('entries').add(entry);

      request.onsuccess = () => resolve();
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
 * @param {Partial<Pick<Entry, 'locLatitude' | 'locLongitude' | 'placeLabel' | 'deletedDate' | 'syncedDate' | 'modifiedDate'>>} patch
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
        // modifiedDate se timbre automatiquement à "maintenant" — sauf si le
        // patch le précise explicitement (cas d'un import distant : on garde
        // la date de modification d'origine, pas le moment de l'import).
        const updated = {
          ...existing,
          ...patch,
          modifiedDate: patch.modifiedDate ?? Date.now(),
        };
        store.put(updated);
      };
      getRequest.onerror = () => reject(getRequest.error);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

export { initDB, addEntry, getAllEntries, updateEntry };
