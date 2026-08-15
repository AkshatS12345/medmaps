import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/medtravel/Header";
import Globe from "@/components/medtravel/Globe";
import LeftIntakePanel from "@/components/medtravel/LeftIntakePanel";
import RightResultsPanel from "@/components/medtravel/RightResultsPanel";
import CartFab from "@/components/medtravel/CartFab";
import CartFlyLayer from "@/components/medtravel/CartFlyLayer";
import CartDrawer from "@/components/medtravel/CartDrawer";
import CheckoutModal from "@/components/medtravel/CheckoutModal";
import { useCart } from "@/context/CartContext";
import { api, generateSessionId } from "@/lib/api";
import { base44 } from "@/api/base44Client";

const JFK_MARKER = { location: [40.6413, -73.7781], size: 0.06 };

// Every destination MedMaps covers, plus a few US anchors, so the globe reads
// as a real network before a search has run.
const WORLD_MARKERS = [
  JFK_MARKER,
  { location: [9.9939, -84.2088], size: 0.045 }, // Costa Rica
  { location: [9.0714, -79.3835], size: 0.04 }, // Panama
  { location: [18.4297, -69.6689], size: 0.04 }, // Dominican Republic
  { location: [32.5411, -116.9702], size: 0.045 }, // Mexico
  { location: [4.7016, -74.1469], size: 0.045 }, // Colombia
  { location: [-23.4356, -46.4731], size: 0.045 }, // Brazil
  { location: [40.4719, -3.5626], size: 0.045 }, // Spain
  { location: [52.1657, 20.9671], size: 0.04 }, // Poland
  { location: [50.1008, 14.26], size: 0.04 }, // Czech Republic
  { location: [54.6341, 25.2858], size: 0.035 }, // Lithuania
  { location: [41.2753, 28.7519], size: 0.05 }, // Turkey
  { location: [31.7226, 35.9932], size: 0.035 }, // Jordan
  { location: [25.2532, 55.3657], size: 0.045 }, // UAE
  { location: [12.9941, 80.1709], size: 0.055 }, // India (Chennai)
  { location: [28.4595, 77.0266], size: 0.04 }, // India (Delhi)
  { location: [12.9716, 77.5946], size: 0.04 }, // India (Bengaluru)
  { location: [13.69, 100.7501], size: 0.05 }, // Thailand
  { location: [2.7456, 101.7099], size: 0.04 }, // Malaysia
  { location: [1.3644, 103.9915], size: 0.045 }, // Singapore
  { location: [37.4602, 126.4407], size: 0.045 }, // South Korea
  { location: [25.0777, 121.2328], size: 0.04 }, // Taiwan
  { location: [14.5086, 121.0194], size: 0.04 }, // Philippines
  // US anchors — where patients start from.
  { location: [34.0522, -118.2437], size: 0.035 }, // Los Angeles
  { location: [41.8781, -87.6298], size: 0.035 }, // Chicago
  { location: [29.7604, -95.3698], size: 0.035 }, // Houston
  { location: [25.7617, -80.1918], size: 0.035 }, // Miami
];

// Real destinations from /quote/international, sized by how much each saves.
// Options excluded by the traveller's own constraints are drawn smaller.
function globeMarkers(international) {
  const opts = international?.options || [];
  const withCoords = opts.filter(
    (o) => typeof o.lat === "number" && typeof o.lon === "number"
  );
  if (!withCoords.length) return WORLD_MARKERS;

  const best = Math.max(
    ...withCoords.map((o) => Number(o.savings_vs_domestic) || 0),
    1
  );

  // One marker per country — several hospitals can share a destination.
  const seen = new Map();
  for (const o of withCoords) {
    const prev = seen.get(o.country);
    if (!prev || (o.savings_vs_domestic || 0) > (prev.savings_vs_domestic || 0)) {
      seen.set(o.country, o);
    }
  }

  return [
    JFK_MARKER,
    ...[...seen.values()].map((o) => {
      const ratio = Math.max(0, (Number(o.savings_vs_domestic) || 0) / best);
      return {
        location: [o.lat, o.lon],
        size: o.excluded_by_constraint ? 0.03 : 0.04 + ratio * 0.06,
      };
    }),
  ];
}

// Top eligible destinations, one per country, for the globe overlay.
function globeLegend(international) {
  const opts = (international?.options || []).filter(
    (o) => !o.excluded_by_constraint
  );
  const seen = new Map();
  for (const o of opts) {
    const prev = seen.get(o.country);
    if (!prev || (o.savings_vs_domestic || 0) > prev.savings) {
      seen.set(o.country, {
        country: o.country,
        savings: Number(o.savings_vs_domestic) || 0,
      });
    }
  }
  return [...seen.values()]
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 4);
}

