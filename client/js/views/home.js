// client/js/views/home.js — vue Accueil : création d'entrée, KPIs (à venir), 10 dernières entrées

import { addEntry, getAllEntries, updateEntry } from '../localDb.js';
import { getCurrentPosition } from '../geoloc.js';
import { reverseGeocode } from '../geocode.js';
import { renderEntryRows } from './entryTable.js';

const ENTRIES_SHOWN = 10;

function refreshList(tbody) {
  getAllEntries()
    .then((entries) => renderEntryRows(tbody, entries.reverse().slice(0, ENTRIES_SHOWN)))
    .catch((err) => console.error('Erreur lecture:', err));
}

/**
 * @param {HTMLElement} container
 */
function renderHome(container) {
  container.innerHTML = `
    <button id="log-button" type="button">J'en grille une</button>

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

  const button = container.querySelector('#log-button');
  const tbody = container.querySelector('#entries-table-body');

  button.addEventListener('click', () => {
    // L'Entry est construite ICI, complète, avant de partir vers localDb — ce
    // n'est pas à localDb.js de décider ce qu'est une "nouvelle" entrée.
    const now = Date.now();
    /** @type {import('../types.js').Entry} */
    const entry = {
      id: crypto.randomUUID(),
      timestamp: now,
      locLatitude: null,
      locLongitude: null,
      placeLabel: null,
      modifiedDate: now,
      deletedDate: null,
      syncedDate: null,
    };

    addEntry(entry)
      .then(() => {
        refreshList(tbody); // affichage immédiat, sans coords ni lieu

        getCurrentPosition()
          .then(({ latitude, longitude }) => {
            return updateEntry(entry.id, { locLatitude: latitude, locLongitude: longitude }).then(() => {
              refreshList(tbody); // 2e rafraîchissement : coordonnées connues

              // Étape distincte, elle aussi non-bloquante : un échec du géocodage
              // (Nominatim indisponible, etc.) ne doit jamais remettre en cause
              // l'entrée déjà enregistrée avec ses coordonnées.
              reverseGeocode(latitude, longitude)
                .then((placeLabel) => updateEntry(entry.id, { placeLabel }))
                .then(() => refreshList(tbody)) // 3e rafraîchissement : lieu connu
                .catch((err) => console.warn('Géocodage indisponible:', err.message));
            });
          })
          .catch((err) => console.warn(`Géoloc indisponible (code ${err.code}):`, err.message)); // dégradation silencieuse
      })
      .catch((err) => console.error('Erreur:', err));
  });

  refreshList(tbody);
}

export { renderHome };
