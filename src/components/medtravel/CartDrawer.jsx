import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useCart, CATEGORY_META, CATEGORY_ORDER } from "@/context/CartContext";
import CostBreakdownChart from "./CostBreakdownChart";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Sparkles,
  ShieldAlert,
  Plane,
  Bed,
  Stethoscope,
  Car,
  HeartPulse,
  Package,
} from "lucide-react";

const CATEGORY_ICON = {
  procedure: Stethoscope,
  flight: Plane,
  hotel: Bed,
  travel: Car,
  insurance: HeartPulse,
  other: Package,
};

// One-tap essentials for the "Additional Travel Costs" category.
const QUICK_TRAVEL_COSTS = [
  {
    key: "travel",
    itemName: "Airport & Local Transportation",
    provider: "MedMaps Estimate",
    unitPrice: 150,
  },
  {
    key: "insurance",
    itemName: "Travel Medical Insurance",
    provider: "MedMaps Estimate",
    unitPrice: 120,
  },
  {
    key: "other",
    itemName: "Food & Meals (14 days)",
    provider: "MedMaps Estimate",
    unitPrice: 280,
  },
];

function money(n) {
  return `$${Math.round(n).toLocaleString()}`;
}

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    addItem,
    clearCart,
    categoryTotals,
    grandTotal,
    count,
  } = useCart();
  const [toast, setToast] = useState("");

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_META[cat].label,
    color: CATEGORY_META[cat].color,
    rows: items.filter((i) => i.category === cat),
  })).filter((g) => g.rows.length > 0);

  const flash = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 1800);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && closeCart()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg bg-slate-900 border-l border-white/10 text-white p-0 flex flex-col"
      >
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-white/10 text-left">
          <SheetTitle className="text-white font-heading text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-300" />
            Your MedMaps Trip
          </SheetTitle>
          <SheetDescription className="text-slate-400 text-xs">
            Build your complete medical travel package. All prices are estimates
            and may change.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {items.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Your trip is empty.</p>
              <p className="text-xs mt-1">
                Add a procedure, flight, or hotel to start building.
              </p>
            </div>
          )}

          {grouped.map((g) => {
            const Icon = CATEGORY_ICON[g.category] || Package;
            const subtotal = g.rows.reduce((s, r) => s + r.totalPrice, 0);
            return (
              <div key={g.category}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: g.color }} />
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                      {g.label}
                    </h4>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {money(subtotal)}
                  </span>
                </div>
                <div className="space-y-2">
                  {g.rows.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-slate-800/60 border border-white/10 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
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
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                            className="w-6 h-6 rounded-md bg-slate-700 hover:bg-slate-600 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-slate-200 w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                            className="w-6 h-6 rounded-md bg-slate-700 hover:bg-slate-600 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">
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
              </div>
            );
          })}

          {/* Quick add travel essentials */}
          <div className="rounded-xl bg-slate-800/40 border border-dashed border-white/15 p-3">
            <p className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Quick add travel essentials
            </p>
            <div className="grid grid-cols-1 gap-2">
              {QUICK_TRAVEL_COSTS.map((q) => (
                <button
                  key={q.key}
                  onClick={() => {
                    addItem({
                      category: q.key,
                      itemName: q.itemName,
                      provider: q.provider,
                      unitPrice: q.unitPrice,
                      quantity: 1,
                    });
                    flash("Added to your MedMaps trip");
                  }}
                  className="flex items-center justify-between rounded-lg bg-slate-700/40 hover:bg-slate-700 px-3 py-2 text-left transition-colors"
                >
                  <span className="text-xs text-slate-200">{q.itemName}</span>
                  <span className="text-xs font-semibold text-emerald-300">
                    + {money(q.unitPrice)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Cost breakdown chart */}
          {grandTotal > 0 && (
            <div className="rounded-2xl bg-slate-800/50 border border-white/10 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-3">
                Cost Breakdown
              </h4>
              <CostBreakdownChart totals={categoryTotals} />
            </div>
          )}
        </div>

        {/* Footer — package total */}
        <div className="border-t border-white/10 px-5 py-4 bg-slate-900 flex-shrink-0">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600/20 to-emerald-600/10 border border-blue-400/30 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-blue-300" />
              <h3 className="font-heading text-sm font-semibold text-white">
                Your Medical Travel Package
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Estimated total for your complete trip
            </p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Estimated Total
                </p>
                <p className="font-heading text-2xl font-bold text-white">
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

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="mt-2 w-full text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              Clear trip
            </button>
          )}
        </div>

        {toast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 text-white text-xs font-medium px-4 py-2 shadow-lg z-50">
            {toast}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}