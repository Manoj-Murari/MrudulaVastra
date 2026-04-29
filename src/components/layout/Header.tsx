"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ShoppingBag, User, Menu, X, Shield, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NAV_LINKS } from "@/data/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { checkIsAdmin } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";

/* ── Simple underline link — pure CSS ────────────────── */
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

function SearchBar({ onSubmitCallback }: { onSubmitCallback?: () => void }) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      router.push(`/collections?q=${encodeURIComponent(inputValue.trim())}`);
      setInputValue("");
      onSubmitCallback?.();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`relative group flex items-center transition-all duration-500 ease-in-out ${
        isFocused ? "w-full max-w-[380px]" : "w-full max-w-[280px]"
      }`}
    >
      <div className={`absolute left-4 transition-colors duration-300 pointer-events-none ${
        isFocused ? "text-gold" : "text-forest/30"
      }`}>
        <Search size={15} strokeWidth={1.5} />
      </div>
      <input
        type="text"
        value={inputValue}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search our collections..."
        className="w-full py-2.5 pl-11 pr-5 bg-white/40 border border-gold/10 rounded-full font-dm text-[12px] tracking-wide text-forest placeholder:text-text-muted/40 focus:outline-none focus:border-gold/30 focus:bg-white shadow-[0_2px_10px_rgba(184,150,62,0.02)] focus:shadow-[0_4px_20px_rgba(184,150,62,0.08)] transition-all duration-500"
      />
    </form>
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
           if (p.category && p.sub_category) {
              const catKey = p.category.toLowerCase();
              if (!dbMap[catKey]) dbMap[catKey] = new Set();
              dbMap[catKey].add(p.sub_category);
           }
        });

        const updatedLinks = NAV_LINKS.map(link => {
           const linkCatKey = link.label.toLowerCase();
           const dbSet = dbMap[linkCatKey];
           
           if ('subLinks' in link) {
              const existingSubLinks = link.subLinks.map((s: any) => s.label.toLowerCase());
              let newSubLinks: any[] = [...link.subLinks];
              
              if (dbSet) {
                 dbSet.forEach(sc => {
                    if (!existingSubLinks.includes(sc.toLowerCase())) {
                       newSubLinks.push({
                          label: sc,
                          href: `${link.href}?type=${encodeURIComponent(sc.toLowerCase())}`
                       });
                    }
                 });
              }
              return { ...link, subLinks: newSubLinks };
           }
           return link;
        });
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
                <SearchBar />
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

          {/* Mobile Search Bar */}
          <div className="block md:hidden w-full mt-1">
            <SearchBar />
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
            <SearchBar onSubmitCallback={() => setMenuOpen(false)} />
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-8 pt-4 overflow-y-auto">
            {dynamicNavLinks.map((link) => {
              if ('subLinks' in link) {
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