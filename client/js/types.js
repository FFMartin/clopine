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
 * @property {boolean} synced - Indique si l'entrée a été synchronisée (phase 2)
 */

export {};
