"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { NAV_LINKS } from "@/data/navigation";
import { useCart } from "@/components/providers/CartProvider";

/* ── Animated underline link ─────────────────────────── */
function NavLink({ label, href }: { label: string; href: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative py-1 text-text-nav font-medium font-dm"
      style={{ fontSize: "12.5px", letterSpacing: "0.08em" }}
    >
      {label}
      <motion.span
        className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-gold origin-left"
        initial={false}
        animate={{
          scaleX: hovered ? 1 : 0,
          opacity: hovered ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
      />
    </Link>
  );
}

/* ── Compact Premium Typewriter Search Bar ───────────── */
function TypewriterSearchBar() {
  const [placeholderText, setPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const fullText = "What are you looking for?";

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleTyping = () => {
      if (!isDeleting) {
        if (placeholderText.length < fullText.length) {
          setPlaceholderText(fullText.slice(0, placeholderText.length + 1));
          timer = setTimeout(handleTyping, 80);
        } else {
          timer = setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (placeholderText.length > 0) {
          setPlaceholderText(fullText.slice(0, placeholderText.length - 1));
          timer = setTimeout(handleTyping, 40);
        } else {
          setIsDeleting(false);
          timer = setTimeout(handleTyping, 600);
        }
      }
    };
    timer = setTimeout(handleTyping, 100);
    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting]);

  return (
    <div className="relative group w-full flex items-center">
      {/* Search Icon - Positioned closer to the edge to fix "too much space" */}
      <div className="absolute left-3.5 text-forest/40 group-focus-within:text-gold transition-colors duration-300 pointer-events-none">
        <Search size={16} strokeWidth={1.5} />
      </div>

      {/* Search Input - Tightened left padding (pl-10) */}
      <input
        type="text"
        placeholder={placeholderText}
        className="w-full py-2 lg:py-2.5 pl-10 pr-4 bg-cream/40 border border-gold/10 rounded-full font-dm text-[11px] lg:text-[13px] tracking-wide text-forest placeholder:text-text-muted/50 focus:outline-none focus:border-gold/40 focus:bg-white focus:shadow-[0_4px_20px_rgba(197,168,128,0.08)] transition-all duration-500 ease-out"
      />
    </div>
  );
}

/* ── Header ──────────────────────────────────────────── */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, toggleCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(253,251,247,0.92)" : "#FDFBF7",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        boxShadow: scrolled ? "0 1px 24px rgba(26,60,46,0.06)" : "none",
        borderBottom: scrolled ? "1px solid rgba(184,150,62,0.12)" : "1px solid rgba(184,150,62,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-10">
        <div
          className="flex items-center justify-between transition-all duration-500 relative"
          style={{ paddingTop: scrolled ? "12px" : "18px", paddingBottom: scrolled ? "8px" : "12px" }}
        >
          {/* Left: Search Bar + Hamburger */}
          <div className="flex items-center gap-3 lg:gap-4 flex-1">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-text-nav hover:text-forest transition-colors p-1"
              aria-label="Menu"
            >
              {menuOpen ? <X size={22} strokeWidth={1.3} /> : <Menu size={22} strokeWidth={1.3} />}
            </button>

            <div className="w-full max-w-[150px] sm:max-w-[240px] lg:max-w-[320px]">
              <TypewriterSearchBar />
            </div>
          </div>

          {/* Center: Brand Logo */}
          <Link href="/" className="text-center flex-shrink-0 px-4">
            <h1
              className="font-playfair text-forest font-bold transition-all duration-500"
              style={{
                fontSize: scrolled ? "clamp(18px, 2.5vw, 24px)" : "clamp(22px, 3vw, 30px)",
                letterSpacing: "0.08em",
                lineHeight: 1.1,
              }}
            >
              MRUDULA VASTRA
            </h1>
            <motion.p
              animate={{
                height: scrolled ? 0 : "auto",
                opacity: scrolled ? 0 : 1,
                marginTop: scrolled ? 0 : 4,
              }}
              transition={{ duration: 0.3 }}
              className="uppercase text-gold font-dm overflow-hidden"
              style={{ fontSize: "9px", letterSpacing: "0.3em" }}
            >
              Elegance Woven in Every Thread
            </motion.p>
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
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 bg-forest text-white rounded-full flex items-center justify-center font-bold font-dm"
                    style={{ width: "17px", height: "17px", fontSize: "9px" }}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Row */}
      <motion.nav
        className="hidden lg:block overflow-hidden"
        animate={{ height: scrolled ? 36 : 42, opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{ borderTop: "1px solid rgba(184,150,62,0.08)" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-center gap-10 h-full">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} label={link.label} href={link.href} />
          ))}
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden lg:hidden"
            style={{ background: "rgba(253,251,247,0.98)", borderTop: "1px solid rgba(184,150,62,0.1)" }}
          >
            <div className="px-8 py-5 space-y-0.5">
              {NAV_LINKS.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3.5 text-forest font-medium font-dm text-[15px] border-bottom border-gold/10"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-3.5 text-forest font-medium font-dm text-[15px]">
                <User size={16} strokeWidth={1.3} />
                My Account
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}