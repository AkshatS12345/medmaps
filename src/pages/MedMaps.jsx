import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/medtravel/Header";
import Globe from "@/components/medtravel/Globe";
import LeftIntakePanel from "@/components/medtravel/LeftIntakePanel";
import RightResultsPanel from "@/components/medtravel/RightResultsPanel";

const FACILITIES = [
  {
    id: "india1",
    label: "India 1",
    name: "Apollo Health City, Chennai",
    country: "India",
    safety: 9.4,
    coords: [13.0827, 80.2707],
    type: "bundled",
  },
  {
    id: "india2",
    label: "India 2",
    name: "Fortis Memorial Research Institute, Gurgaon",
    country: "India",
    safety: 9.1,
    coords: [28.4595, 77.0266],
    type: "bundled",
  },
  {
    id: "china1",
    label: "China 1",
    name: "Shanghai United Family Hospital",
    country: "China",
    safety: 9.2,
    coords: [31.2304, 121.4737],
    type: "bundled",
  },
  {
    id: "china2",
    label: "China 2",
    name: "Peking Union Medical College Hospital",
    country: "China",
    safety: 8.8,
    coords: [39.9138, 116.3914],
    type: "bundled",
  },
  {
    id: "us1",
    label: "US 1",
    name: "Apex Orthopedic Institute, New York",
    country: "United States",
    safety: 9.5,
    coords: [40.7128, -74.006],
    type: "domestic",
  },
];

const EASE = [0.22, 1, 0.36, 1];
const DURATION = 0.7;

export default function MedMaps() {
  const [calculating, setCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setCalculating(true);
    setTimeout(() => {
      setCalculating(false);
      setShowResults(true);
    }, 1200);
  };

  const handleBack = () => setShowResults(false);

  const markers = FACILITIES.map((f) => ({ location: f.coords, size: 0.06 }));

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6 min-h-0">
        <div className="relative w-full h-full max-w-[1400px] overflow-hidden rounded-3xl border border-white/10">
          {/* Intake form — left half, exits to the left */}
          <AnimatePresence>
            {!showResults && (
              <motion.div
                key="intake"
                className="absolute top-0 left-0 h-full w-1/2 flex items-center justify-center p-4"
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-120%", opacity: 0 }}
                transition={{ duration: DURATION, ease: EASE }}
              >
                <LeftIntakePanel
                  onCalculate={handleCalculate}
                  calculating={calculating}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Globe — starts on the right half, slides to the left half */}
          <motion.div
            className="absolute top-0 left-1/2 h-full w-1/2"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(13,148,136,0.12), transparent 60%)",
            }}
            animate={{ x: showResults ? "-100%" : "0%" }}
            transition={{ duration: DURATION, ease: EASE }}
          >
            <Globe markers={markers} />
          </motion.div>

          {/* Results panel — right half, slides in from the right */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                key="results"
                className="absolute top-0 left-1/2 h-full w-1/2"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: DURATION, ease: EASE }}
              >
                <RightResultsPanel facilities={FACILITIES} onBack={handleBack} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}