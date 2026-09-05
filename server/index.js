import { getAllEntries, addEntry } from './serverDb.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Route "Lire clopine-db" : renvoie toutes les entrées en JSON.
    if (url.pathname === '/api/entries' && request.method === 'GET') {
      const entries = await getAllEntries(env);
      return Response.json(entries);
    }

    // Route "Écrire clopine-db" : insère une entrée reçue en JSON.
    if (url.pathname === '/api/entries' && request.method === 'POST') {
      const entry = await request.json();
      await addEntry(env, entry);
      return Response.json({ success: true }, { status: 201 });
    }

    // Pour tout le reste : on sert les fichiers statiques (client/).
    return env.ASSETS.fetch(request);
  },
};
