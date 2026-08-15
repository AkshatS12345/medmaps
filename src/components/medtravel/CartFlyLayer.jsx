import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";

// Renders the drop-into-cart animation. Listens for "medmaps:cart-fly"
// events (dispatched by flyToCart from any Add-to-Cart button), draws a
// package that drops from the click point into the floating cart button,
// and bounces the cart on impact. Mounted once at the top level.
const FAB_SELECTOR = '[aria-label^="Shopping cart"]';

export default function CartFlyLayer() {
  const [drops, setDrops] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const fab = document.querySelector(FAB_SELECTOR);
      if (!fab) return;
      const fr = fab.getBoundingClientRect();
      const id = Math.random().toString(36).slice(2);
      setDrops((d) => [
        ...d,
        {
          id,
          startX: e.detail.x,
          startY: e.detail.y,
          endX: fr.left + fr.width / 2,
          endY: fr.top + fr.height / 2,
        },
      ]);
    };
    window.addEventListener("medmaps:cart-fly", handler);
    return () => window.removeEventListener("medmaps:cart-fly", handler);
  }, []);

  const remove = (id) => setDrops((d) => d.filter((x) => x.id !== id));

  return (
    <>
      {drops.map((d) => (
        <DropItem
          key={d.id}
          {...d}
          onDone={() => {
            remove(d.id);
            bounceFab();
          }}
        />
      ))}
    </>
  );
}

function DropItem({ startX, startY, endX, endY, onDone }) {
  // Gravity drop: accelerate downward into the cart, shrink + fade on impact.
  return (
    <motion.div
      className="fixed top-0 left-0 z-[70] pointer-events-none"
      initial={{ x: startX - 12, y: startY - 12, opacity: 0, scale: 1 }}
      animate={{
        x: [startX - 12, endX - 12],
        y: [startY - 12, endY - 12],
        opacity: [0, 1, 1, 0],
        scale: [1, 1, 0.4],
      }}
      transition={{ duration: 0.55, ease: "easeIn", times: [0, 0.1, 0.85, 1] }}
      onAnimationComplete={onDone}
    >
      <div className="bg-emerald-500/90 backdrop-blur rounded-full p-1.5 shadow-lg ring-1 ring-white/40">
        <Package className="w-4 h-4 text-white" />
      </div>
    </motion.div>
  );
}

// Squash-and-bounce the cart FAB via the WAAPI so no React state is needed.
function bounceFab() {
  const fab = document.querySelector(FAB_SELECTOR);
  if (!fab) return;
  fab.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.25) translateY(-3px)" },
      { transform: "scale(0.92)" },
      { transform: "scale(1)" },
    ],
    { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
  );
}