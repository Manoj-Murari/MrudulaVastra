"use client";

import { useState, useEffect } from "react";
import { ChevronDown, SlidersHorizontal, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const MATERIAL_OPTS = ["All", "Silk", "Cotton", "Linen", "Chiffon", "Georgette", "Crepe"];
  const COLOR_OPTS = [
    "All", "Red", "Blue", "Green", "Yellow", "Black", "White", "Pink", "Gold", "Silver", 
    "Maroon", "Teal", "Mustard", "Peach", "Lavender", "Emerald Green", "Olive", "Magenta", 
    "Cream", "Beige", "Turquoise", "Rust", "Coral", "Indigo", "Mint", "Wine", "Copper", "Coffee"
  ];
  const SIZE_OPTS = ["All", "Unstitched", "S", "M", "L", "XL"];

  const hasActiveFilters = 
    materialFilter !== "All" || 
    colorFilter !== "All" || 
    sizeFilter !== "All" || 
    sortBy !== "newest";

  useEffect(() => {
    if (activeCategory) {
      const el = document.getElementById(`cat-${activeCategory.toLowerCase().replace(/\s+/g, '-')}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeCategory]);

  return (
    <>
      <section className="max-w-7xl mx-auto px-6 md:px-10 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-y border-gold/20">
          
          {/* Categories - Editorial Navigation Style */}
          {categories && onCategoryChange && (
            <div className="flex items-center overflow-x-auto no-scrollbar -mx-6 px-6 md:mx-0 md:px-0 gap-8 md:gap-10 scroll-smooth">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    id={`cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => onCategoryChange(cat)}
                    className={`group relative whitespace-nowrap flex-shrink-0 py-1 text-[11px] uppercase tracking-[0.2em] font-black transition-all duration-500 ${
                      isActive
                        ? "text-forest"
                        : "text-text-muted hover:text-forest"
                    }`}
                  >
                    {cat}
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-gold transition-all duration-500 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Mobile Filter Button */}
          <div className="flex items-center justify-between w-full md:hidden pt-4 border-t border-gold/10 gap-3">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-3 px-6 py-3 bg-forest text-cream font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-forest/10 whitespace-nowrap"
            >
              <SlidersHorizontal size={14} />
              Refine
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              )}
            </button>
            <p className="text-forest font-bold text-[10px] uppercase tracking-widest opacity-40 whitespace-nowrap">
              {resultCount} Items
            </p>
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex flex-wrap items-center gap-8">
            {onMaterialChange && (
              <div className="relative">
                <button
                  onClick={() => {
                    setMaterialOpen(!materialOpen);
                    setColorOpen(false);
                    setSizeOpen(false);
                    setSortOpen(false);
                  }}
                  className="flex items-center gap-2 px-1 py-2 bg-transparent hover:text-gold transition-all duration-500 font-black text-[10px] uppercase tracking-[0.2em] text-forest group"
                >
                  <span className="opacity-40 group-hover:opacity-100 transition-opacity">Material:</span>
                  <span>{materialFilter !== "All" ? materialFilter : "All"}</span>
                  <ChevronDown size={10} className={`transition-transform duration-500 ${materialOpen ? "rotate-180" : ""}`} />
                </button>
                {materialOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gold/10 shadow-2xl z-20 min-w-[180px] py-2 animate-fade-in">
                    {MATERIAL_OPTS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { onMaterialChange(opt); setMaterialOpen(false); }}
                        className={`block w-full text-left px-6 py-3 font-dm text-[12px] uppercase tracking-widest transition-colors ${
                          materialFilter === opt ? "bg-forest/5 text-forest font-bold" : "text-text-muted hover:bg-cream"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {onColorChange && (
              <div className="relative">
                <button
                  onClick={() => {
                    setColorOpen(!colorOpen);
                    setMaterialOpen(false);
                    setSizeOpen(false);
                    setSortOpen(false);
                  }}
                  className="flex items-center gap-2 px-1 py-2 bg-transparent hover:text-gold transition-all duration-500 font-black text-[10px] uppercase tracking-[0.2em] text-forest group"
                >
                  <span className="opacity-40 group-hover:opacity-100 transition-opacity">Color:</span>
                  <span>{colorFilter !== "All" ? colorFilter : "All"}</span>
                  <ChevronDown size={10} className={`transition-transform duration-500 ${colorOpen ? "rotate-180" : ""}`} />
                </button>
                {colorOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gold/10 shadow-2xl z-20 min-w-[180px] py-2 animate-fade-in max-h-80 overflow-y-auto no-scrollbar">
                    {COLOR_OPTS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { onColorChange(opt); setColorOpen(false); }}
                        className={`block w-full text-left px-6 py-3 font-dm text-[12px] uppercase tracking-widest transition-colors ${
                          colorFilter === opt ? "bg-forest/5 text-forest font-bold" : "text-text-muted hover:bg-cream"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {onSizeChange && (
              <div className="relative">
                <button
                  onClick={() => {
                    setSizeOpen(!sizeOpen);
                    setMaterialOpen(false);
                    setColorOpen(false);
                    setSortOpen(false);
                  }}
                  className="flex items-center gap-2 px-1 py-2 bg-transparent hover:text-gold transition-all duration-500 font-black text-[10px] uppercase tracking-[0.2em] text-forest group"
                >
                  <span className="opacity-40 group-hover:opacity-100 transition-opacity">Size:</span>
                  <span>{sizeFilter !== "All" ? sizeFilter : "All"}</span>
                  <ChevronDown size={10} className={`transition-transform duration-500 ${sizeOpen ? "rotate-180" : ""}`} />
                </button>
                {sizeOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gold/10 shadow-2xl z-20 min-w-[180px] py-2 animate-fade-in">
                    {SIZE_OPTS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { onSizeChange(opt); setSizeOpen(false); }}
                        className={`block w-full text-left px-6 py-3 font-dm text-[12px] uppercase tracking-widest transition-colors ${
                          sizeFilter === opt ? "bg-forest/5 text-forest font-bold" : "text-text-muted hover:bg-cream"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => {
                  setSortOpen(!sortOpen);
                  setMaterialOpen(false);
                  setColorOpen(false);
                  setSizeOpen(false);
                }}
                className="flex items-center gap-2 px-1 py-2 bg-transparent hover:text-gold transition-all duration-500 font-black text-[10px] uppercase tracking-[0.2em] text-forest group"
              >
                <span className="opacity-40 group-hover:opacity-100 transition-opacity">Sort:</span>
                <span>{SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
                <ChevronDown size={10} className={`transition-transform duration-500 ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gold/10 shadow-2xl z-20 min-w-[200px] py-2 animate-fade-in">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { onSortChange(opt.value); setSortOpen(false); }}
                      className={`block w-full text-left px-6 py-3 font-dm text-[12px] uppercase tracking-widest transition-colors ${
                        sortBy === opt.value ? "bg-forest/5 text-forest font-bold" : "text-text-muted hover:bg-cream"
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

        <p className="hidden md:block text-text-muted font-dm text-xs mt-4 tracking-wider uppercase text-center">
          {resultCount} product{resultCount !== 1 ? "s" : ""}
          {resultLabel || ""}
          {search.trim() ? " matching \"" + search + "\"" : ""}
        </p>
      </section>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-[120] flex items-end justify-center md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative w-full max-h-[85vh] bg-cream shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-[32px] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 pb-4 bg-white/60 backdrop-blur-md sticky top-0 z-10 border-b border-gold/10">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-gold/20" />
                <h3 className="font-playfair text-2xl mt-2 text-forest tracking-wide">Filter & Sort</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 -mr-2 mt-2 text-text-muted hover:text-forest transition-colors bg-white rounded-full shadow-sm border border-gold/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                {/* Sort */}
                <div className="space-y-4">
                  <h4 className="font-dm text-[11px] uppercase tracking-widest text-text-muted font-bold">Sort By</h4>
                  <div className="flex flex-col gap-2.5">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { onSortChange(opt.value); setMobileFiltersOpen(false); }}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                          sortBy === opt.value ? "border-forest bg-forest/5 text-forest shadow-sm" : "border-gold/15 text-text-body bg-white hover:border-gold/40"
                        }`}
                      >
                        <span className="font-dm text-sm">{opt.label}</span>
                        {sortBy === opt.value && <Check size={18} className="text-forest" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Material */}
                {onMaterialChange && (
                  <div className="space-y-4">
                    <h4 className="font-dm text-[11px] uppercase tracking-widest text-text-muted font-bold">Material</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {MATERIAL_OPTS.map(opt => (
                        <button
                          key={opt}
                          onClick={() => onMaterialChange(opt)}
                          className={`px-5 py-2.5 rounded-full font-dm text-xs uppercase tracking-wider transition-all duration-300 ${
                            materialFilter === opt ? "border-forest bg-forest text-white shadow-md" : "border-gold/20 bg-white text-forest border hover:border-gold/60"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color */}
                {onColorChange && (
                  <div className="space-y-4">
                    <h4 className="font-dm text-[11px] uppercase tracking-widest text-text-muted font-bold">Color</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {COLOR_OPTS.map(opt => (
                        <button
                          key={opt}
                          onClick={() => onColorChange(opt)}
                          className={`px-5 py-2.5 rounded-full font-dm text-xs uppercase tracking-wider transition-all duration-300 ${
                            colorFilter === opt ? "border-forest bg-forest text-white shadow-md" : "border-gold/20 bg-white text-forest border hover:border-gold/60"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size */}
                {onSizeChange && (
                  <div className="space-y-4">
                    <h4 className="font-dm text-[11px] uppercase tracking-widest text-text-muted font-bold">Size</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {SIZE_OPTS.map(opt => (
                        <button
                          key={opt}
                          onClick={() => onSizeChange(opt)}
                          className={`px-5 py-2.5 rounded-full font-dm text-xs uppercase tracking-wider transition-all duration-300 ${
                            sizeFilter === opt ? "border-forest bg-forest text-white shadow-md" : "border-gold/20 bg-white text-forest border hover:border-gold/60"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-5 bg-white border-t border-gold/10 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-6">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-4 rounded-full bg-forest text-white font-dm text-xs uppercase tracking-widest hover:bg-forest-deep transition-all duration-300 shadow-md"
                >
                  Show {resultCount} Results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

