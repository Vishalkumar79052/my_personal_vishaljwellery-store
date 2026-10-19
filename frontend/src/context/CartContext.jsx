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
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post("/cart", { productId, quantity });
    setCart(data);
  };

  const updateQuantity = async (productId, quantity) => {
    const { data } = await api.put(`/cart/${productId}`, { quantity });
    setCart(data);
  };

  const removeFromCart = async (productId) => {
    const { data } = await api.delete(`/cart/${productId}`);
    setCart(data);
  };

  const clearCart = async () => {
    await api.delete("/cart");
    setCart([]);
  };

  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, loading, itemCount, subtotal, addToCart, updateQuantity, removeFromCart, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
