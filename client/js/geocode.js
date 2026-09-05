// js/geocode.js — géocodage inversé (coordonnées → nom de lieu lisible)
// Utilise Nominatim (OpenStreetMap) : gratuit, sans clé API.

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

/**
 * Transforme des coordonnées GPS en un libellé du type "Chinon (FR)".
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string|null>} null si aucune commune/pays n'a pu être déterminé
 */
function reverseGeocode(latitude, longitude) {
  const url = `${NOMINATIM_URL}?format=json&addressdetails=1&zoom=10&lat=${latitude}&lon=${longitude}`;

  return fetch(url, { headers: { 'Accept-Language': 'fr' } })
    .then((response) => {
      if (!response.ok) throw new Error(`Nominatim a répondu ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const address = data.address ?? {};

      // Nominatim range le nom de "commune" sous des clés différentes selon la taille
      // du lieu (grande ville, bourg, village...) — on essaie dans l'ordre.
      const commune = address.city ?? address.town ?? address.village ?? address.hamlet ?? null;
      const countryCode = address.country_code ?? null;

      return commune && countryCode ? `${commune} (${countryCode.toUpperCase()})` : null;
    });
}

export { reverseGeocode };
