// client/js/views/entryTable.js — rendu partagé d'une liste d'Entry dans un <tbody>
// Ne décide jamais QUELLES entrées afficher (limite, tri...) — ça reste la
// responsabilité de chaque vue qui l'utilise.

/**
 * @param {HTMLTableSectionElement} tbody
 * @param {import('../types.js').Entry[]} entries
 */
function renderEntryRows(tbody, entries) {
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

export { renderEntryRows };
