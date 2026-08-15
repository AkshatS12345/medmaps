import React from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FactsChips from "./FactsChips";
import DomesticResults from "./DomesticResults";
import InternationalResults from "./InternationalResults";
import ExplanationPanel from "./ExplanationPanel";
import TripBuilder from "./TripBuilder";

export default function RightResultsPanel({
  intake,
  domestic,
  international,
  explainProse,
  explainLoading,
  compareLoading,
  activeTab,
  onTabChange,
  onAddToCart,
  onCheckout,
  onBack,
  selected,
  onSelect,
}) {
  return (
    <div className="h-full w-full flex flex-col bg-slate-900/70 backdrop-blur-xl border-l border-white/10">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-white/10 flex-shrink-0">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold text-white leading-tight">
              {intake?.procedure_name || "Your results"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-[320px]">
              Ranked by true expected cost — not sticker price. All figures are
              estimates.
            </p>
          </div>
        </div>
        {intake?.facts && intake.facts.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1.5">
              Understood
            </p>
            <FactsChips facts={intake.facts} />
          </div>
        )}
      </div>

      {/* A chosen facility takes over the panel as a guided trip builder. */}
      {selected ? (
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <TripBuilder
            option={selected}
            intake={intake}
            onBack={() => onSelect(null)}
            onBook={onCheckout}
          />
        </div>
      ) : (
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="px-5 pt-3 pb-3 border-b border-white/10 flex-shrink-0">
          <TabsList className="bg-slate-800/60 border border-white/10">
            <TabsTrigger
              value="domestic"
              className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              Domestic
            </TabsTrigger>
            <TabsTrigger
              value="international"
              className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              International
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="domestic"
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4 mt-0 data-[state=inactive]:hidden"
        >
          <DomesticResults
            data={domestic}
            onCheckout={onCheckout}
            onAddToCart={onAddToCart}
          />
          <ExplanationPanel prose={explainProse} loading={explainLoading} />
        </TabsContent>

        <TabsContent
          value="international"
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4 mt-0 data-[state=inactive]:hidden"
        >
          {compareLoading && !international ? (
            <div className="flex items-center justify-center gap-2 text-slate-400 py-12">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading international options…</span>
            </div>
          ) : (
            <InternationalResults
              data={international}
              onAddToCart={onAddToCart}
              onCheckout={onCheckout}
            />
          )}
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}