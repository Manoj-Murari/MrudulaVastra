"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import StarRating from "@/components/ui/StarRating";
import OrnamentalDivider from "@/components/ui/OrnamentalDivider";
import ScrollingDivider from "@/components/ui/ScrollingDivider";
import { useCart } from "@/components/providers/CartProvider";
import { motion, AnimatePresence } from "framer-motion";
import type { Database } from "@/lib/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface TrendingSectionProps {
  products: Product[];
}

function discount(price: number, original: number) {
  return Math.round(((original - price) / original) * 100);
}

export default function TrendingSection({ products }: TrendingSectionProps) {
  const { addToCart } = useCart();
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);

  if (!products || products.length === 0) return null;

  return (
    <>
      <section className="bg-cream font-dm py-10 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 overflow-hidden w-full max-w-[100vw]">
        {/* Mobile-Only Scrolling Bar */}
        <div className="sm:hidden -mx-4 mb-10">
          <ScrollingDivider />
        </div>

        <div className="max-w-7xl lg:max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 animate-fade-up">
            <p
              className="hidden sm:block uppercase font-bold mb-4 text-gold tracking-[0.5em] text-[9px]"
            >
              The Viral Edit
            </p>
            <h2
              className="font-playfair text-forest font-medium tracking-wide text-[24px] sm:text-[clamp(24px,3.2vw,40px)]"
            >
              Trending Right Now
            </h2>
            <div className="hidden sm:flex items-center justify-center gap-4 mt-6 opacity-60">
              <div className="h-px w-12 bg-gold/40" />
              <OrnamentalDivider className="max-w-[120px]" />
              <div className="h-px w-12 bg-gold/40" />
            </div>
            
            <div className="mt-8 flex justify-center">
              <Link
                href="/collections"
                className="relative py-2 uppercase font-bold text-forest transition-all group overflow-hidden inline-block"
                style={{ fontSize: "11px", letterSpacing: "0.2em" }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore All
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1.5 transition-transform duration-300"
                  />
                </span>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gold/30 group-hover:bg-gold transition-colors duration-300" />
              </Link>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-10">
            {products.map((product, idx) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="block animate-fade-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="group cursor-pointer h-full">
                  <div
                    className="relative overflow-hidden mb-5 transition-all duration-700 ease-out group-hover:shadow-[0_20px_60px_rgba(14,34,25,0.12)] group-hover:-translate-y-2"
                    style={{
                      aspectRatio: "3.5/4.5",
                      background: "#F5F0E8",
                    }}
                  >
                    <Image
                      src={product.image}
                      alt={`${product.name} — ${product.category} by Mrudula Vastra`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      priority={idx < 4}
                      className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                    />

                    {/* High-End Badges */}
                    <div className="absolute top-4 left-4 z-10">
                      <span
                        className="text-white px-3 py-1.5 font-bold bg-forest shadow-lg"
                        style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: 'uppercase' }}
                      >
                        {product.badge}
                      </span>
                    </div>

                    {/* Instagram Reel Tag (Slide and Blur) */}
                    <div
                      className="absolute flex items-center justify-center gap-2 py-3 text-cream uppercase font-bold translate-y-full group-hover:translate-y-0 transition-all duration-500 z-10"
                      style={{
                        background: "rgba(14,34,25,0.85)",
                        backdropFilter: 'blur(8px)',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        fontSize: "9px",
                        letterSpacing: "0.2em",
                      }}
                    >
                      <InstagramIcon size={12} className="text-gold" /> {product.tag}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="mt-3 sm:mt-4">
                    <p
                      className="uppercase mb-1 font-medium text-text-muted text-[9px] sm:text-[10px]"
                      style={{ letterSpacing: "0.15em" }}
                    >
                      {product.category}
                    </p>
                    <h3
                      className="font-cormorant text-text-primary font-medium mb-1 sm:mb-2 leading-snug text-[16px] sm:text-[19px] line-clamp-2 min-h-[2.8em]"
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <StarRating rating={product.rating} />
                      <span className="text-text-muted" style={{ fontSize: "11px" }}>
                        ({product.reviews})
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gold/10">
                      <div className="flex flex-col">
                        <span className="text-gold line-through text-[10px]" style={{ letterSpacing: '0.05em' }}>
                          ₹{product.original_price.toLocaleString("en-IN")}
                        </span>
                        <span className="font-playfair text-forest font-bold text-[18px]">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (product.sizes && product.sizes.length > 1) {
                            setQuickAddProduct(product);
                          } else {
                            addToCart(product, product.sizes?.[0]);
                          }
                        }}
                        className="px-5 py-2.5 bg-forest text-cream uppercase font-black text-[9px] tracking-[0.2em] transition-all duration-300 hover:bg-forest/90 active:scale-95 shadow-md"
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {quickAddProduct && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setQuickAddProduct(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative w-full sm:w-auto sm:min-w-[360px] sm:max-w-md bg-cream shadow-2xl p-6 pt-8 pb-safe-8 sm:pb-6 rounded-t-3xl sm:rounded-2xl"
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-text-muted/20 sm:hidden" />
              <button
                onClick={() => setQuickAddProduct(null)}
                className="absolute top-4 right-4 text-text-muted hover:text-forest p-1 transition-colors"
              >
                ✕
              </button>
              <h3 className="font-playfair text-xl font-medium text-forest mb-1">Select Size</h3>
              <p className="text-text-muted text-lg font-cormorant font-medium mb-6">{quickAddProduct.name}</p>
              
              <div className="flex flex-wrap gap-3 pb-2">
                {quickAddProduct.sizes?.map((size) => {
                  const isOutOfStock = quickAddProduct.inventory_count === 0 || (
                    Array.isArray(quickAddProduct.variants) &&
                    (quickAddProduct.variants as any).find((v: any) => v.type === 'size_inventory')?.data?.[size] === 0
                  );

                  return (
                    <button
                      key={size}
                      disabled={isOutOfStock}
                      onClick={() => {
                        if (!isOutOfStock) {
                          addToCart(quickAddProduct, size);
                          setQuickAddProduct(null);
                        }
                      }}
                      className={`px-5 py-3 border text-forest font-dm text-sm tracking-wider uppercase transition-colors min-w-[72px] text-center ${
                        isOutOfStock 
                          ? "opacity-40 cursor-not-allowed border-gold/15 line-through bg-sand/10 text-text-muted/60" 
                          : "border-gold/30 hover:border-forest hover:bg-forest/5 cursor-pointer"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
