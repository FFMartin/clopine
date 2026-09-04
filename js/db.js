// js/db.js — wrapper léger IndexedDB (CRUD)

const DB_NAME = 'clopine-db';
const DB_VERSION = 1;

let dbInstance = null;

/**
 * @typedef {Object} Entry
 * @property {number} timestamp - Horodatage du clic (epoch ms)
 * @property {number|null} locLatitude - Latitude au moment du clic
 * @property {number|null} locLongitude - Longitude au moment du clic
 * @property {boolean} synced - Indique si l'entrée a été synchronisée (phase 2)
 */

function initDB() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('entries')) {
        const entries = db.createObjectStore('entries', {
          keyPath: 'id',
          autoIncrement: true,
        });
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
 * @returns {Promise<number>} l'id généré
 */
function addEntry(entry) {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('entries', 'readwrite');
      const store = tx.objectStore('entries');

      const request = store.add({
        timestamp: entry.timestamp,
        locLatitude: entry.locLatitude ?? null,
        locLongitude: entry.locLongitude ?? null,
        synced: false,
      });

      request.onsuccess = () => resolve(request.result); // l'id généré
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
      const store = tx.objectStore('entries');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

/**
 * @param {number} id
 * @param {Partial<Pick<Entry, 'locLatitude' | 'locLongitude'>>} patch
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
