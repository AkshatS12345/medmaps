import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { money, percent, percentRange } from "@/lib/format";
import { flyToCart } from "@/lib/cartFly";

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

// Cards, not a table: seven columns never fit the results panel and pushed the
// action buttons off-screen. Rank is explicit so the expected-cost ordering reads.
function OptionRow({ o, rank, onAddToCart }) {
  const [open, setOpen] = useState(false);
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

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full h-8 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-colors"
        >
          {open ? "Hide breakdown" : "Book"}
        </button>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">
            Price breakdown
          </p>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div>
              <p className="text-slate-500">Sticker</p>
              <p className="text-slate-300">{money(o.base_cost)}</p>
            </div>
            <div>
              <p className="text-slate-500">Your cost</p>
              <p className="text-slate-200">{money(o.out_of_pocket)}</p>
            </div>
            <div>
              <p className="text-slate-500">Complication rate</p>
              <p className="text-slate-200">
                {percent(o.complication_rate)}
                {o.complication_ci && (
                  <span className="text-slate-500">
                    {" "}
                    {percentRange(o.complication_ci)}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              flyToCart(e.currentTarget);
              onAddToCart?.(o);
            }}
            className="w-full h-8 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
}

function OptionsTable({ options, onAddToCart }) {
  // Options arrive sorted by expected cost. Do not re-sort.
  return (
    <div className="space-y-2.5">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">
        {options.length} hospitals · ranked by expected total
      </p>
      {options.map((o, i) => (
        <OptionRow
          key={o.hospital_id || i}
          o={o}
          rank={i + 1}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}

export default function DomesticResults({ data, onAddToCart }) {
  if (!data) return null;
  const { options, price_spread, rank_inversion, degraded } = data;
  return (
    <div className="space-y-4">
      {degraded && (
        <p className="text-[11px] text-slate-500">cached estimates</p>
      )}
      <Spread spread={price_spread} />
      <RankInversion ri={rank_inversion} />
      {Array.isArray(options) && options.length > 0 && (
        <OptionsTable options={options} onAddToCart={onAddToCart} />
      )}
    </div>
  );
}