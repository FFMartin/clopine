// client/js/statsEngine.js — moteur de stats : calcule des compteurs sur des
// fenêtres de temps, à partir de la liste d'entrées (chargées ailleurs).
// Aucune dépendance à IndexedDB : fonctions pures, faciles à relire/tester.

/** @typedef {import('./types.js').Entry} Entry */

// Le "jour" ici ne commence pas à minuit mais à 6h du matin : une cigarette
// fumée à 1h du matin compte encore pour la journée précédente.
const DAY_START_HOUR = 6;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Début du "jour personnalisé" (6h → 5h59) contenant la date donnée.
 * @param {Date} date
 * @returns {Date}
 */
function startOfSmokingDay(date) {
  const start = new Date(date);
  if (start.getHours() < DAY_START_HOUR) {
    start.setDate(start.getDate() - 1);
  }
  start.setHours(DAY_START_HOUR, 0, 0, 0);
  return start;
}

/**
 * Compte les entrées actives (non supprimées) dont l'horodatage tombe dans
 * [start, end[.
 * @param {Entry[]} entries
 * @param {Date} start
 * @param {Date} end
 * @returns {number}
 */
function countEntriesBetween(entries, start, end) {
  const startMs = start.getTime();
  const endMs = end.getTime();

  return entries.filter(
    (entry) => entry.deletedDate === null && entry.timestamp >= startMs && entry.timestamp < endMs
  ).length;
}

/**
 * Calcule les stats affichées sur la vue Stats.
 * @param {Entry[]} entries
 * @param {Date} [now] - injectable pour faciliter les tests
 * @returns {{ last24h: number, today: number, yesterday: number }}
 */
function computeStats(entries, now = new Date()) {
  const todayStart = startOfSmokingDay(now);
  const yesterdayStart = new Date(todayStart.getTime() - ONE_DAY_MS);
  const last24hStart = new Date(now.getTime() - ONE_DAY_MS);

  return {
    last24h: countEntriesBetween(entries, last24hStart, now),
    today: countEntriesBetween(entries, todayStart, now),
    yesterday: countEntriesBetween(entries, yesterdayStart, todayStart),
  };
}

/**
 * Moyenne de cigarettes par jour (jour personnalisé 6h → 5h59) sur les `days`
 * derniers jours COMPLETS — aujourd'hui (en cours) est exclu du calcul pour
 * ne pas biaiser la moyenne vers le bas avec une journée partielle.
 * @param {Entry[]} entries
 * @param {number} days
 * @param {Date} [now] - injectable pour faciliter les tests
 * @returns {number}
 */
function averagePerDay(entries, days, now = new Date()) {
  const todayStart = startOfSmokingDay(now);
  const windowStart = new Date(todayStart.getTime() - days * ONE_DAY_MS);
  const total = countEntriesBetween(entries, windowStart, todayStart);
  return total / days;
}

/**
 * Différence entre le nombre de cigarettes fumées aujourd'hui (depuis le
 * début du jour personnalisé) et le nombre fumées hier au même point de la
 * journée (même durée écoulée depuis 6h). Positif = plus qu'hier à cette
 * heure-ci, négatif = moins.
 * @param {Entry[]} entries
 * @param {Date} [now] - injectable pour faciliter les tests
 * @returns {number}
 */
function compareToYesterdaySameTime(entries, now = new Date()) {
  const todayStart = startOfSmokingDay(now);
  const elapsedMs = now.getTime() - todayStart.getTime();
  const yesterdayStart = new Date(todayStart.getTime() - ONE_DAY_MS);
  const yesterdaySameTime = new Date(yesterdayStart.getTime() + elapsedMs);

  const todayCount = countEntriesBetween(entries, todayStart, now);
  const yesterdayCount = countEntriesBetween(entries, yesterdayStart, yesterdaySameTime);

  return todayCount - yesterdayCount;
}

export {
  computeStats,
  startOfSmokingDay,
  countEntriesBetween,
  averagePerDay,
  compareToYesterdaySameTime,
};
