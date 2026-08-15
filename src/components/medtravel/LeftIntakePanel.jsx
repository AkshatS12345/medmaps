import React, { useState } from "react";
import { Sparkles, ScanSearch } from "lucide-react";

const PROCEDURES = [
  "Knee Replacement",
  "Hip Replacement",
  "Lasik",
  "Cataract Surgery",
  "Coronary Bypass",
];

const INSURERS = [
  "Blue Cross",
  "Aetna",
  "UnitedHealthcare",
  "Cigna",
  "Humana",
  "Uninsured",
];

const inputClass =
  "inline-block border-b-2 border-blue-500 bg-transparent text-white font-bold text-center outline-none px-1 rounded-none focus:border-emerald-400 transition-colors";

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

export default function LeftIntakePanel({ onCalculate, calculating }) {
  const [name, setName] = useState("David");
  const [age, setAge] = useState(54);
  const [procedure, setProcedure] = useState(PROCEDURES[0]);
  const [insurer, setInsurer] = useState(INSURERS[0]);
  const [deductible, setDeductible] = useState(5000);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl bg-slate-800/50 backdrop-blur-xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Title */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
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
          <p className="text-base leading-relaxed text-slate-200">
            Hello, my name is{" "}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClass} w-24`}
              aria-label="Name"
            />{" "}
            and I am{" "}
            <input
              type="number"
              min={0}
              value={age}
              onChange={(e) => setAge(Number(e.target.value) || 0)}
              className={`${inputClass} w-12`}
              aria-label="Age"
            />{" "}
            years old. I am currently looking for an affordable{" "}
            <select
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              style={selectStyle}
              className={`${inputClass} w-40 pr-6`}
              aria-label="Procedure Type"
            >
              {PROCEDURES.map((p) => (
                <option key={p} className="bg-slate-800 text-white">
                  {p}
                </option>
              ))}
            </select>{" "}
            procedure. My current health insurance is through{" "}
            <select
              value={insurer}
              onChange={(e) => setInsurer(e.target.value)}
              style={selectStyle}
              className={`${inputClass} w-32 pr-6`}
              aria-label="Insurance Provider"
            >
              {INSURERS.map((i) => (
                <option key={i} className="bg-slate-800 text-white">
                  {i}
                </option>
              ))}
            </select>{" "}
            and my remaining deductible is ${" "}
            <input
              type="number"
              min={0}
              value={deductible}
              onChange={(e) => setDeductible(Number(e.target.value) || 0)}
              className={`${inputClass} w-20`}
              aria-label="Remaining Deductible"
            />
            .
          </p>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <button
            onClick={onCalculate}
            disabled={calculating}
            className="w-full h-12 rounded-xl bg-emerald-500 text-white font-semibold text-base flex items-center justify-center gap-2.5 hover:bg-emerald-400 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.45)] disabled:opacity-70 disabled:shadow-none"
          >
            <ScanSearch className="w-5 h-5" />
            {calculating ? "Scanning global options…" : "Scan Global Options & Calculate Costs"}
          </button>
        </div>
      </div>
    </div>
  );
}