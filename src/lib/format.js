// Display formatters. Money: no decimals. Percentages: one decimal.
// API rate values arrive as fractions (0–1); values already in percent (>1)
// pass through unchanged. We never recompute or round an API *figure* — these
// only format a single value for display.

export function money(n) {
  if (n == null || n === "" || isNaN(n)) return "—";
  return "$" + Math.round(Number(n)).toLocaleString("en-US");
}

function toPercent(n) {
  const v = Number(n);
  if (isNaN(v)) return "—";
  return (v <= 1 ? v * 100 : v).toFixed(1);
}

export function percent(n) {
  if (n == null || n === "" || isNaN(n)) return "—";
  return toPercent(n) + "%";
}

export function percentRange(ci) {
  if (!Array.isArray(ci) || ci.length < 2) return "";
  return `range ${toPercent(ci[0])}–${toPercent(ci[1])}%`;
}