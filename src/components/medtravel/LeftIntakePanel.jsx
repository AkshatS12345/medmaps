import React, { useState } from "react";
import { Sparkles, User } from "lucide-react";

const DEFAULT_TEMPLATE =
  "Hi, my name is David. I am a 54-year-old in need of a Total Knee Replacement. My insurance provider is Blue Cross Blue Shield with a remaining deductible of $5,000. I am looking for accredited international alternatives with bundled post-op coverage.";

const TAGS = [
  "Knee Replacement",
  "Hip Replacement",
  "Cataract Surgery",
  "Coronary Bypass",
  "Spinal Fusion",
];

const KNOWN_PROCEDURES = [
  "Total Knee Replacement",
  "Knee Replacement",
  "Hip Replacement",
  "Cataract Surgery",
  "Coronary Bypass",
  "Spinal Fusion",
];

export default function LeftIntakePanel({ onCalculate, calculating }) {
  const [text, setText] = useState(DEFAULT_TEMPLATE);

  const applyTag = (tag) => {
    setText((prev) => {
      // Replace any known procedure mention with the chosen tag.
      let next = prev;
      KNOWN_PROCEDURES.forEach((p) => {
        if (p !== tag) {
          next = next.replace(new RegExp(p, "g"), tag);
        }
      });
      return next;
    });
  };

  return (
    <div className="w-full lg:w-[360px] flex-shrink-0">
      <div className="rounded-2xl bg-white/85 backdrop-blur-md shadow-2xl border border-white/60 overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-heading text-base font-semibold text-slate-900 leading-tight">
                AI Travel & Clinical Intake
              </h2>
              <p className="text-xs text-slate-500">Describe your needs in plain language</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            className="w-full rounded-xl border border-slate-200 bg-white/90 p-3.5 text-sm leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition resize-none"
          />

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Quick swap procedure
            </p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => applyTag(tag)}
                  className="px-2.5 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700 transition-colors border border-slate-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onCalculate}
            disabled={calculating}
            className="w-full h-11 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-70"
          >
            <Sparkles className="w-4 h-4" />
            {calculating ? "Analyzing intake…" : "Calculate Bundled Costs"}
          </button>
        </div>
      </div>
    </div>
  );
}