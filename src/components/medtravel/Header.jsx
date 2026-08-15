import React from "react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-[hsl(var(--primary))] text-white shadow-md">
      <div className="h-full mx-auto max-w-screen-2xl px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">M</span>
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight">
            MedTravel Gateway
          </span>
        </div>
        <span className="hidden sm:block text-sm text-white/80 font-body">
          Find cost-effective domestic care
        </span>
      </div>
    </header>
  );
}