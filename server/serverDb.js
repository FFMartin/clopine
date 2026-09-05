// server/serverDb.js — interface unique avec D1 (clopine-db)

/**
 * @param {*} env - environnement du Worker, porte le binding DB (D1)
 * @returns {Promise<Array>} toutes les entrées de la table Entries
 */
async function getAllEntries(env) {
  const { results } = await env.DB.prepare('SELECT * FROM Entries').all();
  return results;
}

/**
 * @param {*} env - environnement du Worker, porte le binding DB (D1)
 * @param {{id: string, timestamp: number, locLatitude: number|null, locLongitude: number|null, placeLabel: string|null, modifiedDate: number, deletedDate: number|null}} entry
 * @returns {Promise<void>}
 */
async function addEntry(env, entry) {
  await env.DB.prepare(
    'INSERT INTO Entries (id, timestamp, loc_latitude, loc_longitude, place_label, modified_date, deleted_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(
      entry.id,
      entry.timestamp,
      entry.locLatitude ?? null,
      entry.locLongitude ?? null,
      entry.placeLabel ?? null,
      entry.modifiedDate,
      entry.deletedDate ?? null
    )
    .run();
}

export { getAllEntries, addEntry };
