import React from "react";

// Small chips showing what the /intake endpoint understood from the user's text.
const CATEGORY_COLOR = {
  procedure: "bg-blue-500/15 text-blue-200 border-blue-400/30",
  cost: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  insurance: "bg-purple-500/15 text-purple-200 border-purple-400/30",
  travel: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  default: "bg-slate-600/20 text-slate-200 border-slate-400/30",
};

export default function FactsChips({ facts }) {
  if (!Array.isArray(facts) || facts.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {facts.map((f, i) => {
        const text = typeof f === "string" ? f : f.fact || JSON.stringify(f);
        const cat =
          (typeof f === "object" && f && f.category) || "default";
        const color = CATEGORY_COLOR[cat] || CATEGORY_COLOR.default;
        return (
          <span
            key={i}
            className={`text-[11px] rounded-full px-2 py-0.5 border ${color}`}
          >
            {text}
          </span>
        );
      })}
    </div>
  );
}