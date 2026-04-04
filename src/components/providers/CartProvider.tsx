"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface CartContextType {
  cartCount: number;
  addToCart: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  resetCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);

  const addToCart = useCallback((_productId: number) => {
    setCartCount((prev) => prev + 1);
  }, []);

  const removeFromCart = useCallback((_productId: number) => {
    setCartCount((prev) => Math.max(0, prev - 1));
  }, []);

  const resetCart = useCallback(() => {
    setCartCount(0);
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, addToCart, removeFromCart, resetCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
