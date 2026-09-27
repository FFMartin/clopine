// client/js/views/stats.js — vue Stats : affiche les compteurs calculés par statsEngine.js

import { getAllEntries } from '../localDb.js';
import { computeStats } from '../statsEngine.js';

/**
 * @param {HTMLElement} container
 */
function renderStats(container) {
  container.innerHTML = '<p>Chargement des stats…</p>';

  getAllEntries()
    .then((entries) => {
      const stats = computeStats(entries);

      container.innerHTML = `
        <table>
          <tbody>
            <tr><th>Dernières 24h</th><td>${stats.last24h}</td></tr>
            <tr><th>Aujourd'hui</th><td>${stats.today}</td></tr>
            <tr><th>Hier</th><td>${stats.yesterday}</td></tr>
          </tbody>
        </table>
      `;
    })
    .catch((err) => {
      console.error('Erreur lecture stats:', err);
      container.innerHTML = '<p>Erreur lors du chargement des stats.</p>';
    });
}

export { renderStats };
