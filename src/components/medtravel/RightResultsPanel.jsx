import React from "react";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FacilityCard from "./FacilityCard";
import FlightPathTab from "./FlightPathTab";

export default function RightResultsPanel({ facilities, intake, onAddToCart, onBack }) {
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
              Recommended Accredited Centers
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-[300px]">
              Ranked by procedure safety, historical success rates, and bundled
              logistics.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-200 border border-emerald-400/30 flex-shrink-0">
            <BadgeCheck className="w-3.5 h-3.5" />
            {facilities.length} Matches
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="centers" className="flex-1 flex flex-col min-h-0">
        <div className="px-5 pt-3 pb-3 border-b border-white/10 flex-shrink-0">
          <TabsList className="bg-slate-800/60 border border-white/10">
            <TabsTrigger
              value="centers"
              className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              Accredited Centers
            </TabsTrigger>
            <TabsTrigger
              value="flights"
              className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              Cheapest Flight Path
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="centers"
          className="flex-1 overflow-y-auto px-5 py-4 space-y-3 mt-0 data-[state=inactive]:hidden"
        >
          {facilities.map((f) => (
            <FacilityCard
              key={f.id}
              facility={f}
              intake={intake}
              onAddToCart={onAddToCart}
            />
          ))}
        </TabsContent>

        <TabsContent
          value="flights"
          className="flex-1 overflow-y-auto mt-0 data-[state=inactive]:hidden"
        >
          <FlightPathTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}