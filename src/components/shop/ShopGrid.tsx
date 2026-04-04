"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, ChevronDown } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import Breadcrumb from "@/components/ui/Breadcrumb";

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
}

const CATEGORIES = ["All", "Sarees", "Dress Materials", "Kids Wear"];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

export default function ShopGrid({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const { addToCart } = useCart();

  const filtered = useMemo(() => {
    let result = [...products];

    // Category filter
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tag?.toLowerCase().includes(q)
      );
    }

    // Sort
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
  }, [products, search, activeCategory, sortBy]);

  return (
    <>
      <Breadcrumb items={[{ label: "Collections" }]} />

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative py-16 lg:py-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-forest/5 to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <p
            className="uppercase text-gold font-dm font-medium tracking-[0.35em] mb-4"
            style={{ fontSize: "11px" }}
          >
            Shop
          </p>
          <h1 className="font-playfair text-forest font-bold text-4xl lg:text-5xl mb-4">
            All Collections
          </h1>
          <p className="text-text-muted font-dm text-lg max-w-xl mx-auto">
            Browse our entire curated catalog of handpicked ethnic wear.
          </p>
        </div>
      </section>

      {/* ── Utility Bar ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-[11px] uppercase tracking-wider font-bold font-dm transition-all duration-300 ${
                    activeCategory === cat
                      ? "bg-forest text-white"
                      : "bg-white text-forest border border-gold/15 hover:border-gold/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gold/15 hover:border-gold/30 transition-colors font-dm text-[11px] uppercase tracking-wider text-forest"
              >
                {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    sortOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gold/15 shadow-lg z-20 min-w-[180px]">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-3 font-dm text-sm transition-colors ${
                        sortBy === opt.value
                          ? "bg-forest/5 text-forest font-semibold"
                          : "text-text-muted hover:bg-cream"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Result Count */}
        <p className="text-text-muted font-dm text-xs mt-4 tracking-wider uppercase">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
          {search.trim() ? ` matching "${search}"` : ""}
        </p>
      </section>

      {/* ── Products Grid ────────────────────────────── */}
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
            {filtered.map((product) => (
              <div key={product.id} className="group">
                {/* Image */}
                <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-[#F5F0E8]">
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

                  {/* Add to Cart overlay */}
                  <button
                    onClick={() => addToCart(product as any)}
                    className="absolute bottom-0 left-0 right-0 bg-forest/90 text-white py-3 text-[11px] uppercase tracking-wider font-bold font-dm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-forest"
                  >
                    Add to Bag
                  </button>
                </div>

                {/* Details */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-dm mb-0.5">
                    {product.category}
                  </p>
                  <h3 className="font-playfair text-forest font-semibold text-lg leading-tight mb-1 group-hover:text-gold transition-colors duration-300">
                    {product.name}
                  </h3>
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
    </>
  );
}
