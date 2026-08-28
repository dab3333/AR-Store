import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { getCart, addCartItem, updateCartItem, removeCartItem } from "../api/endpoints";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshCart = useCallback(
    async ({ silent = false } = {}) => {
      if (!isAuthenticated) {
        setItems([]);
        return;
      }
      if (!silent) setLoading(true);
      setError(null);
      try {
        const { data } = await getCart();
        setItems(data.items || data || []);
      } catch (err) {
        setError(err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(
    async (productId, options) => {
      await addCartItem(productId, options);
      await refreshCart({ silent: true });
    },
    [refreshCart]
  );

  const updateQty = useCallback(
    async (itemId, change) => {
      await updateCartItem(itemId, change);
      await refreshCart({ silent: true });
    },
    [refreshCart]
  );

  const removeItem = useCallback(
    async (itemId) => {
      await removeCartItem(itemId);
      await refreshCart({ silent: true });
    },
    [refreshCart]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = item.price ?? 0;
        const qty = item.qty ?? item.quantity ?? 1;
        return sum + price * qty;
      }, 0),
    [items]
  );

  const itemCount = useMemo(() => items.length, [items]);

  const value = useMemo(
    () => ({
      items,
      loading,
      error,
      total,
      itemCount,
      addItem,
      updateQty,
      removeItem,
      clearCart,
      refreshCart,
    }),
    [items, loading, error, total, itemCount, addItem, updateQty, removeItem, clearCart, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
