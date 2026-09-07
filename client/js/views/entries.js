// client/js/views/entries.js — vue Entrées : liste complète, synchronisation

import { getAllEntries, updateEntry } from '../localDb.js';
import { sync } from '../sync.js';
import { identifyMissingPlaces } from '../placeResolver.js';
import { renderEntryRows } from './entryTable.js';

function refreshList(tbody) {
  getAllEntries()
    .then((entries) => {
      const active = entries.filter((entry) => entry.deletedDate === null).reverse();
      renderEntryRows(tbody, active, {
        onDelete: (id) => {
          if (!confirm('Supprimer cette entrée ?')) return;
          // deletedDate est le tombstone : l'entrée reste en base (nécessaire pour
          // propager la suppression aux autres appareils via sync), juste masquée.
          updateEntry(id, { deletedDate: Date.now() })
            .then(() => refreshList(tbody))
            .catch((err) => console.error('Erreur suppression:', err));
        },
      });
    })
    .catch((err) => console.error('Erreur lecture:', err));
}

/**
 * @param {HTMLElement} container
 */
function renderEntries(container) {
  container.innerHTML = `
    <button id="sync-button" type="button">Synchroniser</button>
    <button id="identify-button" type="button">Identifier les lieux</button>

    <table>
      <thead>
        <tr>
          <th>Horodatage</th>
          <th>Lieu</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="entries-table-body"></tbody>
    </table>
  `;

  const syncButton = container.querySelector('#sync-button');
  const identifyButton = container.querySelector('#identify-button');
  const tbody = container.querySelector('#entries-table-body');

  syncButton.addEventListener('click', () => {
    sync()
      .then(() => refreshList(tbody))
      .catch((err) => console.error('Erreur synchro:', err));
  });

  identifyButton.addEventListener('click', () => {
    identifyMissingPlaces()
      .then(() => refreshList(tbody))
      .catch((err) => console.error('Erreur identification:', err));
  });

  refreshList(tbody);
}

export { renderEntries };
