"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/providers/CartProvider";
import ShopUtilityBar from "@/components/ui/ShopUtilityBar";

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

export default function CategoryGrid({
  products,
  categoryTitle,
}: {
  products: Product[];
  categoryTitle: string;
}) {
  const [search, setSearch] = useState("");
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

  const filtered = useMemo(() => {
    let result = [...products];

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
  }, [products, search, sortBy, materialFilter, colorFilter, sizeFilter]);

  return (
    <>
      {/* Utility Bar (no category pills since we're already in a category) */}
      <ShopUtilityBar
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        resultCount={filtered.length}
        resultLabel={` in ${categoryTitle}`}
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
              Try adjusting your search or sort.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {filtered.map((product) => (
              <div key={product.id} className="group flex flex-col h-full">
                <Link href={`/product/${product.id}`} className="block relative aspect-[3/4] mb-4 overflow-hidden bg-[#F5F0E8]">
                  {product.image &&
                  !product.image.includes("/api/placeholder") ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p
                        className="font-playfair text-forest/20 font-bold"
                        style={{ fontSize: "28px", letterSpacing: "0.1em" }}
                      >
                        MV
                      </p>
                      <p className="text-forest/15 font-dm text-[10px] uppercase tracking-[0.3em] mt-1">
                        Mrudula Vastra
                      </p>
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

                  {/* Sold Out overlay */}
                  {product.inventory_count === 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
                      <span className="px-4 py-1.5 bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-[0.2em] font-dm">
                        Sold Out
                      </span>
                    </div>
                  )}

                  <button
                    onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                    disabled={product.inventory_count === 0}
                    className={`absolute bottom-0 left-0 right-0 py-3 text-[11px] uppercase tracking-wider font-bold font-dm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 ${
                      product.inventory_count === 0
                        ? "hidden"
                        : "bg-forest/90 text-white hover:bg-forest"
                    }`}
                  >
                    Add to Bag
                  </button>
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
                    <span className="text-forest font-semibold">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
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
              <h3 className="font-playfair text-xl font-bold text-forest mb-1">Select Size</h3>
              <p className="text-text-muted text-sm font-dm mb-6">{quickAddProduct.name}</p>
              
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
