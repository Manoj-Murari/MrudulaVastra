"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/providers/CartProvider";
import ShopUtilityBar from "@/components/ui/ShopUtilityBar";
import ProductCard from "@/components/ui/ProductCard";
import type { Database } from "@/lib/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

const CATEGORIES = ["All", "Sarees", "Kurtas", "Dress Materials", "Kids Wear"];

export default function ShopGrid({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams?.get("q") || "");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [materialFilter, setMaterialFilter] = useState("All");
  const [colorFilter, setColorFilter] = useState("All");
  const [sizeFilter, setSizeFilter] = useState("All");
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    if (product.inventory_count === 0) return;
    if (product.sizes && product.sizes.length > 1) {
      setQuickAddProduct(product);
    } else {
      addToCart(product, product.sizes?.[0]);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const q = searchParams?.get("q");
    if (q !== null && q !== undefined) setSearch(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (materialFilter && materialFilter !== "All") {
      result = result.filter((p) => p.material === materialFilter);
    }

    if (colorFilter && colorFilter !== "All") {
      result = result.filter((p) => p.color === colorFilter);
    }

    if (sizeFilter && sizeFilter !== "All") {
      result = result.filter((p) => p.sizes?.includes(sizeFilter));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tag?.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        result.sort((a, b) => b.id - a.id);
        break;
    }

    return result;
  }, [products, search, activeCategory, sortBy, materialFilter, colorFilter, sizeFilter]);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-12 pb-10 lg:pt-16 lg:pb-12 text-center">
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <p
            className="hidden sm:block uppercase text-gold font-dm font-medium tracking-[0.35em] mb-3"
            style={{ fontSize: "10px" }}
          >
            Shop
          </p>
          <h1 className="font-playfair text-forest font-light text-3xl mb-3 tracking-wide">
            {activeCategory === "All" ? "All Collections" : activeCategory}
          </h1>
          <p className="hidden sm:block text-text-muted font-dm text-sm max-w-lg mx-auto">
            Browse our curated catalog of handpicked ethnic wear.
          </p>
        </div>
      </section>

      {/* Utility Bar */}
      <ShopUtilityBar
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        resultCount={filtered.length}
        resultLabel={activeCategory !== "All" ? ` in ${activeCategory}` : ""}
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        materialFilter={materialFilter}
        onMaterialChange={setMaterialFilter}
        colorFilter={colorFilter}
        onColorChange={setColorFilter}
        sizeFilter={sizeFilter}
        onSizeChange={setSizeFilter}
      />

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted font-dm text-lg mb-2">
              No products found.
            </p>
            <p className="text-text-muted/60 font-dm text-sm">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {filtered.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                priority={idx < 4}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick Add Modal — Bottom sheet on mobile, centered modal on desktop */}
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
              {/* Drag Handle (mobile only) */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-text-muted/20 sm:hidden" />
              <button
                onClick={() => setQuickAddProduct(null)}
                className="absolute top-4 right-4 text-text-muted hover:text-forest p-1 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
              <h3 className="font-playfair text-xl font-medium text-forest mb-1">Select Size</h3>
              <p className="text-text-muted text-lg font-cormorant font-medium mb-6">{quickAddProduct.name}</p>

              <div className="flex flex-wrap gap-3 pb-2">
                {quickAddProduct.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      addToCart(quickAddProduct, size);
                      setQuickAddProduct(null);
                    }}
                    className="px-5 py-3 border border-gold/30 hover:border-forest text-forest font-dm text-sm tracking-wider uppercase transition-colors hover:bg-forest/5 min-w-[72px] text-center"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
