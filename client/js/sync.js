// client/js/sync.js — réconciliation entre localDb (IndexedDB) et remoteDb (clopine-db)

import { getAllEntries as getLocalEntries, addEntry as putLocalEntry, updateEntry as updateLocalEntry } from './localDb.js';
import { getAllEntries as getRemoteEntries, addEntry as putRemoteEntry } from './remoteDb.js';

/**
 * Compare et réconcilie les entrées locales et distantes : pousse ce qui
 * manque côté serveur, importe ce qui manque en local, et pour les entrées
 * présentes des deux côtés, garde la version la plus récemment modifiée
 * (dernière écriture gagne, via modifiedDate).
 * @returns {Promise<void>}
 */
async function sync() {
  const [localEntries, remoteEntries] = await Promise.all([getLocalEntries(), getRemoteEntries()]);

  const localById = new Map(localEntries.map((entry) => [entry.id, entry]));
  const remoteById = new Map(remoteEntries.map((entry) => [entry.id, entry]));

  const allIds = new Set([...localById.keys(), ...remoteById.keys()]);

  for (const id of allIds) {
    const local = localById.get(id);
    const remote = remoteById.get(id);

    if (local && !remote) {
      // Présent seulement en local → push. modifiedDate explicite pour ne
      // pas laisser updateEntry le retimbrer à "maintenant".
      await putRemoteEntry(local);
      await updateLocalEntry(id, { syncedDate: Date.now(), modifiedDate: local.modifiedDate });
    } else if (remote && !local) {
      // Présent seulement à distance → pull
      await putLocalEntry({ ...remote, syncedDate: Date.now() });
    } else if (local.modifiedDate > remote.modifiedDate) {
      // Local plus récent → écrase le serveur
      await putRemoteEntry(local);
      await updateLocalEntry(id, { syncedDate: Date.now(), modifiedDate: local.modifiedDate });
    } else if (remote.modifiedDate > local.modifiedDate) {
      // Distant plus récent → écrase le local
      await updateLocalEntry(id, { ...remote, syncedDate: Date.now() });
    }
    // Égalité de modifiedDate : rien à faire, déjà synchronisé.
  }
}

export { sync };
