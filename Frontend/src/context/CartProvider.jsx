import { createContext, useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

const STORAGE_KEY = "Cart";

export default function CartProvider({ children }) {
  const initial = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  const [items, setItems] = useState(initial);

  const persist = (next) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addItem = (book) => {
    const id = book?._id ?? book?.id;
    if (!id) {
      toast.error("Cannot add this item");
      return;
    }

    const next = (() => {
      const existing = items.find((x) => x.id === id);
      if (existing) {
        return items.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [
        ...items,
        {
          id,
          name: book.name,
          price: Number(book.price ?? 0),
          image: book.image,
          category: book.category,
          title: book.title,
          qty: 1,
        },
      ];
    })();

    persist(next);
    toast.success("Added to cart");
  };

  const removeItem = (id) => {
    const next = items.filter((x) => x.id !== id);
    persist(next);
  };

  const setQty = (id, qty) => {
    const safeQty = Math.max(1, Number(qty || 1));
    const next = items.map((x) => (x.id === id ? { ...x, qty: safeQty } : x));
    persist(next);
  };

  const clear = () => persist([]);

  const totals = useMemo(() => {
    const count = items.reduce((sum, x) => sum + x.qty, 0);
    const total = items.reduce(
      (sum, x) => sum + x.qty * (Number(x.price) || 0),
      0,
    );
    return { count, total };
  }, [items]);

  const value = { items, addItem, removeItem, setQty, clear, totals };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
