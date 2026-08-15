import React, { useState } from "react";
import { Plane, Clock, ArrowRight, MapPin, TrendingDown } from "lucide-react";

const DESTINATIONS = [
  { id: "MAA", label: "Chennai, India (MAA)", facility: "Apollo Health City" },
  { id: "DEL", label: "Delhi, India (DEL)", facility: "Fortis, Gurgaon" },
  { id: "PVG", label: "Shanghai, China (PVG)", facility: "United Family Hospital" },
  { id: "PEK", label: "Beijing, China (PEK)", facility: "Peking Union Medical" },
];

const ROUTES = {
  MAA: [
    { airline: "Qatar Airways", stops: ["DOH"], duration: "19h 45m", price: 612 },
    { airline: "Emirates", stops: ["DXB"], duration: "20h 10m", price: 648 },
    { airline: "Lufthansa", stops: ["FRA"], duration: "21h 05m", price: 705 },
  ],
  DEL: [
    { airline: "Air India", stops: [], duration: "15h 30m", price: 540 },
    { airline: "Qatar Airways", stops: ["DOH"], duration: "18h 20m", price: 575 },
    { airline: "United + Lufthansa", stops: ["EWR", "FRA"], duration: "19h 50m", price: 630 },
  ],
  PVG: [
    { airline: "Cathay Pacific", stops: ["HKG"], duration: "19h 05m", price: 588 },
    { airline: "United", stops: ["NRT"], duration: "17h 40m", price: 642 },
    { airline: "ANA", stops: ["NRT"], duration: "18h 15m", price: 679 },
  ],
  PEK: [
    { airline: "Air China", stops: [], duration: "13h 50m", price: 615 },
    { airline: "United", stops: ["NRT"], duration: "16h 25m", price: 660 },
    { airline: "Korean Air", stops: ["ICN"], duration: "17h 10m", price: 695 },
  ],
};

const selectStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2360a5fa' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.2rem center",
  backgroundSize: "0.85em",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
};

export default function FlightPathTab() {
  const [dest, setDest] = useState("MAA");
  const routes = ROUTES[dest];
  const cheapest = routes[0].price;
  const destLabel = DESTINATIONS.find((d) => d.id === dest);

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Origin → Destination selector */}
      <div className="rounded-2xl bg-slate-800/50 border border-white/10 p-4">
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-200">
            <MapPin className="w-4 h-4 text-blue-300" />
            <span className="font-medium">JFK · New York</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <select
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            style={selectStyle}
            className="bg-transparent border-b-2 border-blue-400/80 text-white font-semibold px-1 pr-6 outline-none focus:border-emerald-400 transition-colors"
          >
            {DESTINATIONS.map((d) => (
              <option key={d.id} value={d.id} className="bg-slate-800 text-white">
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Cheapest routes to {destLabel.facility}
        </p>
      </div>

      {/* Lowest fare badge */}
      <div className="flex items-center gap-2 text-sm text-emerald-300">
        <TrendingDown className="w-4 h-4" />
        Lowest fare: <span className="font-semibold">${cheapest}</span>
      </div>

      {/* Route list */}
      <div className="space-y-3">
        {routes.map((r, i) => (
          <div
            key={i}
            className="rounded-2xl bg-slate-800/50 border border-white/10 p-4 hover:border-blue-400/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {i === 0 && (
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 uppercase tracking-wide">
                      Cheapest
                    </span>
                  )}
                  <h3 className="font-heading text-sm font-semibold text-white">
                    {r.airline}
                  </h3>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-300 flex-wrap">
                  <span className="font-medium text-white">JFK</span>
                  {r.stops.map((s) => (
                    <span key={s} className="flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span>{s}</span>
                    </span>
                  ))}
                  <span className="flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="font-medium text-white">{dest}</span>
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-heading text-lg font-bold text-white">
                  ${r.price}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3" />
                  {r.duration}
                </p>
              </div>
            </div>

            <div className="mt-2 text-xs text-slate-400">
              {r.stops.length === 0
                ? "Nonstop"
                : `${r.stops.length} stop${r.stops.length > 1 ? "s" : ""} · ${r.stops.join(", ")}`}
            </div>

            <button className="mt-3 w-full h-9 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors">
              <Plane className="w-3.5 h-3.5" />
              Book Flight
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}