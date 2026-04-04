"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { ShoppingBag, Heart, ArrowRight } from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import StarRating from "@/components/ui/StarRating";
import { useCart } from "@/components/providers/CartProvider";
import { PRODUCTS } from "@/data/products";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  },
};

function discount(price: number, original: number) {
  return Math.round(((original - price) / original) * 100);
}

export default function TrendingSection() {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const { addToCart } = useCart();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const toggleWishlist = (id: number) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <section className="bg-cream font-dm py-20 lg:py-28 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-forest flex items-center justify-center">
                <InstagramIcon size={13} className="text-white" />
              </div>
              <p
                className="uppercase font-semibold text-gold"
                style={{ fontSize: "11px", letterSpacing: "0.3em" }}
              >
                As Seen on Reels
              </p>
            </div>
            <h2
              className="font-playfair text-text-primary font-bold"
              style={{ fontSize: "clamp(26px, 3vw, 40px)" }}
            >
              Trending Right Now
            </h2>
          </motion.div>

          <motion.a
            href="#"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 uppercase font-semibold text-forest hover:text-amber-700 transition-colors group"
            style={{ fontSize: "13px", letterSpacing: "0.08em" }}
          >
            View All
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </motion.a>
        </div>

        {/* Product Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7"
        >
          {PRODUCTS.map((product) => (
            <motion.div
              key={product.id}
              variants={cardVariants}
              className="group cursor-pointer"
            >
              {/* Image Container */}
              <div
                className="relative overflow-hidden mb-4"
                style={{
                  aspectRatio: "4/5",
                  background: "#F0EBE1",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                    -{discount(product.price, product.originalPrice)}%
                  </span>
                </div>

                {/* Wishlist */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  whileTap={{ scale: 0.85 }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: "rgba(253,251,247,0.9)" }}
                  aria-label={`Toggle wishlist for ${product.name}`}
                >
                  <motion.div
                    animate={
                      wishlist.includes(product.id)
                        ? { scale: [1, 1.35, 1] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.3 }}
                  >
                    <Heart
                      size={14}
                      className={
                        wishlist.includes(product.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                      }
                    />
                  </motion.div>
                </motion.button>

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
              <div>
                <p
                  className="uppercase mb-1 font-medium text-text-muted"
                  style={{ fontSize: "10px", letterSpacing: "0.15em" }}
                >
                  {product.category}
                </p>
                <h3
                  className="font-playfair text-text-primary font-semibold mb-2 leading-snug"
                  style={{ fontSize: "16px" }}
                >
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <StarRating rating={product.rating} />
                  <span className="text-text-muted" style={{ fontSize: "11px" }}>
                    ({product.reviews})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="font-playfair text-forest font-bold"
                      style={{ fontSize: "17px" }}
                    >
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    <span
                      className="text-gold line-through"
                      style={{ fontSize: "12px" }}
                    >
                      ₹{product.originalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product.id);
                    }}
                    whileTap={{ scale: 0.92 }}
                    className="px-3 py-2 uppercase font-semibold hover:bg-emerald-900 hover:text-white transition-all duration-300 flex items-center gap-1.5"
                    style={{
                      border: "1.5px solid #1A3C2E",
                      color: "#1A3C2E",
                      fontSize: "10px",
                      letterSpacing: "0.1em",
                    }}
                  >
                    <ShoppingBag size={11} />
                    Add
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
