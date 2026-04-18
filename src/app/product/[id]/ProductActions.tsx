"use client";

import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  original_price: number;
  image: string;
  tag: string;
  rating: number;
  reviews: number;
  badge: string;
  is_trending: boolean;
  color: string | null;
  material: string | null;
  sizes: string[] | null;
  inventory_count: number;
  gallery_images: string[] | null;
}

export default function ProductActions({ product, isSoldOut }: { product: Product; isSoldOut: boolean }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes?.[0] || ""
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
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`py-3 px-5 border transition-all duration-300 font-dm text-sm uppercase tracking-wider font-semibold ${
                  selectedSize === size
                    ? "border-forest bg-forest text-white"
                    : "border-gold/30 text-forest hover:border-forest/50 hover:bg-forest/5"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => !isSoldOut && addToCart(product, selectedSize || undefined)}
        disabled={isSoldOut}
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
