// client/js/views/stats.js — vue Stats : affiche les compteurs calculés par statsEngine.js

import { getAllEntries } from '../localDb.js';
import { computeStats, averagePerDay, compareToYesterdaySameTime } from '../statsEngine.js';

const AVERAGE_WINDOW_DAYS = 15;

/**
 * @param {number} diff
 * @returns {string}
 */
function formatDiff(diff) {
  return diff > 0 ? `+${diff}` : `${diff}`;
}

/**
 * @param {HTMLElement} container
 */
function renderStats(container) {
  container.innerHTML = '<p>Chargement des stats…</p>';

  getAllEntries()
    .then((entries) => {
      const stats = computeStats(entries);
      const average = averagePerDay(entries, AVERAGE_WINDOW_DAYS);
      const diffVsYesterday = compareToYesterdaySameTime(entries);

      container.innerHTML = `
        <table>
          <tbody>
            <tr><th>Dernières 24h</th><td>${stats.last24h}</td></tr>
            <tr><th>Aujourd'hui</th><td>${stats.today}</td></tr>
            <tr><th>Hier</th><td>${stats.yesterday}</td></tr>
            <tr><th>Moyenne / jour (${AVERAGE_WINDOW_DAYS} derniers jours complets)</th><td>${average.toFixed(1)}</td></tr>
            <tr><th>Vs hier à la même heure</th><td>${formatDiff(diffVsYesterday)}</td></tr>
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
