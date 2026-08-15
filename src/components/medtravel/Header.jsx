import React from "react";
import { MapPin, Plus } from "lucide-react";

export default function Header() {
  return (
    <header className="relative z-30 h-16 flex-shrink-0 bg-slate-950 text-white shadow-lg border-b border-white/10">
      <div className="h-full mx-auto max-w-screen-2xl px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-md">
            <MapPin className="w-5 h-5 text-white" strokeWidth={2.4} />
            <Plus className="w-3 h-3 text-white absolute top-1 right-1 bg-blue-600 rounded-full p-0.5 box-content" strokeWidth={3} />
          </div>
          <div className="leading-none">
            <span className="font-heading text-xl font-bold tracking-tight">
              MedMaps
            </span>
          </div>
        </div>
        <span className="hidden sm:block text-sm text-white/75 font-body">
          Intelligent Global Healthcare & Warranty Marketplace
        </span>
      </div>
    </header>
  );
}