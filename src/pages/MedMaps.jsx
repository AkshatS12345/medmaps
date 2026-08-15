import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/medtravel/Header";
import Globe from "@/components/medtravel/Globe";
import LeftIntakePanel from "@/components/medtravel/LeftIntakePanel";
import RightResultsPanel from "@/components/medtravel/RightResultsPanel";
import CartFab from "@/components/medtravel/CartFab";
import FlyingItem from "@/components/medtravel/FlyingItem";

const FACILITIES = [
  {
    id: "apollo",
    name: "Apollo Health City",
    location: "Chennai, India",
    country: "India",
    safety: 9.4,
    coords: [13.0827, 80.2707],
    type: "bundled",
  },
  {
    id: "fortis",
    name: "Fortis Memorial Research Institute",
    location: "Gurgaon, India",
    country: "India",
    safety: 9.1,
    coords: [28.4595, 77.0266],
    type: "bundled",
  },
  {
    id: "shanghai",
    name: "Shanghai United Family Hospital",
    location: "Shanghai, China",
    country: "China",
    safety: 9.2,
    coords: [31.2304, 121.4737],
    type: "bundled",
  },
  {
    id: "apex",
    name: "Apex Orthopedic Institute",
    location: "New York, NY",
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
  const [intake, setIntake] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [flyingItems, setFlyingItems] = useState([]);
  const cartRef = useRef(null);

  const handleCalculate = (data) => {
    setIntake(data);
    setCalculating(true);
    window.setTimeout(() => {
      setCalculating(false);
      setShowResults(true);
    }, 1200);
  };

  const handleBack = () => setShowResults(false);

  const handleAddToCart = (event) => {
    const startRect = event.currentTarget.getBoundingClientRect();
    const cartEl = cartRef.current;
    if (!startRect || !cartEl) return;
    const endRect = cartEl.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setFlyingItems((items) => [
      ...items,
      {
        id,
        startX: startRect.left + startRect.width / 2,
        startY: startRect.top + startRect.height / 2,
        endX: endRect.left + endRect.width / 2,
        endY: endRect.top + endRect.height / 2,
      },
    ]);
  };

  const handleFlyComplete = (id) => {
    setFlyingItems((items) => items.filter((i) => i.id !== id));
    setCartCount((c) => c + 1);
  };

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
                <RightResultsPanel
                  facilities={FACILITIES}
                  intake={intake}
                  onAddToCart={handleAddToCart}
                  onBack={handleBack}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating shopping cart — fixed bottom-left */}
      <CartFab ref={cartRef} count={cartCount} />

      {/* Fly-to-cart animations */}
      {flyingItems.map((item) => (
        <FlyingItem
          key={item.id}
          startX={item.startX}
          startY={item.startY}
          endX={item.endX}
          endY={item.endY}
          onComplete={() => handleFlyComplete(item.id)}
        />
      ))}
    </div>
  );
}