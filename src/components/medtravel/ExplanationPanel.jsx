import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

// Prose explanation generated from /explain (instruction as system prompt,
// facts as content). Shown under "What this means for you."
export default function ExplanationPanel({ prose, loading }) {
  if (loading && !prose) {
    return (
      <div className="rounded-2xl bg-slate-800/40 border border-white/10 p-4 flex items-center gap-2 text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Generating explanation…</span>
      </div>
    );
  }
  if (!prose) return null;
  return (
    <div className="rounded-2xl bg-slate-800/40 border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-blue-300" />
        <h4 className="font-heading text-sm font-semibold text-white">
          What this means for you
        </h4>
      </div>
      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
        {prose}
      </p>
    </div>
  );
}