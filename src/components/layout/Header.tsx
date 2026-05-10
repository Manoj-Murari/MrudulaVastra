"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { Search, ShoppingBag, User, Menu, X, Shield, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { NAV_LINKS, PREFERRED_CATEGORY_ORDER } from "@/data/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { checkIsAdmin } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";

function NavLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      prefetch={true}
      className="relative py-1 text-text-nav font-medium font-dm group flex items-center gap-1"
      style={{ fontSize: "12px", letterSpacing: "0.1em" }}
    >
      <span className="relative z-10 group-hover:text-forest transition-colors duration-300 uppercase">
        {label}
      </span>
      <span className="absolute left-0 right-0 bottom-0 h-[1px] bg-gold/60 origin-right scale-x-0 group-hover:scale-x-100 group-hover:origin-left transition-transform duration-500 ease-out" />
    </Link>
  );
}

function NavDropdown({ label, href, subLinks }: { label: string; href: string, subLinks: any[] }) {
  return (
    <div className="relative group py-1 flex items-center gap-1 cursor-pointer">
      <Link
        href={href}
        prefetch={true}
        className="relative text-text-nav font-medium font-dm flex items-center gap-1"
        style={{ fontSize: "12px", letterSpacing: "0.1em" }}
      >
        <span className="relative z-10 group-hover:text-forest transition-colors duration-300 uppercase">
          {label}
        </span>
        <span className="absolute left-0 right-0 -bottom-1 h-[1px] bg-gold/60 origin-right scale-x-0 group-hover:scale-x-100 group-hover:origin-left transition-transform duration-500 ease-out" />
      </Link>

      {subLinks && subLinks.length > 0 && (
        <>
          <ChevronDown size={12} className="text-text-nav group-hover:text-forest transition-transform group-hover:-rotate-180" />

          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
            <div className="bg-white border border-gold/10 shadow-xl rounded-lg py-2 min-w-[200px] flex flex-col">
              <Link
                href={href}
                className="px-5 py-2.5 text-[13px] font-dm text-forest/80 hover:text-forest hover:bg-gold/5 transition-colors whitespace-nowrap"
              >
                All {label}
              </Link>
              {subLinks.map((sub: any) => (
                <Link
                  key={sub.label}
                  href={sub.href}
                  className="px-5 py-2.5 text-[13px] font-dm text-text-muted hover:text-forest hover:bg-gold/5 transition-colors whitespace-nowrap"
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Category slugs for smart search routing
const SEARCH_CATEGORY_MAP: Record<string, string> = {
  "sarees": "sarees",
  "saree": "sarees",
  "kurtas": "kurtas",
  "kurta": "kurtas",
  "dress materials": "dress-materials",
  "dress material": "dress-materials",
  "kids wear": "kids-wear",
  "kids": "kids-wear",
  "kidswear": "kids-wear",
  "dresses": "dresses",
  "dress": "dresses",
};

function SearchBar({ onSubmitCallback }: { onSubmitCallback?: () => void }) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<{ products: any[], categories: string[] }>({ products: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sync input with URL's q param on mount and when searchParams change
  useEffect(() => {
    const q = searchParams?.get("q");
    if (q) setInputValue(q);
    else setInputValue("");
  }, [searchParams]);

  // Also listen for popstate events (triggered by ShopGrid/CategoryGrid clearing search)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) setInputValue(q);
      else setInputValue("");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Effect 1: Sync URL with search input (debounced)
  useEffect(() => {
    const isMainCollectionsPage = window.location.pathname === "/collections";
    if (!isMainCollectionsPage) return;

    const trimmed = inputValue.trim();
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const currentQ = params.get("q") || "";
      
      // Only update if the value actually changed to avoid unnecessary history entries/flicker
      if (currentQ !== trimmed) {
        if (trimmed) {
          params.set("q", trimmed);
        } else {
          params.delete("q");
        }
        const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Effect 2: Fetch instant results for dropdown (debounced)
  useEffect(() => {
    const trimmed = inputValue.trim();
        // Fetch instant results for dropdown
    if (trimmed.length > 1) {
      setLoading(true);
      const timer = setTimeout(async () => {
        try {
          const supabase = createClient();
          
          // Search products across name, category, and sub_category using DB-side filtering
          const { data: matchedProducts } = await supabase
            .from("products")
            .select("id, name, price, images, category, sub_category, material, tag")
            .or(`name.ilike."%${trimmed}%",category.ilike."%${trimmed}%",sub_category.ilike."%${trimmed}%",material.ilike."%${trimmed}%",tag.ilike."%${trimmed}%"`)
            .limit(10); // Show up to 10 in dropdown

          if (matchedProducts && (matchedProducts as any[]).length > 0) {
            // Extract unique categories from the matched products for suggestions
            const uniqueCats = Array.from(new Set((matchedProducts as any[]).map(p => p.category).filter(Boolean)));
            
            setResults({
              products: (matchedProducts as any[]).slice(0, 5),
              categories: uniqueCats.slice(0, 3) as string[]
            });
          } else {
            setResults({ products: [], categories: [] });
          }
        } catch (error) {
          console.error("Search fetch error:", error);
        } finally {
          setLoading(false);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setResults({ products: [], categories: [] });
      setLoading(false);
    }
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Smart category routing
    const categorySlug = SEARCH_CATEGORY_MAP[trimmed.toLowerCase()];
    if (categorySlug) {
      setInputValue("");
      setIsFocused(false);
      router.push(`/collections/${categorySlug}`);
      onSubmitCallback?.();
      return;
    }

    setIsFocused(false);
    router.push(`/collections?q=${encodeURIComponent(trimmed)}`);
    onSubmitCallback?.();
  };

  const handleClear = () => {
    setInputValue("");
    setResults({ products: [], categories: [] });
    const isCollectionsPage = window.location.pathname === "/collections" || window.location.pathname.startsWith("/collections/");
    if (isCollectionsPage) {
      const params = new URLSearchParams(window.location.search);
      params.delete("q");
      const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="relative w-full flex justify-center lg:justify-start" ref={dropdownRef}>
      <form
        onSubmit={handleSubmit}
        className={`relative group flex items-center transition-all duration-500 ease-in-out ${isFocused ? "w-full max-w-[420px]" : "w-full max-w-[280px]"
          }`}
      >
        <button
          type="submit"
          className={`absolute left-4 transition-colors duration-300 z-10 ${isFocused ? "text-gold" : "text-forest/30"
            }`}
        >
          <Search size={15} strokeWidth={1.5} />
        </button>
        <input
          type="text"
          value={inputValue}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search our collections..."
          className="w-full py-2.5 pl-11 pr-10 bg-white/40 border border-gold/10 rounded-full font-dm text-[12px] tracking-wide text-forest placeholder:text-text-muted/40 focus:outline-none focus:border-gold/30 focus:bg-white shadow-[0_2px_10px_rgba(184,150,62,0.02)] focus:shadow-[0_4px_20px_rgba(184,150,62,0.08)] transition-all duration-500"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 text-text-muted/40 hover:text-forest transition-colors p-1"
          >
            <X size={14} />
          </button>
        )}
      </form>

      {/* Results Dropdown */}
      {isFocused && (inputValue.trim().length > 1) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gold/10 shadow-2xl rounded-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300 max-h-[80vh] flex flex-col">
          <div className="overflow-y-auto p-4 space-y-6">
            {/* Categories Section */}
            {results.categories.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-bold text-gold tracking-widest mb-3 px-2">Suggested Categories</p>
                <div className="flex flex-wrap gap-2 px-2">
                  {results.categories.map(cat => (
                    <Link
                      key={cat}
                      href={`/collections/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setIsFocused(false)}
                      className="px-3 py-1.5 bg-sand/30 hover:bg-gold/10 rounded-full text-[12px] font-dm text-forest transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products Section */}
            <div>
              <p className="text-[10px] uppercase font-bold text-gold tracking-widest mb-3 px-2">Products</p>
              {loading ? (
                <div className="flex flex-col gap-3 px-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-12 h-12 bg-sand rounded-lg" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-sand rounded w-3/4" />
                        <div className="h-3 bg-sand rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.products.length > 0 ? (
                <div className="space-y-1">
                  {results.products.map(product => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      onClick={() => setIsFocused(false)}
                      className="flex items-center gap-3 p-2 hover:bg-gold/5 rounded-xl transition-colors group"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-sand">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-forest truncate">{product.name}</p>
                        <p className="text-[11px] text-text-muted/60 font-dm">₹{product.price.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-text-muted/60 px-2 italic">No products found matching "{inputValue}"</p>
              )}
            </div>
          </div>

          <div className="p-3 border-t border-gold/5 bg-sand/10">
            <button
              onClick={handleSubmit}
              className="w-full py-2 bg-forest text-cream text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-forest/90 transition-all active:scale-[0.98]"
            >
              View All Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Header ──────────────────────────────────────────── */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedNav, setExpandedNav] = useState<string | null>(null);
  const [dynamicNavLinks, setDynamicNavLinks] = useState<any[]>([...NAV_LINKS]);
  const { cartCount, toggleCart } = useCart();
  const ticking = useRef(false);

  useEffect(() => {
    const fetchSubCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('products').select('category, sub_category');

      if (data && data.length > 0) {
        const dbMap: Record<string, Set<string>> = {};
        (data as any[]).forEach(p => {
          if (p.category) {
            const catKey = p.category;
            if (!dbMap[catKey]) dbMap[catKey] = new Set();
            if (p.sub_category) {
              dbMap[catKey].add(p.sub_category);
            }
          }
        });

        // We want: Home, Collections, [DYNAMIC CATEGORIES], About, Contact
        const dynamicCategories = Object.keys(dbMap).sort((a, b) => {
          const indexA = PREFERRED_CATEGORY_ORDER.indexOf(a);
          const indexB = PREFERRED_CATEGORY_ORDER.indexOf(b);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.localeCompare(b);
        }).map(cat => {
          const dbSet = dbMap[cat];
          const slug = cat.toLowerCase().replace(/\s+/g, '-');
          const subLinks = Array.from(dbSet).sort().map(sc => ({
            label: sc,
            href: `/collections/${slug}?type=${encodeURIComponent(sc.toLowerCase())}`
          }));
          return {
            label: cat,
            href: `/collections/${slug}`,
            subLinks
          };
        });

        // NAV_LINKS has 4 items now: [Home, Collections, About, Contact]
        const updatedLinks = [
          NAV_LINKS[0], // Home
          NAV_LINKS[1], // Collections
          ...dynamicCategories,
          NAV_LINKS[2], // About
          NAV_LINKS[3]  // Contact
        ];

        setDynamicNavLinks(updatedLinks);
      }
    };
    fetchSubCategories();
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      const admin = await checkIsAdmin();
      setIsAdmin(admin);
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(253,251,247,0.97)" : "#FDFBF7",
        boxShadow: scrolled ? "0 1px 16px rgba(26,60,46,0.05)" : "none",
        borderBottom: scrolled ? "1px solid rgba(184,150,62,0.12)" : "1px solid rgba(184,150,62,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-10">
        <div
          className="flex flex-col gap-3 md:gap-0 transition-all duration-300 relative"
          style={{ paddingTop: scrolled ? "12px" : "18px", paddingBottom: scrolled ? "8px" : "12px" }}
        >
          {/* Main Row */}
          <div className="flex items-center justify-between w-full">
            {/* Left: Search Bar + Hamburger */}
            <div className="flex items-center gap-2 lg:gap-4 flex-1">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden text-text-nav hover:text-forest transition-colors p-1"
                aria-label="Menu"
              >
                {menuOpen ? <X size={22} strokeWidth={1.3} /> : <Menu size={22} strokeWidth={1.3} />}
              </button>

              <div className="hidden lg:block w-full">
                <Suspense fallback={<div className="h-10 w-full bg-white/10 rounded-full animate-pulse" />}>
                  <SearchBar />
                </Suspense>
              </div>
            </div>

            {/* Center: Brand Logo */}
            <Link href="/" prefetch={true} className="text-center flex-shrink-0 px-2 sm:px-4">
              <p
                className="font-playfair text-forest font-bold transition-all duration-300 whitespace-nowrap"
                style={{
                  fontSize: scrolled ? "clamp(16px, 2.5vw, 24px)" : "clamp(18px, 3vw, 30px)",
                  letterSpacing: "0.08em",
                  lineHeight: 1.1,
                }}
              >
                MRUDULA VASTRA
              </p>
              <p
                className="uppercase text-gold font-dm font-medium overflow-hidden transition-all duration-300"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.25em",
                  height: scrolled ? 0 : "auto",
                  opacity: scrolled ? 0 : 1,
                  marginTop: scrolled ? 0 : 4,
                }}
              >
                Elegance Woven in Every Thread
              </p>
            </Link>

            {/* Right: User + Cart Icons */}
            <div className="flex items-center gap-3 lg:gap-5 flex-1 justify-end">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden md:flex items-center gap-1.5 text-forest font-semibold transition-colors p-1"
                  style={{ fontSize: "11px", letterSpacing: "0.05em" }}
                >
                  <Shield size={16} strokeWidth={1.5} className="text-gold" />
                  ADMIN
                </Link>
              )}
              <Link
                href="/profile"
                className="hidden sm:block text-text-nav hover:text-forest transition-colors p-1"
                aria-label="My Account"
              >
                <User size={19} strokeWidth={1.3} />
              </Link>
              <button
                onClick={() => toggleCart()}
                className="text-text-nav hover:text-forest transition-colors p-1 relative"
                aria-label="Shopping bag"
              >
                <ShoppingBag size={19} strokeWidth={1.3} />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 bg-forest text-white rounded-full flex items-center justify-center font-bold font-dm"
                    style={{ width: "17px", height: "17px", fontSize: "9px" }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile + Tablet Search Bar (visible below lg, where desktop search takes over) */}
          <div className="block lg:hidden w-full mt-1">
            <Suspense fallback={<div className="h-10 w-full bg-white/10 rounded-full animate-pulse" />}>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Row */}
      <nav
        className="hidden lg:block overflow-visible transition-all duration-300"
        style={{
          height: scrolled ? 36 : 42,
          borderTop: "1px solid rgba(184,150,62,0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-center gap-10 h-full">
          {dynamicNavLinks.filter(link => link.href !== "/").map((link) => (
            'subLinks' in link && link.subLinks.length > 0 ? (
              <NavDropdown key={link.href} label={link.label} href={link.href} subLinks={link.subLinks} />
            ) : (
              <NavLink key={link.href} label={link.label} href={link.href} />
            )
          ))}
        </div>
      </nav>

      {/* Mobile Menu — Full-screen overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 top-0 lg:hidden z-[60] animate-fade-in flex flex-col"
          style={{ background: "rgba(253,251,247,0.99)" }}
        >
          {/* Menu Header — mirrors the real header */}
          <div className="px-4 flex items-center justify-between" style={{ paddingTop: "18px", paddingBottom: "12px" }}>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-text-nav hover:text-forest transition-colors p-1"
              aria-label="Close menu"
            >
              <X size={22} strokeWidth={1.3} />
            </button>
            <Link href="/" onClick={() => setMenuOpen(false)} className="text-center flex-shrink-0">
              <p
                className="font-playfair text-forest font-bold whitespace-nowrap"
                style={{ fontSize: "clamp(18px, 3vw, 30px)", letterSpacing: "0.08em", lineHeight: 1.1 }}
              >
                MRUDULA VASTRA
              </p>
              <p
                className="uppercase text-gold font-dm font-medium"
                style={{ fontSize: "10px", letterSpacing: "0.25em", marginTop: 4 }}
              >
                Elegance Woven in Every Thread
              </p>
            </Link>
            <button
              onClick={() => toggleCart()}
              className="text-text-nav hover:text-forest transition-colors p-1 relative"
              aria-label="Shopping bag"
            >
              <ShoppingBag size={19} strokeWidth={1.3} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 bg-forest text-white rounded-full flex items-center justify-center font-bold font-dm"
                  style={{ width: "17px", height: "17px", fontSize: "9px" }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="px-6 py-3">
            <Suspense fallback={<div className="h-10 w-full bg-white/10 rounded-full animate-pulse" />}>
              <SearchBar onSubmitCallback={() => setMenuOpen(false)} />
            </Suspense>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-8 pt-4 overflow-y-auto">
            {dynamicNavLinks.map((link) => {
              const hasSubLinks = 'subLinks' in link && link.subLinks && link.subLinks.length > 0;
              
              if (hasSubLinks) {
                const isExpanded = expandedNav === link.label;
                return (
                  <div key={link.label} className="border-b border-gold/10">
                    <button
                      onClick={() => setExpandedNav(isExpanded ? null : link.label)}
                      className="w-full flex items-center justify-between py-4 text-forest font-medium font-dm text-[15px]"
                    >
                      {link.label}
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="flex flex-col pb-4 pl-4 space-y-4 animate-fade-in">
                        <Link
                          href={link.href}
                          onClick={() => { setMenuOpen(false); setExpandedNav(null); }}
                          className="text-forest/80 text-[14px] font-dm hover:text-forest transition-colors"
                        >
                          All {link.label}
                        </Link>
                        {link.subLinks.map((subLink: any) => (
                          <Link
                            key={subLink.label}
                            href={subLink.href}
                            onClick={() => { setMenuOpen(false); setExpandedNav(null); }}
                            className="text-text-muted text-[14px] font-dm hover:text-forest transition-colors"
                          >
                            {subLink.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => { setMenuOpen(false); setExpandedNav(null); }}
                  className="block py-4 text-forest font-medium font-dm text-[15px] border-b border-gold/10"
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 py-4 text-forest font-medium font-dm text-[15px] border-b border-gold/10"
            >
              <User size={16} strokeWidth={1.3} />
              My Account
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-4 text-gold font-bold font-dm text-[15px] border-b border-gold/10"
              >
                <Shield size={16} strokeWidth={1.5} />
                Admin Dashboard
              </Link>
            )}
          </nav>

          {/* Bottom Branding */}
          <div className="px-8 py-6 text-center border-t border-gold/10">
            <p className="text-text-muted/40 font-dm text-[11px] tracking-wider uppercase">
              Handpicked Ethnic Elegance
            </p>
          </div>
        </div>
      )}
    </header>
  );
}