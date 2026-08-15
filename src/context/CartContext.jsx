import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

// Cart state management with localStorage persistence. The Cart entity schema
// (base44/entities/Cart.jsonc) mirrors this shape for future server-side
// persistence; for now the cart is session/local-storage based so it works
// without requiring login.

const CartContext = createContext(null);
const STORAGE_KEY = "medmaps_cart_v1";

export const CATEGORY_META = {
  procedure: { label: "Medical Procedure", color: "#10b981" },
  flight: { label: "Flight", color: "#3b82f6" },
  hotel: { label: "Hotel", color: "#a855f7" },
  travel: { label: "Transportation", color: "#f59e0b" },
  insurance: { label: "Insurance", color: "#ec4899" },
  other: { label: "Other", color: "#64748b" },
};

export const CATEGORY_ORDER = [
  "procedure",
  "flight",
  "hotel",
  "travel",
  "insurance",
  "other",
];

function genId() {
  return `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * addItem({
 *   category, itemName, description, provider, location,
 *   unitPrice, quantity, metadata
 * })
 * Re-adding an identical item (same category + itemName + provider) increments
 * its quantity instead of creating a duplicate row.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadItems);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [items]);

  const addItem = useCallback((item) => {
    const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
    const unitPrice = Number(item.unitPrice) || 0;
    const entry = {
      id: genId(),
      category: item.category || "other",
      itemName: item.itemName || "Item",
      description: item.description || "",
      provider: item.provider || "",
      location: item.location || "",
      quantity,
      unitPrice,
      metadata: item.metadata || {},
      dateAdded: new Date().toISOString(),
    };
    entry.totalPrice = entry.unitPrice * entry.quantity;

    // The cart holds exactly one trip: one procedure, one hotel, one flight.
    // Choosing a different hospital replaces the previous choice rather than
    // stacking a second surgery.
    const SINGLE = ["procedure", "hotel", "flight"];
    setItems((prev) => {
      if (SINGLE.includes(entry.category)) {
        return [...prev.filter((i) => i.category !== entry.category), entry];
      }
      const matchIdx = prev.findIndex(
        (i) =>
          i.category === entry.category &&
          i.itemName === entry.itemName &&
          (i.provider || "") === (entry.provider || "")
      );
      if (matchIdx >= 0) {
        const next = [...prev];
        const q = next[matchIdx].quantity + entry.quantity;
        next[matchIdx] = {
          ...next[matchIdx],
          quantity: q,
          totalPrice: next[matchIdx].unitPrice * q,
        };
        return next;
      }
      return [...prev, entry];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const q = Math.max(1, Math.round(quantity));
        return { ...i, quantity: q, totalPrice: i.unitPrice * q };
      })
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((n, i) => n + i.quantity, 0),
    [items]
  );

  const categoryTotals = useMemo(() => {
    const totals = {};
    for (const key of CATEGORY_ORDER) totals[key] = 0;
    for (const i of items) {
      totals[i.category] = (totals[i.category] || 0) + i.totalPrice;
    }
    return totals;
  }, [items]);

  const grandTotal = useMemo(
    () => Object.values(categoryTotals).reduce((a, b) => a + b, 0),
    [categoryTotals]
  );

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    count,
    categoryTotals,
    grandTotal,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    toggleCart: () => setIsOpen((o) => !o),
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}