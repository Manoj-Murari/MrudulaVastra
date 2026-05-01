"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import ShopUtilityBar from "@/components/ui/ShopUtilityBar";
import ProductCard from "@/components/ui/ProductCard";
import type { Database } from "@/lib/supabase/types";
import { PREFERRED_CATEGORY_ORDER } from "@/data/navigation";

type Product = Database["public"]["Tables"]["products"]["Row"];

import { createClient } from "@/lib/supabase/client";

export default function CategoryGrid({
  products,
  categoryTitle,
  initialCategories = ["All"],
}: {
  products: Product[];
  categoryTitle: string;
  initialCategories?: string[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [materialFilter, setMaterialFilter] = useState("All");
  const [colorFilter, setColorFilter] = useState("All");
  const [sizeFilter, setSizeFilter] = useState("All");
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);
  const [visibleCount, setVisibleCount] = useState(8);
  
  // Sort initial categories
  const initialSorted = useMemo(() => {
    const cats = initialCategories.filter(c => c !== "All");
    const sorted = cats.sort((a, b) => {
      const indexA = PREFERRED_CATEGORY_ORDER.indexOf(a);
      const indexB = PREFERRED_CATEGORY_ORDER.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
    return ["All", ...sorted];
  }, [initialCategories]);

  const [dynamicCategories, setDynamicCategories] = useState<string[]>(initialSorted);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCats = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('products').select('category');
      if (data) {
        const cats = Array.from(new Set((data as any[]).map(p => p.category).filter(Boolean)));
        const sortedCats = cats.sort((a, b) => {
            const indexA = PREFERRED_CATEGORY_ORDER.indexOf(a);
            const indexB = PREFERRED_CATEGORY_ORDER.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });
        setDynamicCategories(["All", ...sortedCats]);
      }
    };
    if (initialCategories.length <= 1) {
      fetchCats();
    }
  }, [initialCategories]);

  const handleAddToCart = (product: Product) => {
    if (product.inventory_count === 0) return;
    if (product.sizes && product.sizes.length > 1) {
      setQuickAddProduct(product);
    } else {
      addToCart(product, product.sizes?.[0]);
    }
  };

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("q", val);
    } else {
      params.delete("q");
    }
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, [searchParams]);

  // Read direct values from searchParams for reactivity
  const subCategory = searchParams?.get("type");
  const searchFromUrl = searchParams?.get("q") || "";

  const filtered = useMemo(() => {
    let result = [...products];

    // Subcategory filter (from header)
    if (subCategory) {
      result = result.filter((p) => p.sub_category?.toLowerCase() === subCategory.toLowerCase());
    }

    // Facet filters
    if (materialFilter && materialFilter !== "All") {
      result = result.filter((p) => p.material === materialFilter);
    }

    if (colorFilter && colorFilter !== "All") {
      result = result.filter((p) => p.color === colorFilter);
    }

    if (sizeFilter && sizeFilter !== "All") {
      result = result.filter((p) => p.sizes?.includes(sizeFilter));
    }

    // Search filter
    const currentSearch = search || searchFromUrl;
    if (currentSearch.trim()) {
      const q = currentSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tag?.toLowerCase().includes(q) ||
          p.material?.toLowerCase().includes(q) ||
          p.color?.toLowerCase().includes(q) ||
          p.badge?.toLowerCase().includes(q)
      );
    }

    // Sorting
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
  }, [products, search, searchFromUrl, subCategory, sortBy, materialFilter, colorFilter, sizeFilter]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(8);
  }, [search, searchFromUrl, subCategory, sortBy, materialFilter, colorFilter, sizeFilter]);

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <>
      {/* Utility Bar (no category pills since we're already in a category) */}
      <ShopUtilityBar
        search={search || searchFromUrl}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortChange={setSortBy}
        resultCount={filtered.length}
        resultLabel={` in ${categoryTitle}`}
        categories={undefined}
        activeCategory={categoryTitle}
        onCategoryChange={(cat) => {
          if (cat === "All") router.push("/collections");
          else router.push(`/collections/${cat.toLowerCase().replace(/\s+/g, '-')}`);
        }}
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
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-sand flex items-center justify-center">
              <Search size={24} className="text-gold/50" />
            </div>
            <p className="font-playfair text-forest text-xl mb-2">
              Nothing here yet
            </p>
            <p className="text-text-muted/60 font-dm text-sm max-w-xs mx-auto mb-6">
              We couldn't find what you're looking for. Try a different search or explore our full collection.
            </p>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 px-8 py-3 uppercase font-bold font-dm text-[10px] tracking-[0.2em] bg-forest text-cream hover:bg-forest/90 transition-all active:scale-[0.97]"
            >
              Browse All
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {/* View More Button */}
        {hasMore && (
          <div className="text-center mt-10 sm:mt-14">
            <button
              onClick={() => setVisibleCount((prev) => prev + 8)}
              className="group inline-flex items-center gap-2 px-10 py-3.5 uppercase font-bold font-dm text-forest border border-forest/20 hover:bg-forest hover:text-cream transition-all duration-500 active:scale-[0.97]"
              style={{ fontSize: "11px", letterSpacing: "0.15em" }}
            >
              View More
              <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
            </button>
            <p className="text-text-muted/70 font-dm text-[11px] mt-3 tracking-wider">
              Showing {visibleProducts.length} of {filtered.length} products
            </p>
            <div className="mx-auto mt-2 w-32 h-0.5 bg-gold/10 rounded-full overflow-hidden">
              <div className="h-full bg-gold/50 rounded-full transition-all duration-500" style={{ width: `${(visibleProducts.length / filtered.length) * 100}%` }} />
            </div>
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
