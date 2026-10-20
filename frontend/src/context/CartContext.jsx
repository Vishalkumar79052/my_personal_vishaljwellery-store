import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setCart(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Could not load cart:", err.message);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post("/cart", { productId, quantity });
    setCart(Array.isArray(data) ? data : []);
  };

  const updateQuantity = async (productId, quantity) => {
    const { data } = await api.put(`/cart/${productId}`, { quantity });
    setCart(Array.isArray(data) ? data : []);
  };

  const removeFromCart = async (productId) => {
    const { data } = await api.delete(`/cart/${productId}`);
    setCart(Array.isArray(data) ? data : []);
  };

  const clearCart = async () => {
    try {
      await api.delete("/cart");
    } finally {
      setCart([]);
    }
  };

  const safeCart = Array.isArray(cart) ? cart : [];
  const itemCount = safeCart.reduce((sum, i) => sum + (Number(i?.quantity) || 1), 0);
  const subtotal = safeCart.reduce((sum, i) => sum + (Number(i?.product?.price) || 0) * (Number(i?.quantity) || 1), 0);

  return (
    <CartContext.Provider
      value={{ cart: safeCart, loading, itemCount, subtotal, addToCart, updateQuantity, removeFromCart, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

