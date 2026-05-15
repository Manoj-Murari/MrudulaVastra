"use client";

import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { X, Ruler } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Database } from "@/lib/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

const TOPS_SIZES = [
  { size: "XS", bust: "32", waist: "24–26", hip: "34–36" },
  { size: "S", bust: "34", waist: "26–28", hip: "36–38" },
  { size: "M", bust: "36", waist: "28–30", hip: "38–40" },
  { size: "L", bust: "38", waist: "30–32", hip: "40–42" },
  { size: "XL", bust: "40", waist: "32–34", hip: "42–44" },
  { size: "XXL", bust: "42", waist: "34–36", hip: "44–46" },
  { size: "3XL", bust: "44", waist: "36–38", hip: "46–48" },
];

const SIZE_ORDER = [
  "Unstitched", "Free Size",
  "XS", "S", "M", "L", "XL", "XXL", "3XL",
  "32", "34", "36", "38", "40", "42", "44", "46", "48",
  "New born", "0-3 M", "3-6 M", "6-9M", "9-12M",
  "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y", "9-10Y"
];

const BOTTOMS_SIZES = [
  { size: "XS", waist: "24–26", hip: "34–36" },
  { size: "S", waist: "26–28", hip: "36–38" },
  { size: "M", waist: "28–30", hip: "38–40" },
  { size: "L", waist: "30–32", hip: "40–42" },
  { size: "XL", waist: "32–34", hip: "42–44" },
];

