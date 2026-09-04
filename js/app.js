// js/app.js — point d'entrée, orchestration UI

import { addEntry, getAllEntries, updateEntry } from './db.js';
import { getCurrentPosition } from './geoloc.js';

const button = document.getElementById('log-button');

function displayEntries(entries) {
  const tbody = document.getElementById('entries-table-body');
  tbody.innerHTML = '';

  entries.forEach((entry) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.id}</td>
      <td>${new Date(entry.timestamp).toLocaleString('fr-FR')}</td>
      <td>${entry.locLatitude ?? '—'}</td>
      <td>${entry.locLongitude ?? '—'}</td>
      <td>${entry.synced ? 'Oui' : 'Non'}</td>
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
      refreshEntries(); // affichage immédiat, sans coords

      getCurrentPosition()
        .then(({ latitude, longitude }) =>
          updateEntry(id, { locLatitude: latitude, locLongitude: longitude })
        )
        .then(() => refreshEntries()) // second rafraîchissement, une fois les coords connues
        .catch((err) => console.warn(`Géoloc indisponible (code ${err.code}):`, err.message)); // dégradation silencieuse
    })
    .catch((err) => console.error('Erreur:', err));
});

refreshEntries();
