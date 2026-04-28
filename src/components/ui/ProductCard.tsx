"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import StarRating from "@/components/ui/StarRating";
import type { Database } from "@/lib/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  variant?: "default" | "trending";
  priority?: boolean;
}

/* ── Color hex lookup (shared) ─────────────────────── */
const COLOR_HEX: Record<string, string> = {
  "Red": "#D32F2F", "Blue": "#1976D2", "Green": "#388E3C", "Yellow": "#FBC02D",
  "Pink": "#E91E63", "Gold": "#D4AF37", "Black": "#000000", "White": "#FFFFFF",
  "Navy": "#000080", "Maroon": "#800000", "Silver": "#C0C0C0",
  "Grey": "#808080", "Orange": "#FF9800", "Purple": "#9C27B0", "Teal": "#008080",
  "Mustard": "#E1AD01", "Peach": "#FFDAB9", "Lavender": "#E6E6FA", "Emerald Green": "#50C878",
  "Olive": "#808000", "Magenta": "#FF00FF", "Cream": "#FFFDD0", "Beige": "#F5F5DC",
  "Turquoise": "#40E0D0", "Rust": "#B7410E", "Coral": "#FF7F50", "Indigo": "#4B0082",
  "Mint": "#98FF98", "Wine": "#722F37", "Copper": "#B87333", "Coffee": "#6F4E37",
};

function normalizeColor(color: string): string {
  const c = color.trim();
  return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
}

