"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import StarRating from "@/components/ui/StarRating";
import type { Database } from "@/lib/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (productId: number) => void;
  isInWishlist?: boolean;
  variant?: "default" | "trending";
}

/* ── Animation Variants ───────────────────────────────── */
const luxuryEase = [0.16, 1, 0.3, 1] as const;

const glassReveal = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: luxuryEase },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] as const },
  },
};

const priceReveal = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.06, duration: 0.35, ease: luxuryEase },
  }),
};

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
  variant = "default",
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isSoldOut = product.inventory_count === 0;

  if (variant === "trending") {
    return (
      <div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/product/${product.id}`} className="block">
          {/* ── Image Container ── */}
          <div className="relative aspect-[3/4] overflow-hidden mb-5 bg-sand">
            {product.image && !product.image.includes("/api/placeholder") ? (
              <motion.div
                className="absolute inset-0"
                animate={{ scale: isHovered ? 1.04 : 1 }}
                transition={{ duration: 0.7, ease: luxuryEase }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p
                  className="font-playfair text-forest/15 font-light"
                  style={{ fontSize: "32px", letterSpacing: "0.15em" }}
                >
                  MV
                </p>
                <p className="text-forest/10 font-dm text-[9px] uppercase tracking-[0.4em] mt-1">
                  Mrudula Vastra
                </p>
              </div>
            )}

            {/* Sold out overlay */}
            {isSoldOut && (
              <div className="absolute inset-0 bg-cream/70 backdrop-blur-[3px] flex items-center justify-center z-10 pointer-events-none">
                <span
                  className="px-5 py-2 text-text-primary font-dm uppercase font-medium"
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.25em",
                    border: "1px solid rgba(28,28,28,0.15)",
                  }}
                >
                  Sold Out
                </span>
              </div>
            )}

            {/* Badge */}
            {product.badge && (
              <span
                className="absolute top-4 left-4 bg-forest/90 text-cream/90 px-3 py-1.5 font-dm uppercase font-medium"
                style={{ fontSize: "9px", letterSpacing: "0.2em" }}
              >
                {product.badge}
              </span>
            )}

            {/* Wishlist */}
            {onToggleWishlist && (
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleWishlist(product.id);
                }}
                whileTap={{ scale: 0.85 }}
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 z-20"
                style={{
                  background: "rgba(253,251,247,0.8)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(253,251,247,0.5)",
                  opacity: isHovered || isInWishlist ? 1 : 0,
                }}
                aria-label={`Toggle wishlist for ${product.name}`}
              >
                <motion.div
                  animate={
                    isInWishlist ? { scale: [1, 1.3, 1] } : { scale: 1 }
                  }
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    size={14}
                    className={
                      isInWishlist
                        ? "fill-red-500 text-red-500"
                        : "text-text-muted"
                    }
                  />
                </motion.div>
              </motion.button>
            )}

            {/* ── Glass overlay on hover ── */}
            <AnimatePresence>
              {isHovered && !isSoldOut && onAddToCart && (
                <motion.div
                  variants={glassReveal}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute bottom-0 left-0 right-0 z-20"
                  style={{
                    background: "rgba(14,34,25,0.75)",
                    backdropFilter: "blur(16px) saturate(1.3)",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    className="w-full py-3.5 flex items-center justify-center gap-2 text-cream/90 uppercase font-dm font-medium transition-colors hover:text-gold-soft"
                    style={{ fontSize: "10px", letterSpacing: "0.2em" }}
                  >
                    <ShoppingBag size={12} />
                    Add to Bag
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Product Info — Clean, minimal ── */}
          <div className="mt-1 sm:mt-2">
            <p
              className="uppercase mb-1.5 font-normal text-text-muted text-[9px] sm:text-[10px]"
              style={{ letterSpacing: "0.2em" }}
            >
              {product.category}
            </p>
            <h3 className="font-playfair text-text-primary font-medium mb-2 leading-snug text-[14px] sm:text-[17px]">
              {product.name}
            </h3>

            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={product.rating} />
              <span
                className="text-text-muted font-light"
                style={{ fontSize: "11px" }}
              >
                ({product.reviews})
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-playfair text-forest font-medium text-[15px] sm:text-[18px]">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.original_price > product.price && (
                <span className="text-text-muted/60 line-through text-[11px] sm:text-[12px]">
                  ₹{product.original_price.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // ━━ Default variant (ShopGrid / CategoryGrid) ━━━━━━━━━━━━━━━━
  return (
    <div
      className="group flex flex-col h-full relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/product/${product.id}`}
        className="block relative aspect-[3/4] mb-5 overflow-hidden bg-sand"
      >
        {product.image && !product.image.includes("/api/placeholder") ? (
          <motion.div
            className="absolute inset-0"
            animate={{ scale: isHovered ? 1.04 : 1 }}
            transition={{ duration: 0.7, ease: luxuryEase }}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p
              className="font-playfair text-forest/15 font-light text-[32px] tracking-[0.15em]"
            >
              MV
            </p>
            <p className="text-forest/10 font-dm text-[9px] uppercase tracking-[0.4em] mt-1">
              Mrudula Vastra
            </p>
          </div>
        )}

        {/* Sold out */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-cream/70 backdrop-blur-[3px] flex items-center justify-center z-10 pointer-events-none">
            <span
              className="px-5 py-2 text-text-primary font-dm uppercase font-medium"
              style={{
                fontSize: "10px",
                letterSpacing: "0.25em",
                border: "1px solid rgba(28,28,28,0.15)",
              }}
            >
              Sold Out
            </span>
          </div>
        )}

        {/* Badges */}
        {product.badge && (
          <span
            className="absolute top-4 left-4 bg-forest/90 text-cream/90 px-3 py-1.5 font-dm uppercase font-medium"
            style={{ fontSize: "9px", letterSpacing: "0.2em" }}
          >
            {product.badge}
          </span>
        )}
        {product.tag && (
          <span
            className="absolute top-4 right-4 text-cream/90 px-3 py-1.5 font-dm uppercase font-medium"
            style={{
              fontSize: "9px",
              letterSpacing: "0.2em",
              background: "rgba(184,150,62,0.85)",
              backdropFilter: "blur(4px)",
            }}
          >
            {product.tag}
          </span>
        )}

        {/* ── Glass "Add to Bag" overlay ── */}
        <AnimatePresence>
          {isHovered && !isSoldOut && onAddToCart && (
            <motion.div
              variants={glassReveal}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute bottom-0 left-0 right-0 z-20"
              style={{
                background: "rgba(14,34,25,0.75)",
                backdropFilter: "blur(16px) saturate(1.3)",
              }}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(product);
                }}
                className="w-full py-4 flex items-center justify-center gap-2.5 text-cream/90 uppercase font-dm font-medium transition-colors hover:text-gold-soft"
                style={{ fontSize: "11px", letterSpacing: "0.2em" }}
              >
                <ShoppingBag size={13} />
                Add to Bag
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* ── Product Details — Progressive disclosure ── */}
      <div className="flex-1 flex flex-col">
        <p
          className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-dm font-normal mb-1 mt-auto"
        >
          {product.category}
        </p>
        <Link href={`/product/${product.id}`} className="mb-2">
          <h3 className="font-playfair text-forest font-medium text-lg leading-tight group-hover:text-gold transition-colors duration-500">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 font-dm">
          <span className="text-forest font-medium">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {product.original_price > product.price && (
            <span className="text-text-muted/50 line-through text-sm">
              ₹{product.original_price.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        {product.rating > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-gold text-sm">★</span>
            <span className="text-sm text-text-muted font-dm font-light">
              {product.rating} ({product.reviews})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
