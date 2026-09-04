// js/db.js — wrapper léger IndexedDB (CRUD)

const DB_NAME = 'tracker-db';
const DB_VERSION = 1;

let dbInstance = null;

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
        entries.createIndex('ts', 'ts', { unique: false });
        entries.createIndex('synced', 'synced', { unique: false });
      }

      if (!db.objectStoreNames.contains('places')) {
        db.createObjectStore('places', {
          keyPath: 'id',
          autoIncrement: true,
        });
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

export { initDB };
