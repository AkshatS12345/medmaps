// Thin client for the MedMaps backend. No auth; CORS is open. A single
// session_id is generated once per app load and sent on every call so the
// backend can keep context between steps.

const BASE_URL = "https://medmap-api-kn44.onrender.com";

export function generateSessionId() {
  return (
    "sess_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
  );
}

async function postJson(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

async function getJson(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

export const api = {
  procedures: () => getJson("/procedures"),
  plans: (state, q) =>
    getJson(
      `/plans?state=${encodeURIComponent(state || "")}&q=${encodeURIComponent(
        q || ""
      )}`
    ),
  intake: (session_id, text) => postJson("/intake", { session_id, text }),
  quoteDomestic: (session_id, params) =>
    postJson("/quote/domestic", { session_id, ...params }),
  quoteInternational: (session_id, procedure_name) =>
    postJson("/quote/international", { session_id, procedure_name }),
  explain: (session_id, procedure_name) =>
    postJson("/explain", { session_id, procedure_name }),
  checkout: (session_id, hospital_id) =>
    postJson("/checkout", { session_id, hospital_id }),
};