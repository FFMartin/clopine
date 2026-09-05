// client/js/types.js — définitions de types partagées (JSDoc)
// Neutre : ne dépend d'aucun module de stockage (localDb, remoteDb...), et
// inversement, aucun des deux n'est "propriétaire" du concept d'Entry.

/**
 * @typedef {Object} Entry
 * @property {string} id - identifiant unique généré côté client (UUID)
 * @property {number} timestamp - Horodatage du clic (epoch ms)
 * @property {number|null} locLatitude - Latitude au moment du clic
 * @property {number|null} locLongitude - Longitude au moment du clic
 * @property {string|null} placeLabel - Nom de lieu lisible, ex. "Chinon (FR)"
 * @property {number} modifiedDate - Dernière modification du CONTENU (epoch ms).
 *   Sert à arbitrer les conflits de synchro (dernière écriture gagne) — existe
 *   à la fois en local et sur le serveur.
 * @property {number|null} deletedDate - Date de suppression (epoch ms), ou null
 *   si l'entrée est active. "Tombstone" : évite qu'une entrée supprimée sur un
 *   appareil ne soit réimportée depuis un autre appareil/le serveur.
 * @property {number|null} syncedDate - Dernière synchronisation réussie AVEC LE
 *   SERVEUR (epoch ms), ou null si jamais poussée. Propre à chaque appareil —
 *   n'existe QUE localement, jamais envoyée à clopine-db.
 */

export {};
