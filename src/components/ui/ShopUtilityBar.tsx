"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

interface ShopUtilityBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  sortBy: string;
  onSortChange: (val: string) => void;
  resultCount: number;
  resultLabel?: string;
  /** Pass category pills config; omit to hide the pills */
  categories?: string[];
  activeCategory?: string;
  onCategoryChange?: (cat: string) => void;
  materialFilter?: string;
  onMaterialChange?: (val: string) => void;
  colorFilter?: string;
  onColorChange?: (val: string) => void;
  sizeFilter?: string;
  onSizeChange?: (val: string) => void;
}

export default function ShopUtilityBar({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  resultCount,
  resultLabel,
  categories,
  activeCategory,
  onCategoryChange,
  materialFilter = "All",
  onMaterialChange,
  colorFilter = "All",
  onColorChange,
  sizeFilter = "All",
  onSizeChange,
}: ShopUtilityBarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const [materialOpen, setMaterialOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);

  // Example options
  const MATERIAL_OPTS = ["All", "Silk", "Cotton", "Linen", "Chiffon"];
  const COLOR_OPTS = ["All", "Red", "Blue", "Green", "Yellow", "Black", "White", "Pink"];
  const SIZE_OPTS = ["All", "Unstitched", "S", "M", "L", "XL"];

  return (
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
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Category Pills (optional) */}
          {categories && onCategoryChange && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
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
          )}

          {/* Material Dropdown */}
          {onMaterialChange && (
            <div className="relative">
              <button
                onClick={() => {
                  setMaterialOpen(!materialOpen);
                  setColorOpen(false); setSizeOpen(false); setSortOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gold/15 hover:border-gold/30 transition-colors font-dm text-[11px] uppercase tracking-wider text-forest"
              >
                Material: {materialFilter !== "All" ? materialFilter : "All"}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    materialOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {materialOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gold/15 shadow-lg z-20 min-w-[150px]">
                  {MATERIAL_OPTS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        onMaterialChange(opt);
                        setMaterialOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-3 font-dm text-sm transition-colors ${
                        materialFilter === opt
                          ? "bg-forest/5 text-forest font-semibold"
                          : "text-text-muted hover:bg-cream"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Color Dropdown */}
          {onColorChange && (
            <div className="relative">
              <button
                onClick={() => {
                  setColorOpen(!colorOpen);
                  setMaterialOpen(false); setSizeOpen(false); setSortOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gold/15 hover:border-gold/30 transition-colors font-dm text-[11px] uppercase tracking-wider text-forest"
              >
                Color: {colorFilter !== "All" ? colorFilter : "All"}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    colorOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {colorOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gold/15 shadow-lg z-20 min-w-[150px]">
                  {COLOR_OPTS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        onColorChange(opt);
                        setColorOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-3 font-dm text-sm transition-colors ${
                        colorFilter === opt
                          ? "bg-forest/5 text-forest font-semibold"
                          : "text-text-muted hover:bg-cream"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Size Dropdown */}
          {onSizeChange && (
            <div className="relative">
              <button
                onClick={() => {
                  setSizeOpen(!sizeOpen);
                  setMaterialOpen(false); setColorOpen(false); setSortOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gold/15 hover:border-gold/30 transition-colors font-dm text-[11px] uppercase tracking-wider text-forest"
              >
                Size: {sizeFilter !== "All" ? sizeFilter : "All"}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    sizeOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {sizeOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gold/15 shadow-lg z-20 min-w-[150px]">
                  {SIZE_OPTS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        onSizeChange(opt);
                        setSizeOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-3 font-dm text-sm transition-colors ${
                        sizeFilter === opt
                          ? "bg-forest/5 text-forest font-semibold"
                          : "text-text-muted hover:bg-cream"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setSortOpen(!sortOpen);
                setMaterialOpen(false); setColorOpen(false); setSizeOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gold/15 hover:border-gold/30 transition-colors font-dm text-[11px] uppercase tracking-wider text-forest"
            >
              Sort: {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
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
                      onSortChange(opt.value);
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
        {resultCount} product{resultCount !== 1 ? "s" : ""}
        {resultLabel || ""}
        {search.trim() ? ` matching "${search}"` : ""}
      </p>
    </section>
  );
}
