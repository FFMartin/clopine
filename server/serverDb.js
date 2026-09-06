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
 * Upsert : insère l'entrée, ou écrase la version existante si son id est déjà
 * présent (ON CONFLICT). Sert à la fois au push d'une entrée neuve et à la
 * mise à jour d'une entrée déjà connue du serveur (sync.js s'en sert pour
 * les deux cas, sans avoir besoin de deux routes différentes).
 * @param {*} env - environnement du Worker, porte le binding DB (D1)
 * @param {{id: string, timestamp: number, locLatitude: number|null, locLongitude: number|null, placeLabel: string|null, modifiedDate: number, deletedDate: number|null}} entry
 * @returns {Promise<void>}
 */
async function addEntry(env, entry) {
  await env.DB.prepare(
    `INSERT INTO Entries (id, timestamp, loc_latitude, loc_longitude, place_label, modified_date, deleted_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       timestamp = excluded.timestamp,
       loc_latitude = excluded.loc_latitude,
       loc_longitude = excluded.loc_longitude,
       place_label = excluded.place_label,
       modified_date = excluded.modified_date,
       deleted_date = excluded.deleted_date`
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
