// server/serverDb.js — interface unique avec D1 (clopine-db)

/**
 * @param {*} env - environnement du Worker, porte le binding DB (D1)
 * @returns {Promise<Array>} toutes les entrées de la table Entries
 */
async function getAllEntries(env) {
  const { results } = await env.DB.prepare('SELECT * FROM Entries').all();
  return results;
}

export { getAllEntries };
