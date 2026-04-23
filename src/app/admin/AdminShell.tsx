"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell,
  Search,
  Command,
  LogOut,
  Settings,
  BarChart3,
  Layers,
  MessageSquare,
} from "lucide-react";
import "./admin.css";

/* ─── Context ─────────────────────────────────────────────── */
const SidebarContext = createContext({ collapsed: false, toggle: () => {} });
export const useSidebar = () => useContext(SidebarContext);

/* ─── Navigation Map ──────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { label: "Inventory", icon: Package, href: "/admin/inventory" },
  { label: "Customers", icon: Users, href: "/admin/customers" },
  { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { label: "Enquiries", icon: MessageSquare, href: "/admin/enquiries" },
];

/* ─── Main Shell ──────────────────────────────────────────── */
export default function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const pathname = usePathname();

  // CMD+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
      if (e.key === "Escape") setCmdOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle: () => setCollapsed((v) => !v) }}>
      <div className="flex h-screen overflow-hidden" style={{ background: "var(--admin-bg)", color: "var(--admin-text)" }}>
        {/* ━━━ MOBILE BACKDROP ━━━ */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[40] md:hidden"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
            />
          )}
        </AnimatePresence>

        {/* ━━━ SIDEBAR ━━━ */}
        <motion.aside
          initial={false}
          animate={{ 
            width: collapsed ? 72 : 260,
            x: 0,
          }}
          transition={{ type: "spring", damping: 24, stiffness: 260 }}
          className={`fixed md:relative z-[50] h-full border-r shrink-0 overflow-hidden flex flex-col transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
          style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}
        >
          {/* Brand */}
          <div className="flex items-center gap-3 px-5 h-16 border-b shrink-0" style={{ borderColor: "var(--admin-border)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--admin-accent)" }}>
              <Layers size={16} className="text-black" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <p className="text-sm font-bold tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Mrudula Vastra
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.25em]" style={{ color: "var(--admin-text-muted)" }}>
                    Command Center
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-1 admin-scroll overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setMobileOpen(false)}
                  className="group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
                  style={{
                    background: active ? "var(--admin-accent-glow)" : "transparent",
                    color: active ? "var(--admin-accent)" : "var(--admin-text-muted)",
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                      style={{ background: "var(--admin-accent)" }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    />
                  )}
                  <item.icon size={18} className="shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-[13px] font-medium whitespace-nowrap overflow-hidden"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </nav>

          {/* Collapse Toggle (Desktop Only) */}
          <div className="px-3 pb-4 hidden md:block">
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-colors duration-200 hover:opacity-80"
              style={{ background: "var(--admin-surface-elevated)", color: "var(--admin-text-dim)" }}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] font-medium uppercase tracking-wider"
                  >
                    Collapse
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.aside>

        {/* ━━━ MAIN CONTENT ━━━ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* ── TOP HEADER ── */}
          <header
            className="h-16 shrink-0 flex items-center justify-between px-4 md:px-6 border-b"
            style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}
          >
            <div className="flex items-center gap-3 md:gap-4">
              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-1.5 rounded-lg transition-colors border"
                style={{ 
                  background: "var(--admin-surface-elevated)", 
                  borderColor: "var(--admin-border)",
                  color: "var(--admin-text-dim)" 
                }}
              >
                <Menu size={18} />
              </button>

              {/* Breadcrumbs */}
              <div className="hidden sm:flex items-center gap-2 text-[12px]" style={{ color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}>
              <Link href="/admin" className="hover:text-[var(--admin-accent)] transition-colors">Dashboard</Link>
              {pathname !== "/admin" && (
                <>
                  <span>/</span>
                  <span style={{ color: "var(--admin-text-muted)" }}>
                    {pathname.split("/").pop()?.replace(/^\w/, (c) => c.toUpperCase())}
                  </span>
                </>
              )}
            </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* CMD+K */}
              <button
                onClick={() => setCmdOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors duration-200"
                style={{
                  borderColor: "var(--admin-border)",
                  background: "var(--admin-surface-elevated)",
                  color: "var(--admin-text-dim)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12px",
                }}
              >
                <Search size={13} />
                <span>Search…</span>
                <kbd className="ml-2 px-1.5 py-0.5 rounded text-[10px] border" style={{ borderColor: "var(--admin-border)" }}>
                  <Command size={9} className="inline -mt-0.5" />K
                </kbd>
              </button>

              {/* Notifications */}
              <button
                className="relative p-1.5 md:p-2 rounded-lg transition-colors duration-200"
                style={{ background: "var(--admin-surface-elevated)", color: "var(--admin-text-dim)" }}
              >
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "var(--admin-red)" }} />
              </button>

              {/* User Avatar */}
              <div
                className="flex items-center gap-2 px-2 py-1.5 md:px-3 rounded-lg"
                style={{ background: "var(--admin-surface-elevated)" }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: "var(--admin-accent)", color: "#000" }}>
                  {user?.email?.[0]?.toUpperCase() || "A"}
                </div>
                <AnimatePresence>
                  <span className="text-[11px] font-medium hidden sm:block" style={{ color: "var(--admin-text-muted)" }}>
                    {user?.email?.split("@")[0] || "Admin"}
                  </span>
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* ── MAIN SCROLL AREA ── */}
          <main className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8">
            {children}
          </main>
        </div>

        {/* ━━━ COMMAND PALETTE ━━━ */}
        <AnimatePresence>
          {cmdOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCmdOpen(false)}
                className="fixed inset-0 z-[200]"
                style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              />
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }}
                transition={{ type: "spring", damping: 28, stiffness: 350 }}
                className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[201] rounded-xl overflow-hidden border"
                style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border-active)" }}
              >
                <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
                  <Search size={18} style={{ color: "var(--admin-text-dim)" }} />
                  <input
                    autoFocus
                    placeholder="Search orders, products, customers…"
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}
                  />
                  <kbd
                    className="px-2 py-0.5 rounded text-[10px] border"
                    style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-dim)" }}
                  >
                    ESC
                  </kbd>
                </div>
                <div className="p-4 space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setCmdOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150"
                      style={{
                        color: "var(--admin-text-muted)",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "13px",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-surface-elevated)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </SidebarContext.Provider>
  );
}
