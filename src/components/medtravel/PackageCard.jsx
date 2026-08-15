import React from "react";
import { ShieldCheck, Plane, BriefcaseMedical, CreditCard } from "lucide-react";

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Icon className="w-4 h-4 text-slate-400" />
        {label}
      </div>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}

export default function PackageCard({ pkg }) {
  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-white/70 overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-base font-semibold text-slate-900 leading-snug">
            {pkg.name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">{pkg.country}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">
            {pkg.safetyScore.toFixed(1)}/10
          </span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="px-5 py-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
          Package Breakdown
        </p>
        <div className="divide-y divide-slate-100">
          <Row icon={BriefcaseMedical} label="Procedure" value={`$${pkg.procedure.toLocaleString()}`} />
          <Row icon={Plane} label={`Travel & Lodging (${pkg.days} Days)`} value={`$${pkg.travel.toLocaleString()}`} />
          <Row icon={ShieldCheck} label="180-Day Complication Warranty" value={`$${pkg.warranty.toLocaleString()}`} />
        </div>
      </div>

      {/* Total */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500">Total Bundled Price</p>
            <p className="font-heading text-2xl font-bold text-slate-900">
              ${pkg.total.toLocaleString()}
            </p>
          </div>
          {pkg.comparison && (
            <p className="text-xs text-slate-500 text-right max-w-[150px]">
              vs. US out-of-pocket<br />
              <span className="font-medium text-slate-700">{pkg.comparison}</span>
            </p>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="px-5 py-4">
        <button className="w-full h-11 rounded-xl bg-blue-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
          <CreditCard className="w-4 h-4" />
          Select Package & Split-Pay
        </button>
      </div>
    </div>
  );
}