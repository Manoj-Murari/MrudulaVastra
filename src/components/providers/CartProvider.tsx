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
  warning: string | null;
  setWarning: (msg: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (warning) {
      const timer = setTimeout(() => setWarning(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [warning]);

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
      const actualSize = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
      const cartItemId = `${product.id}-${actualSize || "none"}`;
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      
      if (existing) {
        const newQuantity = existing.quantity + 1;
        if (newQuantity > product.inventory_count) {
          setWarning(`Only ${product.inventory_count} items in stock.`);
          return prev;
        }
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      if (product.inventory_count < 1) {
        setWarning("This item is out of stock.");
        return prev;
      }
      return [...prev, { cartItemId, product, quantity: 1, selectedSize: actualSize }];
    });
    setIsCartOpen(true); // Auto open cart on add
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(cartItemId);
    setItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          if (quantity > item.product.inventory_count) {
            setWarning(`Only ${item.product.inventory_count} items in stock.`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
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
        warning,
        setWarning,
      }}
    >
      {children}
      {warning && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#E07A5F] text-white px-5 py-3 rounded-lg shadow-2xl text-xs uppercase tracking-widest font-bold flex items-center gap-3 animate-fade-in font-dm select-none border border-white/10">
          <span className="text-base leading-none">⚠️</span>
          <span>{warning}</span>
          <button onClick={() => setWarning(null)} className="text-white hover:text-white/80 font-bold ml-3 text-sm">✕</button>
        </div>
      )}
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
