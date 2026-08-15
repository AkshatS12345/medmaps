import React from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";

// A small ghosted pill that arcs from the clicked "Add to Cart" button to the
// floating cart, then fades out. Calls `onComplete` when the animation ends.
export default function FlyingItem({ startX, startY, endX, endY, onComplete }) {
  const midX = (startX + endX) / 2;
  const midY = Math.min(startY, endY) - 140; // arc upward

  return (
    <motion.div
      className="fixed top-0 left-0 z-[60] pointer-events-none"
      initial={{ x: startX, y: startY, opacity: 0, scale: 1 }}
      animate={{
        x: [startX, midX, endX],
        y: [startY, midY, endY],
        opacity: [0, 1, 0],
        scale: [1, 0.9, 0.3],
      }}
      transition={{ duration: 0.8, ease: "easeInOut", times: [0, 0.5, 1] }}
      onAnimationComplete={onComplete}
    >
      <div className="bg-blue-500/80 backdrop-blur rounded-full p-2 shadow-lg ring-1 ring-white/30">
        <Package className="w-4 h-4 text-white" />
      </div>
    </motion.div>
  );
}