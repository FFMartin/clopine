// js/geoloc.js — capture de la position géographique

const GEOLOC_TIMEOUT_MS = 5000;

/**
 * @returns {Promise<{ latitude: number, longitude: number }>}
 */
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Géolocalisation non supportée par ce navigateur'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => reject(error),
      { timeout: GEOLOC_TIMEOUT_MS }
    );
  });
}

export { getCurrentPosition };
