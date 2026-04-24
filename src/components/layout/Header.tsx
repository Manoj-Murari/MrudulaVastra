"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NAV_LINKS } from "@/data/navigation";
import { useCart } from "@/components/providers/CartProvider";

/* ── Simple underline link — pure CSS ────────────────── */
function NavLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      prefetch={true}
      className="relative py-1 text-text-nav font-medium font-dm group"
      style={{ fontSize: "12.5px", letterSpacing: "0.08em" }}
    >
      {label}
      <span className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-gold origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-400 ease-[cubic-bezier(0.25,0.4,0.25,1)]" />
    </Link>
  );
}

/* ── Lightweight Search Bar (no typewriter on mobile) ─── */
function SearchBar() {
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      router.push(`/collections?q=${encodeURIComponent(inputValue.trim())}`);
      setInputValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group w-full flex items-center">
      <div className="absolute left-3.5 text-forest/40 group-focus-within:text-gold transition-colors duration-300 pointer-events-none">
        <Search size={16} strokeWidth={1.5} />
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search sarees, kurtas..."
        className="w-full py-2 lg:py-2.5 pl-10 pr-4 bg-cream/40 border border-gold/10 rounded-full font-dm text-[11px] lg:text-[13px] tracking-wide text-forest placeholder:text-text-muted/50 focus:outline-none focus:border-gold/40 focus:bg-white transition-all duration-300"
      />
    </form>
  );
}

/* ── Header ──────────────────────────────────────────── */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, toggleCart } = useCart();
  const ticking = useRef(false);

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

              <div className="hidden md:block w-full max-w-[240px] lg:max-w-[320px]">
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
        className="hidden lg:block overflow-hidden transition-all duration-300"
        style={{
          height: scrolled ? 36 : 42,
          borderTop: "1px solid rgba(184,150,62,0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-center gap-10 h-full">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} label={link.label} href={link.href} />
          ))}
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div
          className="overflow-hidden lg:hidden animate-fade-in"
          style={{ background: "rgba(253,251,247,0.98)", borderTop: "1px solid rgba(184,150,62,0.1)" }}
        >
          <div className="px-8 py-5 space-y-0.5">
            {NAV_LINKS.map((link) => (
              <div key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3.5 text-forest font-medium font-dm text-[15px] border-bottom border-gold/10"
                >
                  {link.label}
                </Link>
              </div>
            ))}
            <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-3.5 text-forest font-medium font-dm text-[15px]">
              <User size={16} strokeWidth={1.3} />
              My Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}