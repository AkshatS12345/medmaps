import React, { useState } from "react";
import { ShieldCheck, Plane, MapPin, Check, ShoppingCart } from "lucide-react";
import { calculateLogistics } from "@/lib/logistics";

export default function FacilityCard({ facility, intake, onAddToCart }) {
  const isDomestic = facility.type === "domestic";
  const [added, setAdded] = useState(false);

  const logistics =
    !isDomestic && intake
      ? calculateLogistics(
          intake.location,
          facility.location,
          intake.procedure,
          { departure: intake.departureDate, return: intake.returnDate }
        )
      : null;

  const handleClick = (e) => {
    if (added) return;
    setAdded(true);
    onAddToCart?.(e);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="rounded-2xl bg-slate-800/50 backdrop-blur-md border border-white/10 p-4 hover:border-blue-400/40 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-blue-200" />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading text-sm font-semibold text-white leading-snug">
              {facility.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {facility.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 border border-emerald-400/30 flex-shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
          <span className="text-xs font-semibold text-emerald-200">
            {facility.safety}/10
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
        <Plane className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        {isDomestic ? (
          <span className="rounded-full bg-slate-600/40 px-2 py-0.5 text-slate-200">
            Domestic Baseline
          </span>
        ) : (
          <span>
            Estimated Flight &amp; Lodging:{" "}
            <span className="font-medium text-white">{logistics}</span>
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleClick}
        className={`mt-3 w-full h-9 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
          added
            ? "bg-emerald-600 text-white"
            : isDomestic
            ? "bg-slate-700 hover:bg-slate-600 text-white"
            : "bg-emerald-500 hover:bg-emerald-400 text-white"
        }`}
      >
        {added ? (
          <>
            <Check className="w-3.5 h-3.5" />
            Added!
          </>
        ) : (
          <>
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
          </>
        )}
      </button>
    </div>
  );
}