export default function ProductCard({
  product,
  onAddToCart,
  variant = "default",
  priority = false,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isSoldOut = product.inventory_count === 0;

  // Badge Logic
  const isActuallyNew =
    (product as any).is_new === true ||
    ((product as any).created_at &&
      new Date((product as any).created_at).getTime() >
        Date.now() - 30 * 24 * 60 * 60 * 1000);
  const activeBadge = product.tag || (isActuallyNew ? "NEW" : null);

  // Secondary Image
  const allImages = product.gallery_images || (product as any).images || [];
  const secondaryImage = allImages.length > 1
    ? allImages.find((img: string) => img !== product.image) || allImages[1]
    : null;

  // ━━ Trending variant ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
              <>
                {/* Primary image — CSS transition for hover zoom */}
                <div
                  className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform: isHovered ? "scale(1.04)" : "scale(1)",
                    opacity: isHovered && secondaryImage ? 0 : 1,
                  }}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority={priority}
                    className="object-cover"
                  />
                </div>
                
                {secondaryImage && (
                  <div
                    className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? "scale(1.04)" : "scale(1)",
                    }}
                  >
                    <Image
                      src={secondaryImage}
                      alt={`${product.name} alternate view`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-playfair text-forest/15 font-light text-[32px] tracking-[0.15em]">MV</p>
                <p className="text-forest/10 font-dm text-[9px] uppercase tracking-[0.4em] mt-1">Mrudula Vastra</p>
              </div>
            )}

            {/* Sold out overlay — NO backdrop-blur on mobile */}
            {isSoldOut && (
              <div className="absolute inset-0 bg-cream/75 flex items-center justify-center z-10 pointer-events-none">
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

            {/* Badge — NO backdrop-blur */}
            {activeBadge && (
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <span className="px-2.5 py-1 text-[9px] font-dm font-bold tracking-[0.2em] uppercase bg-white/95 text-forest border border-gold/20 shadow-sm">
                  {activeBadge}
                </span>
              </div>
            )}



            {/* Glass overlay on hover — NO backdrop-blur */}
            <div
              className="absolute bottom-0 left-0 right-0 z-20 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                background: "rgba(14,34,25,0.85)",
                transform: isHovered && !isSoldOut && onAddToCart ? "translateY(0)" : "translateY(100%)",
              }}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddToCart?.(product);
                }}
                className="w-full py-3.5 flex items-center justify-center gap-2 text-cream/90 uppercase font-dm font-medium transition-colors hover:text-gold-soft"
                style={{ fontSize: "10px", letterSpacing: "0.2em" }}
              >
                <ShoppingBag size={12} />
                Add to Bag
              </button>
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="mt-1 sm:mt-2">
            <p
              className="uppercase mb-1.5 font-normal text-text-muted text-[9px] sm:text-[10px]"
              style={{ letterSpacing: "0.2em" }}
            >
              {product.category}
            </p>
            <h3 className="font-cormorant font-medium text-text-primary mb-2 leading-snug text-[16px] sm:text-[19px] line-clamp-2 min-h-[2.8em]">
              {product.name}
            </h3>

            {product.rating > 0 && product.reviews > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={product.rating} />
                <span className="text-text-muted font-light" style={{ fontSize: "11px" }}>
                  ({product.reviews})
                </span>
              </div>
            )}

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

            {/* Color Dots */}
            {(product.variants as any)?.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2.5">
                {[product.color, ...(product.variants as any[]).map(v => v.color)].filter(Boolean).slice(0, 5).map((color, i) => (
                  <div 
                    key={i}
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-black/10"
                    style={{ background: COLOR_HEX[normalizeColor(color as string)] || "#ddd" }}
                  />
                ))}
              </div>
            )}
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
          <>
            {/* Primary image — pure CSS transition */}
            <div
              className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: isHovered ? "scale(1.04)" : "scale(1)",
                opacity: isHovered && secondaryImage ? 0 : 1,
              }}
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
                className="object-cover"
              />
            </div>
            
            {secondaryImage && (
              <div
                className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? "scale(1.04)" : "scale(1)",
                }}
              >
                <Image
                  src={secondaryImage}
                  alt={`${product.name} alternate view`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-playfair text-forest/15 font-light text-[32px] tracking-[0.15em]">MV</p>
            <p className="text-forest/10 font-dm text-[9px] uppercase tracking-[0.4em] mt-1">Mrudula Vastra</p>
          </div>
        )}

        {/* Sold out — NO backdrop-blur */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-cream/75 flex items-center justify-center z-10 pointer-events-none">
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

        {/* Badge — NO backdrop-blur */}
        {activeBadge && (
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <span className="px-2.5 py-1 text-[9px] font-dm font-bold tracking-[0.2em] uppercase bg-white/95 text-forest border border-gold/20 shadow-sm">
              {activeBadge}
            </span>
          </div>
        )}

        {/* Glass "Add to Bag" overlay — NO backdrop-blur, CSS-only animation */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            background: "rgba(14,34,25,0.85)",
            transform: isHovered && !isSoldOut && onAddToCart ? "translateY(0)" : "translateY(100%)",
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.(product);
            }}
            className="w-full py-4 flex items-center justify-center gap-2.5 text-cream/90 uppercase font-dm font-medium transition-colors hover:text-gold-soft"
            style={{ fontSize: "11px", letterSpacing: "0.2em" }}
          >
            <ShoppingBag size={13} />
            Add to Bag
          </button>
        </div>
      </Link>

      {/* ── Product Details ── */}
      <div className="flex-1 flex flex-col">
        <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-dm font-normal mb-1 mt-auto">
          {product.category}
        </p>
        <Link href={`/product/${product.id}`} className="mb-2">
          <h3 className="font-cormorant text-forest font-medium text-xl leading-tight group-hover:text-gold transition-colors duration-500 line-clamp-2 min-h-[2.6em]">
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

        {/* Color Dots */}
        {((product as any).variants as any[])?.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3">
            {[product.color, ...((product as any).variants as any[]).map(v => v.color)].filter(Boolean).slice(0, 5).map((color, i) => (
              <div 
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-black/10"
                style={{ background: COLOR_HEX[normalizeColor(color as string)] || "#ddd" }}
              />
            ))}
            {((product as any).variants as any[]).length > 4 && (
              <span className="text-[10px] text-text-muted font-dm">+{ ((product as any).variants as any[]).length - 4 }</span>
            )}
          </div>
        )}

        {product.rating > 0 && product.reviews > 0 && (
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