export default function ProductActions({ product, isSoldOut, isCTAVisible = false }: { product: Product; isSoldOut: boolean; isCTAVisible?: boolean }) {
  const { addToCart } = useCart();
  const [showSizeChart, setShowSizeChart] = useState(false);

  const sizeInventoryVariant = Array.isArray(product.variants)
    ? (product.variants as any[]).find(v => v && v.type === "size_inventory")
    : null;
  const sizeStock = sizeInventoryVariant ? sizeInventoryVariant.data : null;

  const sortedSizes = product.sizes ? [...product.sizes].sort((a, b) => {
    const indexA = SIZE_ORDER.indexOf(a);
    const indexB = SIZE_ORDER.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  }) : [];

  // Select the first size that is actually in stock, if any
  const firstInStockSize = sortedSizes.find(size => {
    if (!sizeStock) return true;
    return sizeStock[size] === undefined || (sizeStock[size] as number) > 0;
  });

  const [selectedSize, setSelectedSize] = useState<string>(
    firstInStockSize || sortedSizes[0] || ""
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-sm">
      {/* Size Selector */}
      {sortedSizes.length > 0 && (
        <div>
          <div className="flex justify-between items-end mb-3">
            <h3 className="font-dm text-sm uppercase tracking-widest font-bold text-forest">
              Select Size
            </h3>
            <button
              onClick={() => setShowSizeChart(true)}
              className="text-[11px] uppercase tracking-wider text-text-muted hover:text-gold transition-colors font-dm underline underline-offset-4"
            >
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {sortedSizes.map((size) => {
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
        onClick={() => {
          if (!isSoldOut && (sortedSizes.length === 0 || selectedSize)) {
            addToCart(product, selectedSize || undefined);
          }
        }}
        disabled={isSoldOut || (sortedSizes.length > 0 && !selectedSize) || (selectedSize ? (sizeStock && sizeStock[selectedSize] !== undefined && (sizeStock[selectedSize] as number) <= 0) : false)}
        className={`w-full py-4 uppercase tracking-[0.15em] text-sm font-bold transition-all flex justify-center items-center ${
          isSoldOut
            ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
            : "bg-forest text-white hover:bg-forest/90 active:scale-[0.99] shadow-lg shadow-forest/10 hover:shadow-forest/20"
        }`}
      >
        {isSoldOut ? "Sold Out" : "Add To Bag"}
      </button>

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={() => setShowSizeChart(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative bg-cream w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto border border-gold/20 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "fadeIn 0.2s ease-out" }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-cream z-10 px-6 py-5 border-b border-gold/15 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Ruler size={18} className="text-gold" />
                <h2 className="font-playfair text-forest font-bold text-lg">Size Guide</h2>
              </div>
              <button
                onClick={() => setShowSizeChart(false)}
                className="p-1.5 text-text-muted hover:text-forest transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6 space-y-8">

              {/* Tops / Dresses / Sets */}
              <div>
                <h3 className="font-dm text-[11px] uppercase tracking-[0.2em] font-bold text-forest/70 mb-3">
                  Tops / Dresses / Sets
                </h3>
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gold/15">
                        <th className="text-left py-2.5 px-2 font-dm text-forest font-semibold text-xs uppercase tracking-wider">Size</th>
                        <th className="text-center py-2.5 px-2 font-dm text-forest font-semibold text-xs uppercase tracking-wider">Bust</th>
                        <th className="text-center py-2.5 px-2 font-dm text-forest font-semibold text-xs uppercase tracking-wider">Waist</th>
                        <th className="text-center py-2.5 px-2 font-dm text-forest font-semibold text-xs uppercase tracking-wider">Hip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TOPS_SIZES.map((row) => (
                        <tr key={row.size} className="border-b border-gold/5 hover:bg-forest/[0.02] transition-colors">
                          <td className="py-2.5 px-2 font-dm text-forest font-bold text-sm">{row.size}</td>
                          <td className="py-2.5 px-2 font-dm text-text-muted text-sm text-center">{row.bust}&quot;</td>
                          <td className="py-2.5 px-2 font-dm text-text-muted text-sm text-center">{row.waist}&quot;</td>
                          <td className="py-2.5 px-2 font-dm text-text-muted text-sm text-center">{row.hip}&quot;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottoms / Pants */}
              <div>
                <h3 className="font-dm text-[11px] uppercase tracking-[0.2em] font-bold text-forest/70 mb-3">
                  Bottoms / Pants
                </h3>
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gold/15">
                        <th className="text-left py-2.5 px-2 font-dm text-forest font-semibold text-xs uppercase tracking-wider">Size</th>
                        <th className="text-center py-2.5 px-2 font-dm text-forest font-semibold text-xs uppercase tracking-wider">Waist</th>
                        <th className="text-center py-2.5 px-2 font-dm text-forest font-semibold text-xs uppercase tracking-wider">Hip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BOTTOMS_SIZES.map((row) => (
                        <tr key={row.size} className="border-b border-gold/5 hover:bg-forest/[0.02] transition-colors">
                          <td className="py-2.5 px-2 font-dm text-forest font-bold text-sm">{row.size}</td>
                          <td className="py-2.5 px-2 font-dm text-text-muted text-sm text-center">{row.waist}&quot;</td>
                          <td className="py-2.5 px-2 font-dm text-text-muted text-sm text-center">{row.hip}&quot;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* How to Measure */}
              <div className="border-t border-gold/10 pt-6">
                <h3 className="font-dm text-[11px] uppercase tracking-[0.2em] font-bold text-forest/70 mb-4">
                  How to Measure
                </h3>

                {/* Measurement illustration */}
                <div className="flex justify-center mb-5">
                  <div className="bg-forest/[0.02] border border-forest/10 rounded-lg p-4 inline-block">
                    <Image
                      src="/measurement-guide.png"
                      alt="How to measure - Bust, Waist and Hip"
                      width={220}
                      height={290}
                      className="mx-auto"
                      style={{ maxHeight: "260px", width: "auto" }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-forest">1</span>
                    </span>
                    <p className="text-sm font-dm text-text-muted leading-relaxed">
                      <span className="font-semibold text-forest">Bust:</span> Measure around the fullest part of the chest.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-forest">2</span>
                    </span>
                    <p className="text-sm font-dm text-text-muted leading-relaxed">
                      <span className="font-semibold text-forest">Waist:</span> Measure around the narrowest part of the waist.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-forest">3</span>
                    </span>
                    <p className="text-sm font-dm text-text-muted leading-relaxed">
                      <span className="font-semibold text-forest">Hip:</span> Measure around the fullest part of the hips.
                    </p>
                  </div>
                </div>
              </div>

              {/* Link to full page */}
              <div className="text-center pt-2">
                <Link
                  href="/size-guide"
                  onClick={() => setShowSizeChart(false)}
                  className="text-[11px] uppercase tracking-wider text-gold hover:text-forest font-dm font-bold underline underline-offset-4 transition-colors"
                >
                  View Full Size Guide →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky CTA Bar — visible only when inline Add to Bag is scrolled out of view */}
      {isCTAVisible && (
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 border-t"
          style={{
            background: "rgba(253,251,247,0.97)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(184,150,62,0.15)",
            boxShadow: "0 -4px 24px rgba(26,60,46,0.08)",
          }}
        >
          <div className="flex flex-col">
            <span className="font-playfair text-forest font-bold text-lg leading-none">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.original_price > product.price && (
              <span className="text-text-muted line-through text-xs font-dm">
                ₹{product.original_price.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <button
            className={`flex-1 py-3.5 text-sm uppercase tracking-[0.15em] font-bold transition-all ${
              isSoldOut || (sortedSizes.length > 0 && !selectedSize) || (selectedSize ? (sizeStock && sizeStock[selectedSize] !== undefined && (sizeStock[selectedSize] as number) <= 0) : false)
                ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                : "bg-forest text-white active:scale-[0.99] shadow-lg shadow-forest/20"
            }`}
            disabled={isSoldOut || (sortedSizes.length > 0 && !selectedSize) || (selectedSize ? (sizeStock && sizeStock[selectedSize] !== undefined && (sizeStock[selectedSize] as number) <= 0) : false)}
            onClick={() => {
              if (!isSoldOut && (sortedSizes.length === 0 || selectedSize)) {
                addToCart(product, selectedSize || undefined);
              }
            }}
          >
            {isSoldOut ? "Sold Out" : "Add To Bag"}
          </button>
        </div>
      )}
    </div>
  );
}
