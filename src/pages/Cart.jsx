import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ShieldAlert,
  Plane,
  Bed,
  Stethoscope,
  Car,
  HeartPulse,
  Package,
  Sparkles,
} from "lucide-react";
import { useCart, CATEGORY_META, CATEGORY_ORDER } from "@/context/CartContext";
import CostBreakdownChart from "@/components/medtravel/CostBreakdownChart";

const CATEGORY_ICON = {
  procedure: Stethoscope,
  flight: Plane,
  hotel: Bed,
  travel: Car,
  insurance: HeartPulse,
  other: Package,
};

function money(n) {
  return `$${Math.round(n).toLocaleString()}`;
}

// Full-screen shopping cart. Reached by clicking the floating cart button,
// which navigates here instead of opening the old drawer.
export default function Cart() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    categoryTotals,
    grandTotal,
    count,
  } = useCart();

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_META[cat].label,
    color: CATEGORY_META[cat].color,
    rows: items.filter((i) => i.category === cat),
  })).filter((g) => g.rows.length > 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-300" />
            <h1 className="font-heading text-lg font-semibold">Your MedMaps Trip</h1>
          </div>
          <span className="ml-auto text-xs text-slate-400">
            {count} item{count === 1 ? "" : "s"}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-5 py-6 space-y-6">
        {items.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-base font-medium text-slate-300">
              Your trip is empty.
            </p>
            <p className="text-sm mt-1">
              Add a procedure, flight, or hotel to start building.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 mt-5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Start a search
            </Link>
          </div>
        )}

        {grouped.map((g) => {
          const Icon = CATEGORY_ICON[g.category] || Package;
          const subtotal = g.rows.reduce((s, r) => s + r.totalPrice, 0);
          return (
            <section key={g.category}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: g.color }} />
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                    {g.label}
                  </h2>
                </div>
                <span className="text-sm font-semibold text-white">
                  {money(subtotal)}
                </span>
              </div>
              <div className="space-y-3">
                {g.rows.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-slate-800/60 border border-white/10 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white leading-snug">
                          {item.itemName}
                        </p>
                        {(item.provider || item.location) && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {[item.provider, item.location]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                        className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="w-7 h-7 rounded-md bg-slate-700 hover:bg-slate-600 flex items-center justify-center"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm text-slate-200 w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="w-7 h-7 rounded-md bg-slate-700 hover:bg-slate-600 flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold text-white">
                          {money(item.totalPrice)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-slate-500">
                            {money(item.unitPrice)} ea
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {grandTotal > 0 && (
          <div className="rounded-2xl bg-slate-800/50 border border-white/10 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-3">
              Cost Breakdown
            </h2>
            <CostBreakdownChart totals={categoryTotals} />
          </div>
        )}
      </main>

      {items.length > 0 && (
        <footer className="border-t border-white/10 bg-slate-900">
          <div className="max-w-3xl mx-auto px-5 py-4">
            <div className="rounded-2xl bg-gradient-to-br from-blue-600/20 to-emerald-600/10 border border-blue-400/30 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-blue-300" />
                <h2 className="font-heading text-sm font-semibold text-white">
                  Your Medical Travel Package
                </h2>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Estimated total for your complete trip
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">
                    Estimated Total
                  </p>
                  <p className="font-heading text-3xl font-bold text-white">
                    {money(grandTotal)}
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {count} item{count === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <p className="mt-3 flex items-start gap-1.5 text-[10px] text-amber-300/80">
              <ShieldAlert className="w-3 h-3 mt-0.5 flex-shrink-0" />
              Estimates only — MedMaps is a planning platform, not a medical
              provider or insurer. Final prices are confirmed at booking.
            </p>

            <button
              onClick={clearCart}
              className="mt-3 w-full text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              Clear trip
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}