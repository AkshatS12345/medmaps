import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

// Floating shopping-cart action button, fixed to the bottom-left of the screen.
// Clicking it opens the full-screen cart page. The badge is hidden while the
// cart is empty (count === 0). The aria-label is relied on by CartFlyLayer to
// target this button for the drop-into-cart animation — keep the prefix.
export default function CartFab({ count }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate("/cart")}
      aria-label={`Shopping cart, ${count} item${count === 1 ? "" : "s"}`}
      className="fixed bottom-8 left-8 bg-blue-600 rounded-full p-4 shadow-lg z-50 flex items-center justify-center hover:bg-blue-500 transition-colors"
    >
      <ShoppingCart className="w-6 h-6 text-white" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center border-2 border-slate-950">
          {count}
        </span>
      )}
    </button>
  );
}