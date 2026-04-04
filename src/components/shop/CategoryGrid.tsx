"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
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
  const { addToCart } = useCart();

  const filtered = useMemo(() => {
    let result = [...products];

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
  }, [products, search, sortBy]);

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
              <div key={product.id} className="group">
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

                  <button
                    onClick={() => addToCart(product as any)}
                    className="absolute bottom-0 left-0 right-0 bg-forest/90 text-white py-3 text-[11px] uppercase tracking-wider font-bold font-dm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-forest"
                  >
                    Add to Bag
                  </button>
                </div>

                <div>
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
