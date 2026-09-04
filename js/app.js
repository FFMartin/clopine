// js/app.js — point d'entrée, orchestration UI

import { addEntry, getAllEntries, updateEntry } from './db.js';
import { getCurrentPosition } from './geoloc.js';
import { reverseGeocode } from './geocode.js';

const button = document.getElementById('log-button');

function displayEntries(entries) {
  const tbody = document.getElementById('entries-table-body');
  tbody.innerHTML = '';

  entries.forEach((entry) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(entry.timestamp).toLocaleString('fr-FR')}</td>
      <td>${entry.placeLabel ?? '—'}</td>
    `;
    tbody.appendChild(row);
  });
}

function refreshEntries() {
  getAllEntries()
    .then((entries) => displayEntries(entries))
    .catch((err) => console.error('Erreur lecture:', err));
}

button.addEventListener('click', () => {
  addEntry({ timestamp: Date.now() })
    .then((id) => {
      refreshEntries(); // affichage immédiat, sans coords ni lieu

      getCurrentPosition()
        .then(({ latitude, longitude }) => {
          return updateEntry(id, { locLatitude: latitude, locLongitude: longitude }).then(() => {
            refreshEntries(); // 2e rafraîchissement : coordonnées connues

            // Étape distincte, elle aussi non-bloquante : un échec du géocodage
            // (Nominatim indisponible, etc.) ne doit jamais remettre en cause
            // l'entrée déjà enregistrée avec ses coordonnées.
            reverseGeocode(latitude, longitude)
              .then((placeLabel) => updateEntry(id, { placeLabel }))
              .then(() => refreshEntries()) // 3e rafraîchissement : lieu connu
              .catch((err) => console.warn('Géocodage indisponible:', err.message));
          });
        })
        .catch((err) => console.warn(`Géoloc indisponible (code ${err.code}):`, err.message)); // dégradation silencieuse
    })
    .catch((err) => console.error('Erreur:', err));
});

refreshEntries();
