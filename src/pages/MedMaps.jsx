import React, { useState } from "react";
import Header from "@/components/medtravel/Header";
import WorldMap from "@/components/medtravel/WorldMap";
import LeftIntakePanel from "@/components/medtravel/LeftIntakePanel";
import RightPackagesPanel from "@/components/medtravel/RightPackagesPanel";

export default function MedMaps() {
  const [calculating, setCalculating] = useState(false);
  const [highlighted, setHighlighted] = useState(false);

  const handleCalculate = () => {
    setCalculating(true);
    setTimeout(() => {
      setCalculating(false);
      setHighlighted(true);
    }, 900);
  };

  return (
    <div className="min-h-screen relative">
      <Header />
      <WorldMap />

      <main className="relative z-10 pt-16">
        <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-5 items-start">
          <LeftIntakePanel onCalculate={handleCalculate} calculating={calculating} />
          <RightPackagesPanel highlighted={highlighted} />
        </div>
      </main>
    </div>
  );
}