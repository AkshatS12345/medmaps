import React from "react";
import { Plane } from "lucide-react";
import { money } from "@/lib/format";

// Stacked bar split into Procedure / Travel / Coverage. travel_cost already
// equals flight + lodging, so only that is used — summing all three would
// double-count the travel segment.
function StackedBar({ o }) {
  const proc = Number(o.base_cost) || 0;
  const travel = Number(o.travel_cost) || 0;
  const warranty = Number(o.warranty_cost) || 0;
  const denom = proc + travel + warranty || 1;
  const seg = (v) => `${(v / denom) * 100}%`;

  return (
    <div>
      <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-slate-700">
        <div style={{ width: seg(proc) }} className="bg-blue-500" />
        <div style={{ width: seg(travel) }} className="bg-amber-500" />
        <div style={{ width: seg(warranty) }} className="bg-purple-500" />
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[10px] text-slate-300">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-blue-500" />
          Procedure {money(proc)}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-amber-500" />
          Flight + stay {money(travel)}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-purple-500" />
          Coverage {money(warranty)}
        </span>
      </div>
    </div>
  );
}

function RiskPanel({ o }) {
  const d = o.distribution;
  if (!d) return null;
  const p99u = Number(d.p99_uncovered) || 0;
  const p99 = Number(d.p99) || 0;
  const max = Math.max(p99u, p99) || 1;
  const bar = (v) => `${(v / max) * 100}%`;

  return (
    <div className="rounded-2xl bg-slate-800/50 border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Plane className="w-4 h-4 text-blue-300" />
        <h4 className="font-heading text-sm font-semibold text-white">
          Risk: {o.name}, {o.country}
        </h4>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300">Worst case without coverage</span>
            <span className="text-white font-semibold">
              {money(d.p99_uncovered)}
            </span>
          </div>
          <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
            <div className="h-3 rounded-full bg-red-500" style={{ width: bar(p99u) }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300">Worst case with coverage</span>
            <span className="text-white font-semibold">{money(d.p99)}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-3 rounded-full bg-emerald-500"
              style={{ width: bar(p99) }}
            />
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-300 leading-relaxed">
        The premium removes {money(d.tail_protection)} of downside and costs{" "}
        {money(d.cost_of_certainty)} in expectation.
      </p>
    </div>
  );
}

// Everything relevant is visible at once; one action per card. Flight and hotel
// are chosen inside the trip builder, step by step.
function Card({ o, onSelect }) {
  const excluded = o.excluded_by_constraint;
  const savings = Number(o.savings_vs_domestic) || 0;
  return (
    <div
      className={`rounded-2xl border p-4 ${
        excluded
          ? "bg-slate-800/20 border-white/5 opacity-60"
          : "bg-slate-800/50 border-white/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-heading text-sm font-semibold text-white">{o.name}</h3>
          <p className="text-xs text-slate-400">
            {o.city}, {o.country}
            {o.flight_hours ? ` · ${o.flight_hours}h flight` : ""}
          </p>
        </div>
        {excluded && (
          <span className="text-[10px] rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 px-2 py-0.5 flex-shrink-0">
            Outside your travel limit
          </span>
        )}
      </div>

      <div className="mt-3">
        <StackedBar o={o} />
      </div>
      {o.travel_source?.flights && (
        <p className="mt-1.5 text-[10px] text-slate-500">{o.travel_source.flights}</p>
      )}

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            True cost
          </p>
          <p className="font-heading text-xl font-bold text-white">
            {money(o.true_cost)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            Savings vs domestic
          </p>
          <p
            className={`font-heading text-base font-bold ${
              savings >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {savings >= 0 ? "+" : ""}
            {money(savings)}
          </p>
        </div>
      </div>

      {o.reasoning && (
        <p className="mt-3 text-sm text-slate-200 leading-relaxed bg-slate-900/40 rounded-lg p-2.5 border border-white/5">
          {o.reasoning}
        </p>
      )}

      <button
        type="button"
        onClick={() => onSelect?.(o)}
        disabled={excluded}
        className="mt-3 w-full h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center transition-colors"
      >
        {excluded ? "Outside your travel limit" : "Select this hospital →"}
      </button>
    </div>
  );
}

export default function InternationalResults({ data, onSelect }) {
  if (!data) return null;
  const list = Array.isArray(data.options) ? data.options : [];
  const top = list.find((o) => !o.excluded_by_constraint);
  return (
    <div className="space-y-4">
      {data.degraded && (
        <p className="text-[11px] text-slate-500">cached estimates</p>
      )}
      {top && <RiskPanel o={top} />}
      <div className="space-y-3">
        {list.map((o, i) => (
          <Card key={o.hospital_id || i} o={o} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
