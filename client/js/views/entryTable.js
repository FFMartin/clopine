// client/js/views/entryTable.js — rendu partagé d'une liste d'Entry dans un <tbody>
// Ne décide jamais QUELLES entrées afficher (limite, tri, filtrage...) — ça
// reste la responsabilité de chaque vue qui l'utilise.

/**
 * @param {HTMLTableSectionElement} tbody
 * @param {import('../types.js').Entry[]} entries
 * @param {{ onDelete?: (id: string) => void }} [options] - onDelete absent : pas de
 *   colonne de suppression (ex. aperçu sans action sur l'accueil).
 */
function renderEntryRows(tbody, entries, options = {}) {
  tbody.innerHTML = '';
  entries.forEach((entry) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(entry.timestamp).toLocaleString('fr-FR')}</td>
      <td>${entry.placeLabel ?? '—'}</td>
      ${options.onDelete ? '<td><button type="button" class="delete-button">Supprimer</button></td>' : ''}
    `;

    if (options.onDelete) {
      row.querySelector('.delete-button').addEventListener('click', () => options.onDelete(entry.id));
    }

    tbody.appendChild(row);
  });
}

export { renderEntryRows };
