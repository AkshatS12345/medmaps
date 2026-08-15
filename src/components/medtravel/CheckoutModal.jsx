import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import { money } from "@/lib/format";

// Checkout confirmation: the payment splits three ways — hospital, travel
// partner, complication underwriter — then the order_id.
export default function CheckoutModal({ data, onClose }) {
  const open = !!data;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-heading flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Checkout confirmation
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Your payment is split three ways.
          </DialogDescription>
        </DialogHeader>
        {data && (
          <div className="space-y-3">
            <div className="space-y-2">
              {(data.line_items || []).map((li, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-slate-800/60 border border-white/10 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium">
                      {li.label || li.name || li.party}
                    </p>
                    {li.description && (
                      <p className="text-[10px] text-slate-400">{li.description}</p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-white flex-shrink-0">
                    {money(li.amount ?? li.price ?? li.total)}
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
            <p className="text-[10px] text-slate-400">
              Order ID:{" "}
              <span className="font-mono text-slate-200">{data.order_id}</span>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}