"use client";

import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import type { Database } from "@/lib/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export default function ProductActions({ product, isSoldOut }: { product: Product; isSoldOut: boolean }) {
  const { addToCart } = useCart();
  const sizeInventoryVariant = Array.isArray(product.variants)
    ? (product.variants as any[]).find(v => v && v.type === "size_inventory")
    : null;
  const sizeStock = sizeInventoryVariant ? sizeInventoryVariant.data : null;

  // Select the first size that is actually in stock, if any
  const firstInStockSize = product.sizes?.find(size => {
    if (!sizeStock) return true;
    return sizeStock[size] === undefined || (sizeStock[size] as number) > 0;
  });

  const [selectedSize, setSelectedSize] = useState<string>(
    firstInStockSize || product.sizes?.[0] || ""
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-sm">
      {/* Size Selector */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <div className="flex justify-between items-end mb-3">
            <h3 className="font-dm text-sm uppercase tracking-widest font-bold text-forest">
              Select Size
            </h3>
            <button className="text-[11px] uppercase tracking-wider text-text-muted hover:text-gold transition-colors font-dm underline underline-offset-4">
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map((size) => {
              const isSizeOutOfStock = sizeStock && sizeStock[size] !== undefined && (sizeStock[size] as number) <= 0;
              return (
                <button
                  key={size}
                  onClick={() => !isSizeOutOfStock && setSelectedSize(size)}
                  disabled={isSizeOutOfStock}
                  className={`py-3 px-5 border transition-all duration-300 font-dm text-sm uppercase tracking-wider font-semibold ${
                    selectedSize === size
                      ? "border-forest bg-forest text-white"
                      : isSizeOutOfStock
                      ? "border-neutral-200 text-neutral-400 bg-neutral-50 cursor-not-allowed opacity-60 line-through"
                      : "border-gold/30 text-forest hover:border-forest/50 hover:bg-forest/5"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => !isSoldOut && selectedSize && addToCart(product, selectedSize || undefined)}
        disabled={isSoldOut || (selectedSize ? (sizeStock && sizeStock[selectedSize] !== undefined && (sizeStock[selectedSize] as number) <= 0) : false)}
        className={`w-full py-4 uppercase tracking-[0.15em] text-sm font-bold transition-all flex justify-center items-center ${
          isSoldOut
            ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
            : "bg-forest text-white hover:bg-forest/90 active:scale-[0.99] shadow-lg shadow-forest/10 hover:shadow-forest/20"
        }`}
      >
        {isSoldOut ? "Sold Out" : "Add To Bag"}
      </button>
    </div>
  );
}
