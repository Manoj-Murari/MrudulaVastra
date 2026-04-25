"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Database } from "@/lib/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
}

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  addToCart: (product: Product, selectedSize?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  resetCart: () => void;
  toggleCart: (open?: boolean) => void;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mrudula_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Silent fail: localStorage unavailable (SSR / private browsing)
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("mrudula_cart", JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const addToCart = useCallback((product: Product, selectedSize?: string) => {
    setItems((prev) => {
      const cartItemId = `${product.id}-${selectedSize || "none"}`;
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { cartItemId, product, quantity: 1, selectedSize }];
    });
    setIsCartOpen(true); // Auto open cart on add
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(cartItemId);
    setItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const resetCart = useCallback(() => {
    setItems([]);
  }, []);

  const toggleCart = useCallback((open?: boolean) => {
    setIsCartOpen((prev) => (open !== undefined ? open : !prev));
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        cartTotal,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        resetCart,
        toggleCart,
        isHydrated,
      }}
    >
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
