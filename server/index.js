import { getAllEntries } from './serverDb.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Route "Lire clopine-db" : renvoie toutes les entrées en JSON.
    if (url.pathname === '/api/entries' && request.method === 'GET') {
      const entries = await getAllEntries(env);
      return Response.json(entries);
    }

    // Pour tout le reste : on sert les fichiers statiques (client/).
    return env.ASSETS.fetch(request);
  },
};
