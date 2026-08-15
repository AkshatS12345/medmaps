import React, { useState } from "react";
import { Calculator, Globe, AlertTriangle } from "lucide-react";
import HospitalCard from "./HospitalCard";
import WarningModal from "./WarningModal";

const PROCEDURES = [
  "Total Knee Replacement",
  "Hip Replacement",
  "Coronary Bypass",
  "Spinal Fusion",
];

const INSURERS = [
  "Blue Cross Blue Shield",
  "UnitedHealthcare",
  "Aetna",
  "Cigna",
  "Humana",
  "Uninsured",
];

export default function SidePanel({ hospitals }) {
  const [procedure, setProcedure] = useState(PROCEDURES[0]);
  const [insurer, setInsurer] = useState(INSURERS[0]);
  const [deductible, setDeductible] = useState(5000);
  const [calculated, setCalculated] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCalculate = () => setCalculated(true);

  const filtered = (calculated ? hospitals : []).filter(
    (h) =>
      h.procedure_name === procedure &&
      h.safety_score >= 8.6
  );

  return (
    <div className="relative w-full max-w-md">
      <div className="rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header strip */}
        <div className="px-6 pt-6 pb-5 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <h1 className="font-heading text-xl font-semibold text-slate-900">
            Domestic Cost Estimator
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Compare out-of-pocket costs for domestic procedures.
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Procedure */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Procedure Type
            </label>
            <select
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
            >
              {PROCEDURES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Insurance */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Insurance Provider
            </label>
            <select
              value={insurer}
              onChange={(e) => setInsurer(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
            >
              {INSURERS.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>

          {/* Deductible */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Remaining Deductible
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                $
              </span>
              <input
                type="number"
                value={deductible}
                min={0}
                onChange={(e) =>
                  setDeductible(Number(e.target.value) || 0)
                }
                className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-7 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full h-11 rounded-lg bg-[hsl(var(--primary))] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Calculator className="w-4 h-4" />
            Calculate Costs
          </button>
        </div>

        {/* Results */}
        <div className="px-6 pb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-sm font-semibold text-slate-700">
              Matching Facilities
            </h2>
            <span className="text-xs text-slate-400">
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <AlertTriangle className="w-5 h-5 text-slate-400 mx-auto" />
              <p className="mt-2 text-sm text-slate-500">
                No domestic facilities meet the minimum safety score of 8.6 for
                this procedure.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((h) => (
                <HospitalCard
                  key={h.id}
                  hospital={h}
                  deductible={deductible}
                />
              ))}
            </div>
          )}
        </div>

        {/* Divider + Gateway */}
        <div className="px-6 pb-6">
          <div className="border-t border-slate-200 my-1" />
          <div className="pt-4">
            <p className="text-xs text-slate-500 mb-2.5 text-center">
              Domestic costs too high? Explore international alternatives.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="w-full h-12 rounded-lg bg-amber-500 text-slate-900 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors shadow-md ring-1 ring-amber-600/20"
            >
              <Globe className="w-4.5 h-4.5" />
              Find Cheaper Options (International)
            </button>
          </div>
        </div>
      </div>

      <WarningModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}