// Mock "Ghost Prompt" logistics engine — simulates a background AI fetch that
// estimates a bundled flight + recovery-hotel cost for a medical trip.
// Replace with a real backend call later; signature stays the same.

const RECOVERY_DAYS = {
  "Knee Replacement": 14,
  "Hip Replacement": 14,
  Lasik: 3,
};

// Rough mock base flight cost (USD) by destination country.
const FLIGHT_BASE = {
  India: 1100,
  China: 980,
  "United States": 0,
};

const HOTEL_PER_NIGHT = 65;

function firstPart(value, fallback) {
  const v = (value || "").split(",")[0].trim();
  return v || fallback;
}

/**
 * @param {string} origin      e.g. "New York, NY"
 * @param {string} destination  e.g. "Chennai, India"
 * @param {string} procedure    e.g. "Knee Replacement"
 * @param {{departure?: string, return?: string}} dates
 * @returns {string} dynamic logistics summary, e.g.
 *   "Included (~$2,010 for NY to Chennai Flight + 14-Day Recovery Hotel)"
 */
export function calculateLogistics(origin, destination, procedure, dates) {
  const recoveryDays = RECOVERY_DAYS[procedure] ?? 7;
  const destCountry = (destination || "").split(",").pop().trim();
  const destCity = firstPart(destination, "Destination");
  const originCity = firstPart(origin, "Your City");
  const originCode =
    originCity.length > 2
      ? originCity.slice(0, 2).toUpperCase()
      : originCity.toUpperCase();

  const flight = FLIGHT_BASE[destCountry] ?? 1200;
  const hotel = recoveryDays * HOTEL_PER_NIGHT;
  const total = flight + hotel;

  return `Included (~$${total.toLocaleString()} for ${originCode} to ${destCity} Flight + ${recoveryDays}-Day Recovery Hotel)`;
}