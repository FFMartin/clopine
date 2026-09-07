// client/js/placeResolver.js — coordonne geocode.js et localDb.js : résout un
// libellé de lieu à partir de coordonnées, et le persiste sur l'Entry concernée.

import { getAllEntries, updateEntry } from './localDb.js';
import { reverseGeocode } from './geocode.js';

/**
 * Résout le libellé de lieu d'UNE entrée à partir de coordonnées, et le
 * persiste. Utilisée à la fois juste après une création (home.js) et lors
 * d'un rattrapage en masse (identifyMissingPlaces).
 * @param {string} id
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<void>}
 */
function identifyPlace(id, latitude, longitude) {
  return reverseGeocode(latitude, longitude).then((placeLabel) => {
    if (placeLabel) return updateEntry(id, { placeLabel });
  });
}

/**
 * Parcourt toutes les entrées ayant des coordonnées mais pas de libellé
 * (échec ponctuel du géocodage), et retente pour chacune.
 * @returns {Promise<void>}
 */
function identifyMissingPlaces() {
  return getAllEntries().then((entries) => {
    const missing = entries.filter(
      (entry) =>
        entry.deletedDate === null &&
        entry.locLatitude !== null &&
        entry.locLongitude !== null &&
        entry.placeLabel === null
    );

    // Séquentiel, pas en parallèle : Nominatim limite à 1 requête/seconde
    // (rappel de geocode.js) — un traitement en parallèle risquerait de
    // dépasser cette limite si plusieurs entrées sont concernées.
    return missing.reduce(
      (chain, entry) =>
        chain.then(() =>
          identifyPlace(entry.id, entry.locLatitude, entry.locLongitude).catch((err) =>
            console.warn(`Géocodage indisponible pour ${entry.id}:`, err.message)
          )
        ),
      Promise.resolve()
    );
  });
}

export { identifyPlace, identifyMissingPlaces };
