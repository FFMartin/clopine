// client/js/views/entryTable.js — rendu partagé d'une liste d'Entry dans un <tbody>
// Ne décide jamais QUELLES entrées afficher (limite, tri, filtrage...) — ça
// reste la responsabilité de chaque vue qui l'utilise.

/**
 * Construit les cellules via textContent (pas innerHTML) pour placeLabel :
 * cette valeur vient de Nominatim, une source externe qu'on ne contrôle pas.
 * @param {HTMLTableSectionElement} tbody
 * @param {import('../types.js').Entry[]} entries
 * @param {{ onDelete?: (id: string) => void }} [options] - onDelete absent : pas de
 *   colonne de suppression (ex. aperçu sans action sur l'accueil).
 */
function renderEntryRows(tbody, entries, options = {}) {
  tbody.innerHTML = '';

  entries.forEach((entry) => {
    const row = document.createElement('tr');

    const dateCell = document.createElement('td');
    dateCell.textContent = new Date(entry.timestamp).toLocaleString('fr-FR');
    row.appendChild(dateCell);

    const placeCell = document.createElement('td');
    placeCell.textContent = entry.placeLabel ?? '—';
    row.appendChild(placeCell);

    if (options.onDelete) {
      const actionCell = document.createElement('td');
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'delete-button';
      deleteButton.textContent = 'Supprimer';
      deleteButton.addEventListener('click', () => options.onDelete(entry.id));
      actionCell.appendChild(deleteButton);
      row.appendChild(actionCell);
    }

    tbody.appendChild(row);
  });
}

export { renderEntryRows };
