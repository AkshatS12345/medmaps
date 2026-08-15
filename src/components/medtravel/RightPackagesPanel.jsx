import React from "react";
import { BadgeCheck } from "lucide-react";
import PackageCard from "./PackageCard";

const PACKAGES = [
  {
    name: "San José Orthopedic Center",
    country: "Costa Rica",
    safetyScore: 9.4,
    procedure: 6200,
    travel: 1400,
    days: 7,
    warranty: 450,
    total: 8050,
    comparison: "$5,000 + $35k claim",
  },
  {
    name: "Apollo Health City",
    country: "India",
    safetyScore: 9.2,
    procedure: 4800,
    travel: 1800,
    days: 10,
    warranty: 500,
    total: 7100,
    comparison: "$5,000 + $35k claim",
  },
  {
    name: "Hospital Angeles",
    country: "Mexico",
    safetyScore: 8.9,
    procedure: 7000,
    travel: 950,
    days: 5,
    warranty: 400,
    total: 8350,
    comparison: "$5,000 + $35k claim",
  },
];

export default function RightPackagesPanel({ highlighted }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="rounded-2xl bg-white/80 backdrop-blur-md shadow-xl border border-white/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-transparent flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-slate-900">
            Available Bundled Packages
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <BadgeCheck className="w-3.5 h-3.5" />
            3 Verified Destinations
          </span>
        </div>

        <div
          className={`p-5 space-y-4 transition-all duration-500 ${
            highlighted ? "ring-2 ring-blue-400/40" : ""
          }`}
        >
          {PACKAGES.map((pkg) => (
            <PackageCard key={pkg.name} pkg={pkg} />
          ))}
        </div>
      </div>
    </div>
  );
}