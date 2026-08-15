import React, { useState } from "react";
import Header from "@/components/medtravel/Header";
import Globe from "@/components/medtravel/Globe";
import LeftIntakePanel from "@/components/medtravel/LeftIntakePanel";

export default function MedMaps() {
  const [calculating, setCalculating] = useState(false);

  const handleCalculate = () => {
    setCalculating(true);
    setTimeout(() => setCalculating(false), 1100);
  };

  return (
    <div className="min-h-screen relative bg-slate-950">
      <Header />

      {/* 3D globe background */}
      <div className="fixed inset-0 z-0">
        <Globe />
      </div>

      <main className="relative z-10 pt-16">
        <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-8 py-8 flex items-center">
          <LeftIntakePanel onCalculate={handleCalculate} calculating={calculating} />
        </div>
      </main>
    </div>
  );
}