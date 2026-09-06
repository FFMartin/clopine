// client/js/views/entries.js — vue Entrées : liste complète, synchronisation

import { getAllEntries } from '../localDb.js';
import { sync } from '../sync.js';
import { renderEntryRows } from './entryTable.js';

function refreshList(tbody) {
  getAllEntries()
    .then((entries) => renderEntryRows(tbody, entries.reverse()))
    .catch((err) => console.error('Erreur lecture:', err));
}

/**
 * @param {HTMLElement} container
 */
function renderEntries(container) {
  container.innerHTML = `
    <button id="sync-button" type="button">Synchroniser</button>

    <table>
      <thead>
        <tr>
          <th>Horodatage</th>
          <th>Lieu</th>
        </tr>
      </thead>
      <tbody id="entries-table-body"></tbody>
    </table>
  `;

  const syncButton = container.querySelector('#sync-button');
  const tbody = container.querySelector('#entries-table-body');

  syncButton.addEventListener('click', () => {
    sync()
      .then(() => refreshList(tbody))
      .catch((err) => console.error('Erreur synchro:', err));
  });

  refreshList(tbody);
}

export { renderEntries };
