import React, { useEffect, useState } from "react";
import { Plane } from "lucide-react";
import { money } from "@/lib/format";
import { api } from "@/lib/api";
import { flyToCart } from "@/lib/cartFly";

// Stacked bar split into Procedure / Travel / Complication coverage. Segment
// widths are sized against true_cost (the API's authoritative total).
function StackedBar({ o }) {
  const proc = Number(o.base_cost) || 0;
  const travel =
    (Number(o.flight_cost) || 0) +
    (Number(o.lodging_cost) || 0) +
    (Number(o.travel_cost) || 0);
  const warranty = Number(o.warranty_cost) || 0;
  const denom = Number(o.true_cost) || proc + travel + warranty || 1;
  const seg = (v) => `${(v / denom) * 100}%`;

  return (
    <div>
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-700">
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
          Travel {money(o.flight_cost)} · {money(o.lodging_cost)} ·{" "}
          {money(o.travel_cost)}
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
            <span className="text-white font-semibold">{money(d.p99_uncovered)}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-3 rounded-full bg-red-500"
              style={{ width: bar(p99u) }}
            />
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

// Real hotels near this specific hospital, from OpenStreetMap via the API.
function HotelPicker({ o, selected, onSelect }) {
  const [hotels, setHotels] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || hotels || !o.hospital_id) return;
    let cancelled = false;
    api
      .hotels(o.hospital_id)
      .then((res) => !cancelled && setHotels(res?.hotels || []))
      .catch(() => !cancelled && setHotels([]));
    return () => {
      cancelled = true;
    };
  }, [open, hotels, o.hospital_id]);

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-teal-300 hover:text-teal-200 transition-colors"
      >
        {open ? "Hide recovery hotels" : "Choose a recovery hotel near this hospital"}
      </button>

      {open && (
        <div className="mt-2 space-y-1.5">
          {hotels === null && (
            <p className="text-[11px] text-slate-500">Loading hotels…</p>
          )}
          {hotels && hotels.length === 0 && (
            <p className="text-[11px] text-slate-500">
              No mapped hotels near this hospital — lodging stays bundled in travel.
            </p>
          )}
          {hotels &&
            hotels.map((h) => {
              const isSel = selected?.name === h.name;
              return (
                <button
                  key={h.name}
                  type="button"
                  onClick={() => onSelect(isSel ? null : h)}
                  className={`w-full text-left rounded-lg px-2.5 py-1.5 border transition-colors ${
                    isSel
                      ? "bg-teal-500/15 border-teal-400/40"
                      : "bg-slate-900/40 border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs text-white truncate">{h.name}</span>
                    <span className="text-[11px] text-slate-400 flex-shrink-0">
                      {h.distance_miles} mi · {money(h.total)}
                    </span>
                  </div>
                </button>
              );
            })}
          {hotels && hotels.length > 0 && (
            <p className="text-[10px] text-slate-500 pt-0.5">
              Names and distances from OpenStreetMap; nightly rate is the destination average.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Card({ o, onAddToCart }) {
  const excluded = o.excluded_by_constraint;
  const savings = Number(o.savings_vs_domestic) || 0;
  const [hotel, setHotel] = useState(null);
  const [open, setOpen] = useState(false);
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
          <h3 className="font-heading text-sm font-semibold text-white">
            {o.name}
          </h3>
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

      {/* Everything relevant is always visible — nothing hidden behind a toggle. */}
      <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div>
            <p className="text-slate-500">Procedure</p>
            <p className="text-slate-200">{money(o.base_cost)}</p>
          </div>
          <div>
            <p className="text-slate-500">Flight + stay</p>
            <p className="text-slate-200">{money(o.travel_cost)}</p>
          </div>
          <div>
            <p className="text-slate-500">Coverage</p>
            <p className="text-slate-200">{money(o.warranty_cost)}</p>
          </div>
        </div>
        {o.travel_source && o.travel_source.flights && (
          <p className="text-[10px] text-slate-500">{o.travel_source.flights}</p>
        )}
      </div>

      {/* Hotel choice happens inside the trip builder, one step at a time. */}
      <button
        type="button"
        onClick={() => onCheckout?.(o)}
        disabled={excluded}
        className="mt-3 w-full h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center transition-colors"
      >
        {excluded ? "Outside your travel limit" : "Select this hospital →"}
      </button>
    </div>
  );
}

export default function InternationalResults({ data, onAddToCart, onCheckout }) {
  if (!data) return null;
  const { options, degraded } = data;
  const list = Array.isArray(options) ? options : [];
  // Risk panel for the top non-excluded option.
  const top = list.find((o) => !o.excluded_by_constraint);
  return (
    <div className="space-y-4">
      {degraded && <p className="text-[11px] text-slate-500">cached estimates</p>}
      {top && <RiskPanel o={top} />}
      <div className="space-y-3">
        {list.map((o, i) => (
          <Card key={i} o={o} onAddToCart={onAddToCart} onCheckout={onCheckout} />
        ))}
      </div>
    </div>
  );
}