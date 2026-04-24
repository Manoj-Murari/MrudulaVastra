"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart, ArrowRight } from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import StarRating from "@/components/ui/StarRating";
import { useCart } from "@/components/providers/CartProvider";
import type { Database } from "@/lib/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface TrendingSectionProps {
  products: Product[];
}

function discount(price: number, original: number) {
  return Math.round(((original - price) / original) * 100);
}

export default function TrendingSection({ products }: TrendingSectionProps) {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const { addToCart } = useCart();

  const toggleWishlist = (id: number) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <section className="bg-cream font-dm py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-10 overflow-hidden w-full max-w-[100vw]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 lg:mb-20 gap-4 animate-fade-up">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-forest flex items-center justify-center">
                <InstagramIcon size={13} className="text-white" />
              </div>
              <p
                className="uppercase font-medium text-gold"
                style={{ fontSize: "11px", letterSpacing: "0.35em" }}
              >
                As Seen on Reels
              </p>
            </div>
            <h2
              className="font-playfair text-text-primary font-light"
              style={{ fontSize: "clamp(28px, 3vw, 44px)" }}
            >
              Trending Right Now
            </h2>
          </div>

          <div className="self-end sm:self-auto">
            <Link
              href="/collections"
              className="flex items-center gap-2 uppercase font-semibold text-forest hover:text-amber-700 transition-colors group"
              style={{ fontSize: "13px", letterSpacing: "0.08em" }}
            >
              View All
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
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
                {/* Image Container */}
                <div
                  className="relative overflow-hidden mb-4"
                  style={{
                    aspectRatio: "4/5",
                    background: "#F0EBE1",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <Image
                    src={product.image}
                    alt={`${product.name} — ${product.category} by Mrudula Vastra, premium Indian ethnic wear`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority={idx < 2}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    <span
                      className="text-white px-2.5 py-1 font-semibold bg-forest"
                      style={{ fontSize: "10px", letterSpacing: "0.05em" }}
                    >
                      {product.badge}
                    </span>
                    <span
                      className="text-white px-2 py-1 font-bold bg-gold"
                      style={{ fontSize: "10px" }}
                    >
                      -{discount(product.price, product.original_price)}%
                    </span>
                  </div>

                  {/* Wishlist */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90"
                    style={{ background: "rgba(253,251,247,0.9)" }}
                    aria-label={`Toggle wishlist for ${product.name}`}
                  >
                    <Heart
                      size={14}
                      className={
                        wishlist.includes(product.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                      }
                    />
                  </button>

                  {/* Reel tag */}
                  <div
                    className="absolute flex items-center justify-center gap-1.5 py-2 text-amber-200 uppercase font-semibold translate-y-full group-hover:translate-y-0 transition-transform duration-400"
                    style={{
                      background: "rgba(26,60,46,0.9)",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      fontSize: "10px",
                      letterSpacing: "0.1em",
                    }}
                  >
                    <InstagramIcon size={11} /> {product.tag}
                  </div>

                  {/* Gold accent line on hover */}
                  <div
                    className="absolute w-0 group-hover:w-full transition-all duration-500"
                    style={{ background: "#B8963E", height: "3px", bottom: 0, left: 0 }}
                  />
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
                    className="font-cormorant text-text-primary font-medium mb-1 sm:mb-2 leading-snug text-[16px] sm:text-[19px]"
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating rating={product.rating} />
                    <span className="text-text-muted" style={{ fontSize: "11px" }}>
                      ({product.reviews})
                    </span>
                  </div>
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2 mt-2 sm:mt-0">
                    <div className="flex items-baseline gap-1.5 sm:gap-2">
                      <span
                        className="font-playfair text-forest font-medium text-[15px] sm:text-[18px]"
                      >
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      <span
                        className="text-gold line-through text-[10px] sm:text-[12px]"
                      >
                        ₹{product.original_price.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 uppercase font-semibold hover:bg-emerald-900 hover:text-white transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] w-full xl:w-auto active:scale-95"
                      style={{
                        border: "1.5px solid #1A3C2E",
                        color: "#1A3C2E",
                        letterSpacing: "0.1em",
                      }}
                    >
                      <ShoppingBag size={11} className="hidden sm:block" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
