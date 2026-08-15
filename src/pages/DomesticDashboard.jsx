import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import Header from "@/components/medtravel/Header";
import SidePanel from "@/components/medtravel/SidePanel";

export default function DomesticDashboard() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Hospitals.list()
      .then((data) => setHospitals(data))
      .catch(() => setHospitals([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen relative bg-slate-100">
      <Header />

      {/* Map background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundColor: "#eef2f7",
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        {/* Faint map-like shapes */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.13]" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="dots" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="2" fill="#64748b" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
          <path
            d="M0,320 Q300,220 620,300 T1240,280 L1240,520 Q900,460 560,520 T0,500 Z"
            fill="#94a3b8"
            opacity="0.18"
          />
          <path
            d="M0,560 Q260,640 520,580 T1080,620 L1080,760 Q700,720 360,780 T0,740 Z"
            fill="#64748b"
            opacity="0.14"
          />
        </svg>
      </div>

      {/* Content */}
      <main className="relative z-10 pt-16">
        <div className="min-h-[calc(100vh-4rem)] flex items-center px-4 sm:px-8 py-8">
          <div className="w-full max-w-md">
            {loading ? (
              <div className="rounded-2xl bg-white shadow-2xl border border-slate-200 p-10 flex items-center justify-center">
                <div className="w-7 h-7 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
              </div>
            ) : (
              <SidePanel hospitals={hospitals} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}