import React from "react";
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

function OptionsTable({ options, onCheckout, onAddToCart }) {
  // Options arrive sorted by expected cost. Do not re-sort.
  return (
    <div className="rounded-2xl bg-slate-800/40 border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400 border-b border-white/10">
              <th className="px-3 py-2 font-medium">Hospital</th>
              <th className="px-3 py-2 font-medium">State</th>
              <th className="px-3 py-2 font-medium text-right">Sticker price</th>
              <th className="px-3 py-2 font-medium text-right">Your cost</th>
              <th className="px-3 py-2 font-medium text-right">Complication rate</th>
              <th className="px-3 py-2 font-medium text-right">Expected total</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {options.map((o, i) => (
              <tr
                key={i}
                className="border-b border-white/5 last:border-0 hover:bg-white/5"
              >
                <td className="px-3 py-2.5 text-white font-medium">{o.name}</td>
                <td className="px-3 py-2.5 text-slate-300">{o.state}</td>
                <td className="px-3 py-2.5 text-right text-slate-300">
                  {money(o.base_cost)}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-200">
                  {money(o.out_of_pocket)}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <div className="text-slate-200">{percent(o.complication_rate)}</div>
                  {o.complication_ci && (
                    <div className="text-[10px] text-slate-500">
                      {percentRange(o.complication_ci)}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span className="font-heading text-base font-bold text-white">
                    {money(o.expected_cost)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        flyToCart(e.currentTarget);
                        onAddToCart?.(o);
                      }}
                      className="text-xs rounded-lg bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1 font-semibold transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => onCheckout(o)}
                      className="text-xs rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white px-2.5 py-1 font-semibold transition-colors"
                    >
                      Book
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DomesticResults({ data, onCheckout, onAddToCart }) {
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
        <OptionsTable
          options={options}
          onCheckout={onCheckout}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
}