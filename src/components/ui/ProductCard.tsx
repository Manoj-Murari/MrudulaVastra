import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import { motion } from "framer-motion";
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

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
  variant = "default",
}: ProductCardProps) {
  const isSoldOut = product.inventory_count === 0;

  if (variant === "trending") {
    return (
      <div className="group relative">
        <Link href={`/product/${product.id}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden mb-3 bg-[#F5F0E8] border border-gold/10">
            {product.image && !product.image.includes("/api/placeholder") ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-playfair text-forest/20 font-bold" style={{ fontSize: "28px", letterSpacing: "0.1em" }}>MV</p>
                <p className="text-forest/15 font-dm text-[10px] uppercase tracking-[0.3em] mt-1">Mrudula Vastra</p>
              </div>
            )}

            {isSoldOut && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
                <span className="px-4 py-1.5 bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-[0.2em] font-dm">Sold Out</span>
              </div>
            )}

            {product.badge && (
              <span className="absolute top-3 left-3 bg-forest text-white px-3 py-1 text-[10px] uppercase tracking-wider font-bold">
                {product.badge}
              </span>
            )}

            {onToggleWishlist && (
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleWishlist(product.id);
                }}
                whileTap={{ scale: 0.85 }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-20"
                style={{ background: "rgba(253,251,247,0.9)" }}
                aria-label={`Toggle wishlist for ${product.name}`}
              >
                <motion.div
                  animate={isInWishlist ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Heart size={14} className={isInWishlist ? "fill-red-500 text-red-500" : "text-gray-400"} />
                </motion.div>
              </motion.button>
            )}

            <div className="absolute w-0 group-hover:w-full transition-all duration-500" style={{ background: "#B8963E", height: "3px", bottom: 0, left: 0 }} />
          </div>

          <div className="mt-3 sm:mt-4">
            <p className="uppercase mb-1 font-medium text-text-muted text-[9px] sm:text-[10px]" style={{ letterSpacing: "0.15em" }}>
              {product.category}
            </p>
            <h3 className="font-playfair text-text-primary font-semibold mb-1 sm:mb-2 leading-snug text-[13px] sm:text-[16px]">
              {product.name}
            </h3>
            
            <div className="flex items-center gap-2 mb-3">
              <StarRating rating={product.rating} />
              <span className="text-text-muted text-[11px]">({product.reviews})</span>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2 mt-2 sm:mt-0">
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="font-playfair text-forest font-bold text-[14px] sm:text-[17px]">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.original_price > product.price && (
                  <span className="text-gold line-through text-[10px] sm:text-[12px]">
                    ₹{product.original_price.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              
              {onAddToCart && (
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  disabled={isSoldOut}
                  whileTap={{ scale: isSoldOut ? 1 : 0.92 }}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 uppercase font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] w-full xl:w-auto z-20 ${
                    isSoldOut ? "opacity-50 cursor-not-allowed border-gray-300 text-gray-500" : "hover:bg-emerald-900 hover:text-white"
                  }`}
                  style={!isSoldOut ? { border: "1.5px solid #1A3C2E", color: "#1A3C2E", letterSpacing: "0.1em" } : { border: "1.5px solid #ccc", letterSpacing: "0.1em" }}
                >
                  <ShoppingBag size={11} className="hidden sm:block" />
                  {isSoldOut ? "Sold Out" : "Add"}
                </motion.button>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Default variant (used in ShopGrid and CategoryGrid)
  return (
    <div className="group flex flex-col h-full relative">
      <Link href={`/product/${product.id}`} className="block relative aspect-[3/4] mb-4 overflow-hidden bg-[#F5F0E8]">
        {product.image && !product.image.includes("/api/placeholder") ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-playfair text-forest/20 font-bold text-[28px] tracking-[0.1em]">MV</p>
            <p className="text-forest/15 font-dm text-[10px] uppercase tracking-[0.3em] mt-1">Mrudula Vastra</p>
          </div>
        )}

        {isSoldOut && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
            <span className="px-4 py-1.5 bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-[0.2em] font-dm">Sold Out</span>
          </div>
        )}

        {product.badge && (
          <span className="absolute top-3 left-3 bg-forest text-white px-3 py-1 text-[10px] uppercase tracking-wider font-bold font-dm">
            {product.badge}
          </span>
        )}
        {product.tag && (
          <span className="absolute top-3 right-3 bg-gold/90 text-white px-3 py-1 text-[10px] uppercase tracking-wider font-bold font-dm">
            {product.tag}
          </span>
        )}

        {onAddToCart && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product);
            }}
            disabled={isSoldOut}
            className={`absolute bottom-0 left-0 right-0 py-3 text-[11px] uppercase tracking-wider font-bold font-dm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 ${
              isSoldOut ? "hidden" : "bg-forest/90 text-white hover:bg-forest"
            }`}
          >
            Add to Bag
          </button>
        )}
      </Link>

      <div className="flex-1 flex flex-col">
        <p className="text-[10px] uppercase tracking-wider text-text-muted font-dm mb-0.5 mt-auto">
          {product.category}
        </p>
        <Link href={`/product/${product.id}`} className="mb-1">
          <h3 className="font-playfair text-forest font-semibold text-lg leading-tight group-hover:text-gold transition-colors duration-300">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 font-dm">
          <span className="text-forest font-semibold">₹{product.price.toLocaleString("en-IN")}</span>
          {product.original_price > product.price && (
            <span className="text-text-muted line-through text-sm">
              ₹{product.original_price.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-gold text-sm">★</span>
            <span className="text-sm text-text-muted font-dm">
              {product.rating} ({product.reviews})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
