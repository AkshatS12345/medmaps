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
  const { count, openCart } = useCart();

  const handleSubmit = async (form) => {
    setStatus("loading");
    try {
      const text = buildText(form);
      const intakeRes = await api.intake(sessionId, text);
      setIntake(intakeRes);

      // Fire /explain + LLM in the background while the domestic quote loads.
      setExplainLoading(true);
      runExplain(sessionId, intakeRes.procedure_name)
        .then(setExplainProse)
        .catch(() => {})
        .finally(() => setExplainLoading(false));

      const dom = await api.quoteDomestic(sessionId, {
        procedure_name: intakeRes.procedure_name,
        user_deductible: intakeRes.user_deductible,
        coverage: intakeRes.coverage,
        state: intakeRes.state,
        plan_id: form.plan_id,
      });
      setDomestic(dom);
      setInternational(null);
      setExplainProse("");
      setActiveTab("domestic");
      setStatus("results");
    } catch {
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
    const hospitalId = option.id || option.name;
    try {
      const res = await api.checkout(sessionId, hospitalId);
      setCheckout(res);
    } catch {
      /* API never returns errors per spec */
    }
  };

  const handleBack = () => setStatus("idle");

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
                  onCompareInternational={handleCompareInternational}
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