// One clickable pin per hospital that has coordinates.
function globePicks(international) {
  return (international?.options || [])
    .filter((o) => typeof o.lat === "number" && typeof o.lon === "number")
    .map((o, i) => ({
      key: `${o.hospital_id || i}`,
      lat: o.lat,
      lon: o.lon,
      label: o.name,
      sublabel: `${o.country} · $${Math.round(o.true_cost).toLocaleString()}`,
      dim: !!o.excluded_by_constraint,
      option: o,
    }));
}

const EASE = [0.22, 1, 0.36, 1];
const DURATION = 0.7;

function buildText(form) {
  const parts = [];
  parts.push(`I'm a ${form.age}-year-old in ${form.location}.`);
  parts.push(`I'm looking to schedule a ${form.procedure}.`);
  if (form.plan_id && form.planLabel) {
    parts.push(`My insurance is ${form.planLabel}.`);
  } else if (form.coverage === "high_deductible") {
    parts.push(`I'm on a high-deductible health plan.`);
  } else if (form.coverage === "standard") {
    parts.push(`I'm on a standard employer health plan.`);
  } else {
    parts.push(`I'm uninsured.`);
  }
  if (form.deductible) {
    parts.push(`My remaining deductible is $${form.deductible}.`);
  }
  if (form.departureDate) {
    parts.push(
      `I'd like to depart around ${form.departureDate}${
        form.returnDate ? ` and return ${form.returnDate}` : ""
      }.`
    );
  }
  return parts.join(" ");
}

// /explain returns facts + instruction. Send instruction as the system prompt
// and facts as the content; the LLM writes prose only.
async function runExplain(sessionId, procedureName) {
  const { facts, instruction } = await api.explain(sessionId, procedureName);
  let content;
  if (Array.isArray(facts)) {
    content = facts
      .map((f) => (typeof f === "string" ? f : f.fact || JSON.stringify(f)))
      .join("\n");
  } else if (facts && typeof facts === "object") {
    content = JSON.stringify(facts, null, 2);
  } else {
    content = String(facts || "");
  }
  const prompt = `${instruction}\n\nFacts:\n${content}\n\nWrite only prose. Do not calculate, re-rank, round, or introduce any number not present in the facts above.`;
  const res = await base44.integrations.Core.InvokeLLM({ prompt });
  return typeof res === "string" ? res : res?.output || res?.text || "";
}

