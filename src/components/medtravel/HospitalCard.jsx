import React from "react";
import { ShieldCheck, MapPin, DollarSign } from "lucide-react";

export default function HospitalCard({ hospital, deductible }) {
  const outOfPocket =
    deductible < hospital.base_cost ? deductible : hospital.base_cost;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-base font-semibold text-slate-900 leading-snug">
            {hospital.name}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5" />
            <span className="capitalize">{hospital.location_type} facility</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">
            {hospital.safety_score.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <DollarSign className="w-3.5 h-3.5" />
            Base cost
          </div>
          <div className="mt-0.5 font-heading text-lg font-semibold text-slate-900">
            ${hospital.base_cost.toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-blue-600">
            <DollarSign className="w-3.5 h-3.5" />
            Out-of-pocket
          </div>
          <div className="mt-0.5 font-heading text-lg font-semibold text-blue-700">
            ${outOfPocket.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}