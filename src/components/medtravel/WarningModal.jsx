import React from "react";
import { ShieldAlert, X } from "lucide-react";

export default function WarningModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-heading text-base font-semibold text-slate-900">
                Medical Travel Risk Acknowledgment
              </h2>
              <p className="text-xs text-slate-500">Please read carefully before proceeding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 mb-4">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
              Legal Notice
            </p>
            <p className="mt-1 text-sm text-amber-800">
              International medical travel carries significant risks that may differ
              from domestic care standards.
            </p>
          </div>

          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex gap-2.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
              <span>
                Standards of care, medical licensing, and regulatory oversight may
                differ from your home country.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
              <span>
                Follow-up care, post-operative complications, and revision
                procedures may be difficult to obtain domestically after treatment
                abroad.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
              <span>
                Travel before and after surgery can increase the risk of
                complications such as deep vein thrombosis and infection.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
              <span>
                Legal recourse and malpractice remedies may be limited or
                unavailable in foreign jurisdictions.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
              <span>
                Insurance coverage for overseas treatment is typically not covered
                by domestic health plans.
              </span>
            </li>
          </ul>

          <p className="mt-4 text-xs text-slate-500 italic">
            This information does not constitute medical or legal advice. Consult a
            qualified healthcare provider and legal counsel before making any
            treatment decisions.
          </p>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
          >
            I Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}