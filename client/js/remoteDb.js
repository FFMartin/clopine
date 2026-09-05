// client/js/remoteDb.js — interface avec l'API distante (clopine-db, via server/index.js)
// Même forme que localDb.js (getAllEntries, addEntry), pour rester interchangeable côté
// app.js/sync.js — mais chacune parle à une source différente sous le capot.

const API_BASE = '/api/entries';

/**
 * @returns {Promise<import('./types.js').Entry[]>}
 */
function getAllEntries() {
  return fetch(API_BASE)
    .then((response) => {
      if (!response.ok) throw new Error(`API a répondu ${response.status}`);
      return response.json();
    })
    .then((rows) =>
      // L'API renvoie les colonnes SQL telles quelles (snake_case) ; on les
      // convertit ici pour retrouver la même forme d'Entry que localDb.js.
      rows.map((row) => ({
        id: row.id,
        timestamp: row.timestamp,
        locLatitude: row.loc_latitude,
        locLongitude: row.loc_longitude,
        placeLabel: row.place_label,
      }))
    );
}

/**
 * Contrairement à localDb.addEntry, on ne génère PAS d'id ici : l'entrée existe
 * déjà localement (avec son UUID) au moment où on la pousse vers le serveur.
 * @param {import('./types.js').Entry} entry - entrée complète, id inclus
 * @returns {Promise<void>}
 */
function addEntry(entry) {
  return fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  }).then((response) => {
    if (!response.ok) throw new Error(`API a répondu ${response.status}`);
  });
}

export { getAllEntries, addEntry };
