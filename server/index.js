export default {
  async fetch(request, env) {
    // Pour l'instant : on ne fait que servir les fichiers statiques (client/).
    // Les routes API (accès à D1) viendront s'ajouter ici dans une prochaine étape.
    return env.ASSETS.fetch(request);
  },
};
