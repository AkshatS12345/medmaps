import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2, CreditCard, Loader2, Lock } from "lucide-react";
import { money } from "@/lib/format";

// Two-step checkout: review the escrow split and "pay", then confirmation.
// The payment step is a simulation — no card is charged and nothing leaves
// the browser. The split itself comes from the API.
export default function CheckoutModal({ data, onClose }) {
  const open = !!data;
  const [step, setStep] = useState("review"); // review | processing | done

  useEffect(() => {
    if (open) setStep("review");
  }, [open, data?.order_id]);

  const pay = () => {
    setStep("processing");
    setTimeout(() => setStep("done"), 1400);
  };

  const items = data?.line_items || [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-heading flex items-center gap-2">
            {step === "done" ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Booking confirmed
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 text-teal-300" />
                Review your package
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            {step === "done"
              ? "Funds are held in escrow and released to each party on completion."
              : "One payment, routed to each provider separately."}
          </DialogDescription>
        </DialogHeader>

        {data && (
          <div className="space-y-3">
            <div className="space-y-2">
              {items.map((li, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-slate-800/60 border border-white/10 px-3 py-2"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-sm text-white font-medium truncate">
                      {li.payee || li.label}
                    </p>
                    {li.label && li.payee && (
                      <p className="text-[10px] text-slate-400">{li.label}</p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-white flex-shrink-0">
                    {money(li.amount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-sm text-slate-300">Total</span>
              <span className="font-heading text-lg font-bold text-white">
                {money(data.total)}
              </span>
            </div>

            {step === "review" && (
              <>
                <button
                  type="button"
                  onClick={pay}
                  className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  Pay {money(data.total)}
                </button>
                <p className="text-[10px] text-slate-500 text-center">
                  Simulated payment — no card is charged. Prices are estimates.
                </p>
              </>
            )}

            {step === "processing" && (
              <div className="flex items-center justify-center gap-2 py-3 text-slate-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Routing payment to {items.length} parties…</span>
              </div>
            )}

            {step === "done" && (
              <div className="space-y-2">
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-400/30 px-3 py-2.5">
                  <p className="text-xs text-emerald-200">
                    Order{" "}
                    <span className="font-mono text-emerald-100">
                      {data.order_id}
                    </span>{" "}
                    confirmed. Each party is paid on its own milestone —
                    the hospital on discharge, the underwriter at policy start.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full h-10 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
