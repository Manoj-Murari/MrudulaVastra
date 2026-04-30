"use client";

import { useState } from "react";
import ProductGallery from "./ProductGallery";
import ProductActions from "./ProductActions";
import { Star, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/lib/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
interface ProductVariant {
  color: string;
  image: string;
  gallery_images: string[];
  inventory_count: number;
}

export default function ProductDetailsManager({ 
  product, 
  colorVariants = [] 
}: { 
  product: Product;
  colorVariants?: { id: number; color: string | null; image: string; inventory_count: number }[];
}) {
  const variants = (product.variants as unknown as ProductVariant[]) || [];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const displayImage = selectedVariant?.image || product.image;
  const displayGallery = selectedVariant ? selectedVariant.gallery_images : product.gallery_images;
  const displayStock = selectedVariant ? selectedVariant.inventory_count : product.inventory_count;
  const displayColor = selectedVariant ? selectedVariant.color : product.color;

  const COLOR_MAP: Record<string, string> = {
    "Red": "#D32F2F", "Blue": "#1976D2", "Green": "#388E3C", "Yellow": "#FBC02D",
    "Pink": "#E91E63", "Gold": "#D4AF37", "Black": "#000000", "White": "#FFFFFF",
    "Navy": "#000080", "Maroon": "#800000", "Silver": "#C0C0C0", "Multicolor": "linear-gradient(to right, red, blue, green)",
    "Grey": "#808080", "Orange": "#FF9800", "Purple": "#9C27B0", "Teal": "#008080",
    "Mustard": "#E1AD01", "Peach": "#FFDAB9", "Lavender": "#E6E6FA", "Emerald Green": "#50C878",
    "Olive": "#808000", "Magenta": "#FF00FF", "Cream": "#FFFDD0", "Beige": "#F5F5DC",
    "Turquoise": "#40E0D0", "Rust": "#B7410E", "Coral": "#FF7F50", "Indigo": "#4B0082",
    "Mint": "#98FF98", "Wine": "#722F37", "Copper": "#B87333", "Coffee": "#6F4E37"
  };

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-20 flex flex-col lg:flex-row gap-10 lg:gap-24">
      <ProductGallery 
        primaryImage={displayImage} 
        galleryImages={displayGallery} 
        productName={product.name} 
        badge={product.badge} 
        tag={product.tag} 
        isSoldOut={displayStock === 0} 
      />

      {/* Right Side: Details & Actions */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted font-dm mb-2">
          {product.category}
        </p>
        <h1 className="font-cormorant text-forest font-medium text-4xl lg:text-[42px] leading-snug mb-4">
          {product.name}
        </h1>
        
        <div className="flex items-center gap-4 mb-6">
          <span className="font-playfair text-forest font-bold text-2xl lg:text-3xl">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {product.original_price > product.price && (
            <span className="text-text-muted line-through text-lg">
              ₹{product.original_price.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {product.reviews > 0 && product.rating > 0 ? (
          <div className="flex items-center gap-2 mb-8 pb-8 border-b border-gold/10">
            <span className="text-[#1b7a66] text-lg">★</span>
            <span className="text-forest font-dm font-medium">{product.rating}</span>
            <span className="text-text-muted font-dm">({product.reviews} reviews)</span>
          </div>
        ) : (
          <div className="mb-8 pb-8 border-b border-gold/10" />
        )}

        {/* Description */}
        {(product as any).description && (
          <div className="mb-8 text-text-muted font-dm text-sm leading-relaxed whitespace-pre-wrap">
            {(product as any).description}
          </div>
        )}

        {/* Color Variants Selector (Linked Products & Internal Variants) */}
        {(variants.length > 0 || product.color || colorVariants.length > 0) && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] uppercase tracking-widest font-bold text-forest font-dm">
                Select Color: <span className="text-text-muted ml-1 font-normal">{displayColor}</span>
              </h3>
              {displayStock === 0 && colorVariants.some(cv => cv.inventory_count > 0) && (
                <span className="text-[10px] text-gold font-bold uppercase tracking-wider animate-pulse">
                  Other colors available in stock
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4">
              {/* Main Product Color */}
              {product.color && (
                <button
                  onClick={() => setSelectedVariant(null)}
                  className={`group relative w-12 h-12 rounded-full border-2 transition-all p-0.5 ${
                    selectedVariant === null ? "border-forest scale-110 shadow-md" : "border-transparent"
                  } ${product.inventory_count === 0 ? "opacity-60" : ""}`}
                  title={`${product.color} ${product.inventory_count === 0 ? "(Sold Out)" : ""}`}
                >
                  <div 
                    className="w-full h-full rounded-full border border-black/5"
                    style={{ background: COLOR_MAP[product.color] || "#ddd" }}
                  />
                  {product.inventory_count === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-[1px] bg-forest/40 rotate-45" />
                    </div>
                  )}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 bg-white px-2 py-1 shadow-sm rounded border border-gold/10">
                    {product.color} {product.inventory_count === 0 ? "(Sold Out)" : ""}
                  </div>
                </button>
              )}
              
              {/* Linked Product Variants (Separate IDs) */}
              {colorVariants.map((cv) => (
                <Link
                  key={cv.id}
                  href={`/product/${cv.id}`}
                  className={`group relative w-12 h-12 rounded-full border-2 transition-all p-0.5 border-transparent hover:border-gold/30 ${cv.inventory_count === 0 ? "opacity-60" : ""}`}
                  title={`${cv.color} ${cv.inventory_count === 0 ? "(Sold Out)" : ""}`}
                >
                  <div 
                    className="w-full h-full rounded-full border border-black/5"
                    style={{ background: cv.color ? (COLOR_MAP[cv.color] || "#ddd") : "#ddd" }}
                  />
                  {cv.inventory_count === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-[1px] bg-forest/40 rotate-45" />
                    </div>
                  )}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 bg-white px-2 py-1 shadow-sm rounded border border-gold/10">
                    {cv.color} {cv.inventory_count === 0 ? "(Sold Out)" : ""}
                  </div>
                </Link>
              ))}

              {/* Internal JSON Variants (If any) */}
              {Array.isArray(variants) && variants.map((v, i) => (
                <button
                  key={`v-${i}`}
                  onClick={() => setSelectedVariant(v)}
                  className={`group relative w-12 h-12 rounded-full border-2 transition-all p-0.5 ${
                    selectedVariant?.color === v.color ? "border-forest scale-110 shadow-md" : "border-transparent"
                  } ${v.inventory_count === 0 ? "opacity-60" : ""}`}
                  title={`${v.color} ${v.inventory_count === 0 ? "(Sold Out)" : ""}`}
                >
                  <div 
                    className="w-full h-full rounded-full border border-black/5"
                    style={{ background: COLOR_MAP[v.color] || "#ddd" }}
                  />
                  {v.inventory_count === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-[1px] bg-forest/40 rotate-45" />
                    </div>
                  )}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 bg-white px-2 py-1 shadow-sm rounded border border-gold/10">
                    {v.color} {v.inventory_count === 0 ? "(Sold Out)" : ""}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Specs */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-10">
          {product.material && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-text-muted font-dm mb-1">Material</p>
              <p className="font-playfair text-forest text-lg font-semibold">{product.material}</p>
            </div>
          )}
        </div>

        <ProductActions product={product} isSoldOut={displayStock === 0} />

        {/* Easy Returns UI */}
        <Link href="/returns" className="mt-6 flex items-center justify-center gap-2 p-3.5 rounded-xl border border-gold/20 bg-[#F9F6F0] text-forest font-dm text-sm font-medium transition-colors hover:bg-gold/10">
          <RefreshCw size={18} className="text-gold" />
          Easy Returns & Exchanges Available
        </Link>

        <div className="mt-12 space-y-4 font-dm text-sm text-text-muted">
          <p className="flex items-center gap-3">
            <span className="text-gold">✓</span> 100% Authentic Product
          </p>
          <p className="flex items-center gap-3">
            <span className="text-gold">✓</span> Free shipping on orders over ₹2000
          </p>
          <p className="flex items-center gap-3">
            <span className="text-gold">✓</span> 7-day return/exchange available
          </p>
        </div>
      </div>
    </section>
  );
}
