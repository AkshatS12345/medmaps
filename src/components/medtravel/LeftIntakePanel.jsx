import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ScanSearch, Loader2 } from "lucide-react";

const PROCEDURES = ["Knee Replacement", "Hip Replacement", "Lasik"];

// Recovery window (in days) before it's clinically safe to fly post-procedure.
const RECOVERY_DAYS = {
  "Knee Replacement": 14,
  "Hip Replacement": 14,
  Lasik: 3,
};

const inputClass =
  "inline-block border-b-2 border-blue-400/80 bg-transparent text-white font-semibold text-center outline-none px-1 rounded-none focus:border-emerald-400 transition-colors";

const selectStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2360a5fa' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.15rem center",
  backgroundSize: "0.85em",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
};

const defaultDate = (() => {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().slice(0, 10);
})();

export default function LeftIntakePanel({ onCalculate, calculating }) {
  const [name, setName] = useState("David");
  const [location, setLocation] = useState("New York, NY");
  const [age, setAge] = useState(54);
  const [procedure, setProcedure] = useState(PROCEDURES[0]);
  const [departureDate, setDepartureDate] = useState(defaultDate);
  const [returnDate, setReturnDate] = useState("");
  const [plan, setPlan] = useState("");
  const [deductible, setDeductible] = useState(5000);

  const recoveryDays = RECOVERY_DAYS[procedure] ?? 7;

  // Auto-set the Return Date to Departure + recovery window whenever the
  // procedure or departure date changes. The user can still override it.
  useEffect(() => {
    if (!departureDate) return;
    const d = new Date(departureDate + "T00:00:00");
    d.setDate(d.getDate() + recoveryDays);
    setReturnDate(d.toISOString().slice(0, 10));
  }, [procedure, departureDate, recoveryDays]);

  // Warn if the chosen return date falls inside the recommended recovery window.
  const isEarlyReturn = (() => {
    if (!departureDate || !returnDate) return false;
    const dep = new Date(departureDate + "T00:00:00").getTime();
    const ret = new Date(returnDate + "T00:00:00").getTime();
    return ret - dep < recoveryDays * 86400000;
  })();

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-slate-800/50 backdrop-blur-xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Title */}
        <div className="px-6 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/25 border border-blue-400/30 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-blue-200" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-white leading-tight">
                AI Travel & Clinical Intake
              </h2>
              <p className="text-xs text-slate-400">
                Fill in the blanks — we'll match you globally
              </p>
            </div>
          </div>
        </div>

        {/* Mad Libs paragraph */}
        <div className="px-6 py-6">
          <div className="text-base leading-relaxed text-slate-200">
            Hello, my name is{" "}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClass} w-24`}
              aria-label="Name"
            />
            , I am currently located in{" "}
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`${inputClass} w-32`}
              aria-label="City / State"
            />
            , and I am{" "}
            <input
              type="number"
              min={0}
              value={age}
              onChange={(e) => setAge(Number(e.target.value) || 0)}
              className={`${inputClass} w-12`}
              aria-label="Age"
            />{" "}
            years old. I am looking to schedule a{" "}
            <select
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              style={selectStyle}
              className={`${inputClass} w-36 pr-6`}
              aria-label="Procedure Type"
            >
              {PROCEDURES.map((p) => (
                <option key={p} className="bg-slate-800 text-white">
                  {p}
                </option>
              ))}
            </select>{" "}
            on or around{" "}
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className={`${inputClass} w-40 [color-scheme:dark]`}
              aria-label="Departure Date"
            />
            . I plan to return home on{" "}
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className={`${inputClass} w-40 [color-scheme:dark]`}
              aria-label="Return Date"
            />
            .{" "}
            <AnimatePresence>
              {isEarlyReturn && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="block w-full mt-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-400/30 rounded-lg px-2.5 py-1.5"
                >
                  ⚠️ Clinical guidelines recommend a {recoveryDays}-day recovery
                  window before flying. Returning early increases risk.
                </motion.span>
              )}
            </AnimatePresence>{" "}
            My insurance coverage is under{" "}
            <input
              type="text"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="e.g., Blue Cross Blue Shield PPO Gold"
              className={`${inputClass} w-44 placeholder:text-slate-500`}
              aria-label="Provider & Plan Name"
            />{" "}
            with a remaining deductible of ${" "}
            <input
              type="number"
              min={0}
              value={deductible}
              onChange={(e) => setDeductible(Number(e.target.value) || 0)}
              className={`${inputClass} w-20`}
              aria-label="Remaining Deductible"
            />
            .
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <button
            onClick={() =>
              onCalculate({
                name,
                location,
                age,
                procedure,
                departureDate,
                returnDate,
                plan,
                deductible,
              })
            }
            disabled={calculating}
            className="w-full h-12 rounded-xl bg-emerald-500 text-white font-semibold text-base flex items-center justify-center gap-2.5 hover:bg-emerald-400 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.45)] disabled:opacity-70 disabled:shadow-none"
          >
            {calculating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ScanSearch className="w-5 h-5" />
            )}
            {calculating
              ? "Scanning global options…"
              : "Scan Global Options & Calculate Costs"}
          </button>
        </div>
      </div>
    </div>
  );
}