export default function MedMaps() {
  // One session_id per app load, reused for every call.
  const [sessionId] = useState(generateSessionId);
  const [status, setStatus] = useState("idle"); // idle | loading | results
  const [intake, setIntake] = useState(null);
  const [domestic, setDomestic] = useState(null);
  const [international, setInternational] = useState(null);
  const [explainProse, setExplainProse] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("domestic");
  const [checkout, setCheckout] = useState(null);
  const [error, setError] = useState(null);
  // A facility chosen from a card, the globe, or a marker — drives TripBuilder.
  const [selected, setSelected] = useState(null);
  const { count, openCart, addItem } = useCart();

  const handleSubmit = async (form) => {
    console.log("[MedMaps] handleSubmit start", { sessionId, form });
    setStatus("loading");
    setError(null);
    setDomestic(null);
    setInternational(null);
    setSelected(null);
    setExplainProse("");
    try {
      const text = buildText(form);
      console.log("[MedMaps] POST /intake", { sessionId, text });
      const intakeRes = await api.intake(sessionId, text);
      console.log("[MedMaps] /intake done", intakeRes);
      setIntake(intakeRes);

      console.log("[MedMaps] POST /quote/domestic");
      const dom = await api.quoteDomestic(sessionId, {
        procedure_name: intakeRes.procedure_name,
        user_deductible: form.deductible ?? intakeRes.user_deductible,
        // The explicit selector wins over whatever the text parser inferred.
        coverage: form.coverage || intakeRes.coverage || "uninsured",
        state: intakeRes.state,
        plan_id: form.plan_id,
      });
      console.log("[MedMaps] /quote/domestic done", dom);
      setDomestic(dom);
      setActiveTab("domestic");
      // Render domestic immediately — don't wait for international.
      setStatus("results");

      // /explain runs InvokeLLM (slow). Fire it only after results are on
      // screen, in its own try/catch, so it can never gate the table.
      setExplainLoading(true);
      runExplain(sessionId, intakeRes.procedure_name)
        .then((prose) => {
          console.log("[MedMaps] /explain done");
          setExplainProse(prose);
        })
        .catch((e) => console.warn("[MedMaps] /explain failed", e))
        .finally(() => setExplainLoading(false));

      // International auto-loads right after domestic, populating its tab.
      setCompareLoading(true);
      try {
        console.log("[MedMaps] POST /quote/international");
        const intl = await api.quoteInternational(
          sessionId,
          intakeRes.procedure_name
        );
        console.log("[MedMaps] /quote/international done", intl);
        setInternational(intl);
      } catch (e) {
        console.error("[MedMaps] /quote/international failed", e);
      } finally {
        setCompareLoading(false);
      }
    } catch (e) {
      console.error("[MedMaps] handleSubmit failed", e);
      setError(e?.message || String(e));
      setStatus("idle");
    }
  };

  const handleCompareInternational = async () => {
    if (!intake) return;
    setCompareLoading(true);
    try {
      const res = await api.quoteInternational(sessionId, intake.procedure_name);
      setInternational(res);
      setActiveTab("international");
    } finally {
      setCompareLoading(false);
    }
  };

  const handleCheckout = async (option, hotelName, flightId) => {
    const hospitalId = option.hospital_id || option.id || option.name;
    try {
      const res = await api.checkout(sessionId, hospitalId, hotelName, flightId);
      setCheckout(res);
    } catch {
      /* API never returns errors per spec */
    }
  };

  const handleBack = () => setStatus("idle");

  // Adds a hospital's real API fields (name, base_cost, expected_cost) to the
  // cart. Works for both domestic (expected_cost) and international (true_cost).
  const handleAddToCart = (option) => {
    const location = [option.city, option.state || option.country]
      .filter(Boolean)
      .join(", ");
    const unitPrice =
      Number(option.expected_cost ?? option.true_cost ?? option.base_cost) || 0;
    addItem({
      category: "procedure",
      itemName: `${intake?.procedure_name || "Procedure"} — ${option.name}`,
      description: `${option.name}${location ? ", " + location : ""}`,
      provider: option.name,
      location,
      unitPrice,
      quantity: 1,
      metadata: {
        base_cost: option.base_cost,
        expected_cost: option.expected_cost ?? option.true_cost,
        hospital_id: option.hospital_id,
      },
    });

    // A chosen flight is its own line item.
    if (option.flight) {
      addItem({
        category: "flight",
        itemName: `${option.flight.carrier} — ${option.flight.origin}→${option.flight.destination}`,
        description: `${
          option.flight.stops === 0 ? "Non-stop" : `${option.flight.stops} stop`
        } · ${option.flight.duration}`,
        provider: option.flight.carrier,
        location,
        unitPrice: Number(option.flight.price) || 0,
        quantity: 1,
        metadata: { flight_id: option.flight.flight_id },
      });
    }

    // A chosen recovery hotel is a separate real line item, not part of the procedure.
    if (option.hotel) {
      addItem({
        category: "hotel",
        itemName: option.hotel.name,
        description: `${option.hotel.nights} nights, ${option.hotel.distance_miles} mi from ${option.name}`,
        provider: option.hotel.name,
        location,
        unitPrice: Number(option.hotel.total) || 0,
        quantity: 1,
        metadata: {
          nightly_rate: option.hotel.nightly_rate,
          distance_miles: option.hotel.distance_miles,
          source: "OpenStreetMap",
        },
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6 min-h-0">
        <div className="relative w-full h-full max-w-[1400px] overflow-hidden rounded-3xl border border-white/10">
          {/* Intake form — left half, exits to the left */}
          <AnimatePresence>
            {status !== "results" && (
              <motion.div
                key="intake"
                className="absolute top-0 left-0 h-full w-[46%] flex items-center justify-center p-4 z-10"
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-120%", opacity: 0 }}
                transition={{ duration: DURATION, ease: EASE }}
              >
                <LeftIntakePanel
                  onCalculate={handleSubmit}
                  calculating={status === "loading"}
                />
                {error && (
                  <div className="mt-3 w-full max-w-md rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm">
                    <p className="font-semibold text-red-200">
                      Something went wrong
                    </p>
                    <p className="text-red-200/80 text-xs mt-0.5">{error}</p>
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="mt-1.5 text-xs text-red-300 hover:text-white underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Globe lives on the intake screen only. In results it was taking half
              the viewport to show decoration while the data fought for space. */}
          <AnimatePresence>
            {status !== "results" && (
              <motion.div
                key="globe"
                className="absolute top-0 left-[48%] h-full w-[52%]"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(13,148,136,0.14), transparent 65%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION, ease: EASE }}
              >
                <Globe markers={globeMarkers(international)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results take the full width. */}
          <AnimatePresence>
            {status === "results" && (
              <motion.div
                key="results"
                className="absolute inset-0"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: DURATION, ease: EASE }}
              >
                <RightResultsPanel
                  intake={intake}
                  domestic={domestic}
                  international={international}
                  explainProse={explainProse}
                  explainLoading={explainLoading}
                  compareLoading={compareLoading}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  selected={selected}
                  onSelect={setSelected}
                  onAddToCart={handleAddToCart}
                  onCheckout={handleCheckout}
                  onBack={handleBack}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating shopping cart — fixed bottom-left, opens the cart drawer */}
      <CartFab count={count} onClick={openCart} />
      <CartDrawer />
      <CartFlyLayer />

      <CheckoutModal data={checkout} onClose={() => setCheckout(null)} />
    </div>
  );
}