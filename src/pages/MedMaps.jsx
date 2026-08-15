import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/medtravel/Header";
import Globe from "@/components/medtravel/Globe";
import LeftIntakePanel from "@/components/medtravel/LeftIntakePanel";
import RightResultsPanel from "@/components/medtravel/RightResultsPanel";
import CartFab from "@/components/medtravel/CartFab";
import CheckoutModal from "@/components/medtravel/CheckoutModal";
import { useCart } from "@/context/CartContext";
import { api, generateSessionId } from "@/lib/api";
import { base44 } from "@/api/base44Client";

// Decorative globe markers (the globe is a visual; real options come from the API).
const GLOBE_MARKERS = [
  { location: [13.0827, 80.2707], size: 0.06 },
  { location: [28.4595, 77.0266], size: 0.06 },
  { location: [31.2304, 121.4737], size: 0.06 },
  { location: [40.7128, -74.006], size: 0.06 },
];

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
  const { count, openCart, addItem } = useCart();

  const handleSubmit = async (form) => {
    console.log("[MedMaps] handleSubmit start", { sessionId, form });
    setStatus("loading");
    setError(null);
    setDomestic(null);
    setInternational(null);
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

  const handleCheckout = async (option) => {
    const hospitalId = option.hospital_id || option.id || option.name;
    try {
      const res = await api.checkout(sessionId, hospitalId);
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
                className="absolute top-0 left-0 h-full w-1/2 flex items-center justify-center p-4"
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

          {/* Globe — starts on the right half, slides to the left half */}
          <motion.div
            className="absolute top-0 left-1/2 h-full w-1/2"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(13,148,136,0.12), transparent 60%)",
            }}
            animate={{ x: status === "results" ? "-100%" : "0%" }}
            transition={{ duration: DURATION, ease: EASE }}
          >
            <Globe markers={GLOBE_MARKERS} />
          </motion.div>

          {/* Results panel — right half, slides in from the right */}
          <AnimatePresence>
            {status === "results" && (
              <motion.div
                key="results"
                className="absolute top-0 left-1/2 h-full w-1/2"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
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
      <CartFab ref={null} count={count} onClick={openCart} />

      <CheckoutModal data={checkout} onClose={() => setCheckout(null)} />
    </div>
  );
}