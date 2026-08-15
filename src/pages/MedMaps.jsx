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
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">
        {/* Left panel — intake form, vertically centered */}
        <div className="flex items-center justify-center p-6 overflow-y-auto bg-slate-900">
          <LeftIntakePanel onCalculate={handleCalculate} calculating={calculating} />
        </div>

        {/* Right panel — 3D spinning globe */}
        <div className="relative min-h-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(13,148,136,0.12), transparent 60%)",
            }}
          />
          <Globe />
        </div>
      </div>
    </div>
  );
}