// client/js/app.js — point d'entrée, routeur (SPA par hash)

import { renderHome } from './views/home.js';
import { renderEntries } from './views/entries.js';
import { renderStats } from './views/stats.js';

const view = document.getElementById('view');

const routes = {
  '#/': renderHome,
  '#/entries': renderEntries,
  '#/stats': renderStats,
};

function router() {
  const hash = location.hash || '#/';
  const render = routes[hash] ?? renderHome;
  view.innerHTML = '';
  render(view);
}

window.addEventListener('hashchange', router);
router(); // premier rendu, au chargement

// Enregistrement du Service Worker : vérifie d'abord le support (comme pour la
// géoloc), sans quoi l'appel planterait sur un navigateur trop ancien.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./service-worker.js')
    .catch((err) => console.error('Erreur Service Worker:', err));
}
