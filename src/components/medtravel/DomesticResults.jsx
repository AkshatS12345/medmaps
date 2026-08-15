import React from "react";
import { AlertTriangle } from "lucide-react";
import { money, percent, percentRange } from "@/lib/format";

function Spread({ spread }) {
  if (!spread) return null;
  const { min, max, hospital_count, multiple } = spread;
  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-600/20 to-slate-800/40 border border-blue-400/30 p-4">
      <p className="text-xs uppercase tracking-wide text-blue-200/80 mb-1">
        Price spread
      </p>
      <h2 className="font-heading text-base font-semibold text-white leading-snug">
        The same procedure costs {money(min)} to {money(max)} across{" "}
        {Number(hospital_count).toLocaleString()} US hospitals — {multiple}x.
      </h2>
    </div>
  );
}

function RankInversion({ ri }) {
  // The most important element on the page. May be null — hide if so.
  if (!ri || !ri.note) return null;
  return (
    <div className="rounded-2xl border-2 border-amber-400/50 bg-amber-500/10 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <AlertTriangle className="w-4 h-4 text-amber-300" />
        <h3 className="font-heading text-sm font-semibold text-amber-200">
          Cheaper isn't cheaper.
        </h3>
      </div>
      <p className="text-sm text-amber-100/90 leading-relaxed">{ri.note}</p>
    </div>
  );
}

// Every figure is visible at once — nothing behind a toggle — and each card has
// exactly one action. The package is assembled in the trip builder, which is the
// only place anything reaches the cart.
function OptionRow({ o, rank, onSelect }) {
  return (
    <div className="rounded-xl bg-slate-800/40 border border-white/10 p-3 hover:border-white/20 transition-colors">
      <div className="flex items-start gap-2.5">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center mt-0.5">
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-white leading-snug">
            {o.name}
          </h4>
          <p className="text-[11px] text-slate-400">
            {o.city ? `${o.city}, ` : ""}
            {o.state}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">
            Expected total
          </p>
          <p className="font-heading text-lg font-bold text-white leading-tight">
            {money(o.expected_cost)}
          </p>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-4 gap-2 text-[11px]">
        <div>
          <p className="text-slate-500">Billed</p>
          <p className="text-slate-500 line-through">{money(o.billed_charge)}</p>
        </div>
        <div>
          <p className="text-slate-500">Negotiated</p>
          <p className="text-slate-300">{money(o.base_cost)}</p>
        </div>
        <div>
          <p className="text-slate-500">You pay</p>
          <p className="text-slate-200">{money(o.out_of_pocket)}</p>
        </div>
        <div>
          <p className="text-slate-500">Complication</p>
          <p className="text-slate-200">
            {percent(o.complication_rate)}
            {o.complication_ci ? (
              <span className="block text-slate-500">
                {percentRange(o.complication_ci)}
              </span>
            ) : (
              <span className="block text-slate-600">national avg</span>
            )}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSelect?.(o)}
        className="mt-3 w-full h-9 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-colors"
      >
        Select this hospital →
      </button>
    </div>
  );
}

function OptionsList({ options, onSelect }) {
  // CMS publishes a per-hospital complication rate for hip and knee only. For
  // everything else every hospital carries the same national rate, so ranking
  // by expected cost reduces to ranking by price — say so rather than imply
  // a differentiation that is not in the data.
  const perHospitalRisk = options.some((o) => o.complication_ci);
  // Options arrive sorted by expected cost. Do not re-sort.
  return (
    <div className="space-y-2.5">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">
        {options.length} hospitals · ranked by expected total
      </p>
      {!perHospitalRisk && (
        <p className="text-[11px] text-slate-400 bg-slate-800/40 border border-white/10 rounded-lg px-3 py-2">
          CMS publishes a per-hospital complication rate for hip and knee
          replacement only. Every hospital below carries the same national rate
          for this procedure, so this ranking reflects price alone.
        </p>
      )}
      {options.map((o, i) => (
        <OptionRow
          key={o.hospital_id || i}
          o={o}
          rank={i + 1}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export default function DomesticResults({ data, onSelect }) {
  if (!data) return null;
  const { options, price_spread, rank_inversion, degraded } = data;
  return (
    <div className="space-y-4">
      {degraded && <p className="text-[11px] text-slate-500">cached estimates</p>}
      <Spread spread={price_spread} />
      <RankInversion ri={rank_inversion} />
      {Array.isArray(options) && options.length > 0 && (
        <OptionsList options={options} onSelect={onSelect} />
      )}
    </div>
  );
}
