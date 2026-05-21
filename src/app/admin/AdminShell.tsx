"use client";

import { useState, useEffect, createContext, useContext, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

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
  Ticket,
  ExternalLink,
  Truck,
  X,
  CheckCircle2,
  Info,
  Zap
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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
  { label: "Coupons", icon: Ticket, href: "/admin/coupons" },
  { label: "Delivery Charges", icon: Truck, href: "/admin/settings" },
];

/* ─── Types ───────────────────────────────────────────────── */
type AppNotification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  time: Date;
  type: "order" | "enquiry";
};

type ToastMsg = {
  id: string;
  title: string;
  message: string;
  type: "order" | "enquiry";
};

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
  const [bellOpen, setBellOpen] = useState(false);
  const pathname = usePathname();

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [shakeBell, setShakeBell] = useState(false);
  const [missedActivity, setMissedActivity] = useState<{
    ordersCount: number; totalAmount: number; enquiriesCount: number;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Persistence: Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("admin_notifications");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert ISO strings back to Date objects
        const hydrated = parsed.map((n: any) => ({
          ...n,
          time: new Date(n.time)
        }));
        setNotifications(hydrated);
      } catch (e) {
        console.error("Failed to parse notifications", e);
      }
    }
  }, []);

  // Persistence: Save to localStorage
  useEffect(() => {
    localStorage.setItem("admin_notifications", JSON.stringify(notifications));
  }, [notifications]);
  
  const supabase = createClient();

  const unreadCount = notifications.filter(n => !n.read).length;

  // CMD+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setCmdOpen(false);
        setBellOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Click outside to close bell dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Supabase Subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('admin-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const order = payload.new as any;
        addNotification(
          "New Order",
          `Order #${order.id.slice(0, 8)} received for ₹${order.total_amount}`,
          "order"
        );
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'enquiries' }, (payload) => {
        const enq = payload.new as any;
        addNotification(
          "New Enquiry",
          `From ${enq.name}: ${enq.subject || 'No Subject'}`,
          "enquiry"
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Check for missed activity while admin was away
  useEffect(() => {
    const checkMissedActivity = async () => {
      const lastActive = localStorage.getItem('admin_last_active');
      const now = new Date().toISOString();

      if (!lastActive) {
        localStorage.setItem('admin_last_active', now);
        return;
      }

      try {
        const ordersRes = await supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .gt('created_at', lastActive)
          .neq('status', 'pending')
          .order('created_at', { ascending: false });
        const enquiriesRes = await supabase
          .from('enquiries')
          .select('id, name, subject, created_at')
          .gt('created_at', lastActive)
          .order('created_at', { ascending: false });

        const orders = (ordersRes.data || []) as any[];
        const enquiries = (enquiriesRes.data || []) as any[];

        if (orders.length > 0 || enquiries.length > 0) {
          const totalAmt = orders.reduce((s: number, o: any) => s + (o.total_amount || 0), 0);
          setMissedActivity({ ordersCount: orders.length, totalAmount: totalAmt, enquiriesCount: enquiries.length });

          // Add missed orders to bell notifications (deduplicated)
          orders.forEach((order: any) => {
            const prefix = order.id.slice(0, 8);
            setNotifications(prev => {
              if (prev.some(n => n.message.includes(prefix))) return prev;
              return [{
                id: `missed-${order.id}`,
                title: 'New Order',
                message: `Order #${prefix} received for ₹${order.total_amount}`,
                read: false,
                time: new Date(order.created_at),
                type: 'order' as const,
              }, ...prev].slice(0, 50);
            });
          });

          enquiries.forEach((enq: any) => {
            const enqId = String(enq.id);
            setNotifications(prev => {
              if (prev.some(n => n.id === `missed-enq-${enqId}`)) return prev;
              return [{
                id: `missed-enq-${enqId}`,
                title: 'New Enquiry',
                message: `From ${enq.name}: ${enq.subject || 'No Subject'}`,
                read: false,
                time: new Date(enq.created_at),
                type: 'enquiry' as const,
              }, ...prev].slice(0, 50);
            });
          });
        }
      } catch (err) {
        console.error('Failed to check missed activity:', err);
      }

      localStorage.setItem('admin_last_active', now);
    };

    checkMissedActivity();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep last-active timestamp fresh while admin is using the panel
  useEffect(() => {
    const tick = setInterval(() => {
      localStorage.setItem('admin_last_active', new Date().toISOString());
    }, 60_000);
    return () => clearInterval(tick);
  }, []);

  const addNotification = (title: string, message: string, type: "order" | "enquiry") => {
    const id = Math.random().toString(36).substr(2, 9);
    
    // Add to notification list
    setNotifications(prev => [{ id, title, message, read: false, time: new Date(), type }, ...prev].slice(0, 50));
    
    // Add to toasts
    setToasts(prev => [...prev, { id, title, message, type }]);
    
    // Trigger bell shake
    setShakeBell(true);
    setTimeout(() => setShakeBell(false), 500);

    // Auto remove toast
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <SidebarContext.Provider value={{ collapsed, toggle: () => setCollapsed((v) => !v) }}>
      <div className="flex h-[100dvh] overflow-hidden bg-black" style={{ background: "var(--admin-bg)", color: "var(--admin-text)" }}>
        {/* ━━━ MOBILE BACKDROP ━━━ */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-[40] md:hidden animate-fade-in"
            style={{ background: "rgba(0,0,0,0.6)" }}
          />
        )}

        {/* ━━━ SIDEBAR ━━━ */}
        <aside
          className={`admin-sidebar fixed md:relative z-[50] h-full border-r shrink-0 overflow-hidden flex flex-col transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} ${collapsed ? "admin-sidebar-collapsed" : ""}`}
          style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)", width: collapsed ? 72 : 260 }}
        >
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 px-5 h-16 border-b shrink-0 hover:opacity-80 transition-opacity" style={{ borderColor: "var(--admin-border)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--admin-accent)" }}>
              <Layers size={16} className="text-black" />
            </div>
            {!collapsed && (
              <div className="admin-sidebar-label">
                <p className="text-sm font-bold tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Mrudula Vastra
                </p>
                <p className="text-[9px] uppercase tracking-[0.25em]" style={{ color: "var(--admin-text-muted)" }}>
                  Command Center
                </p>
              </div>
            )}
          </Link>

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
                    <div className="admin-active-indicator" />
                  )}
                  <item.icon size={18} className="shrink-0" />
                  {!collapsed && (
                    <span
                      className="admin-sidebar-label text-[13px] font-medium"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* View Store Divider */}
            <div className="pt-4 mt-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-500/70 hover:text-amber-500 hover:bg-amber-500/5 transition-all duration-200"
              >
                <ExternalLink size={18} className="shrink-0" />
                {!collapsed && <span className="text-[13px] font-medium">View Storefront</span>}
              </Link>
            </div>
          </nav>

          {/* Collapse Toggle (Desktop Only) */}
          <div className="px-3 pb-4 hidden md:block">
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-colors duration-200 hover:opacity-80"
              style={{ background: "var(--admin-surface-elevated)", color: "var(--admin-text-dim)" }}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              {!collapsed && (
                <span className="text-[11px] font-medium uppercase tracking-wider">
                  Collapse
                </span>
              )}
            </button>
          </div>
        </aside>

        {/* ━━━ MAIN CONTENT ━━━ */}
        <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
          
          {/* ── TOP HEADER ── */}
          <header
            className="h-16 shrink-0 flex items-center justify-between px-4 md:px-6 border-b z-[30]"
            style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}
          >
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
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
              <div className="flex items-center gap-2 text-[12px] min-w-0 truncate" style={{ color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}>
              <Link href="/admin" className="hover:text-[var(--admin-accent)] transition-colors shrink-0">Dashboard</Link>
              {pathname !== "/admin" && (
                <>
                  <span className="shrink-0">/</span>
                  <span className="truncate" style={{ color: "var(--admin-text-muted)" }}>
                    {pathname.split("/").pop()?.replace(/^\w/, (c) => c.toUpperCase())}
                  </span>
                </>
              )}
            </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
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
                <Search size={13} className="shrink-0" />
                <span className="hidden sm:inline">Search…</span>
                <kbd className="hidden sm:inline-flex items-center ml-2 px-1.5 py-0.5 rounded text-[10px] border shrink-0" style={{ borderColor: "var(--admin-border)" }}>
                  <Command size={9} className="inline -mt-0.5" />K
                </kbd>
              </button>

              {/* Notifications */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setBellOpen(prev => !prev)}
                  className={`relative p-1.5 md:p-2 rounded-lg transition-colors duration-200 ${shakeBell ? 'admin-bell-shake' : ''}`}
                  style={{ background: bellOpen ? "var(--admin-border)" : "var(--admin-surface-elevated)", color: "var(--admin-text-dim)" }}
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span 
                      className="absolute top-1 right-1 w-2 h-2 rounded-full" 
                      style={{ background: "var(--admin-red)" }} 
                    />
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {bellOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 rounded-xl border shadow-2xl overflow-hidden z-50 admin-fade-scale-in"
                    style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
                  >
                      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface-elevated)" }}>
                        <h3 className="text-[13px] font-semibold" style={{ color: "var(--admin-text)" }}>Notifications</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllAsRead}
                            className="text-[10px] uppercase tracking-wider font-bold hover:underline"
                            style={{ color: "var(--admin-accent)" }}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto admin-scroll">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-[12px]" style={{ color: "var(--admin-text-dim)" }}>
                            No notifications yet
                          </div>
                        ) : (
                          <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
                            {notifications.map((notif) => (
                              <div 
                                key={notif.id} 
                                className={`px-4 py-3 flex gap-3 transition-colors ${!notif.read ? 'bg-amber-500/5' : ''}`}
                                onClick={() => {
                                  setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                                }}
                              >
                                <div className="mt-0.5 shrink-0">
                                  {notif.type === "order" ? (
                                    <ShoppingCart size={14} className="text-emerald-500" />
                                  ) : (
                                    <MessageSquare size={14} className="text-amber-500" />
                                  )}
                                </div>
                                <div className="flex-1 space-y-1 cursor-default">
                                  <div className="text-[12px] font-medium leading-tight" style={{ color: "var(--admin-text)" }}>{notif.title}</div>
                                  <div className="text-[11px] leading-snug" style={{ color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}>{notif.message}</div>
                                  <div className="text-[9px] uppercase tracking-wider" style={{ color: "var(--admin-text-muted)" }}>
                                    {notif.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                                {!notif.read && (
                                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "var(--admin-accent)" }} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <div
                className="flex items-center gap-2 px-2 py-1.5 md:px-3 rounded-lg max-w-[120px] sm:max-w-xs"
                style={{ background: "var(--admin-surface-elevated)" }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: "var(--admin-accent)", color: "#000" }}>
                  {user?.email?.[0]?.toUpperCase() || "A"}
                </div>
                <span className="text-[11px] font-medium truncate" style={{ color: "var(--admin-text-muted)" }}>
                    {user?.email?.split("@")[0] || "Admin"}
                  </span>
              </div>
            </div>
          </header>

          {/* ── "WHILE YOU WERE AWAY" BANNER ── */}
          {missedActivity && (
            <div className="overflow-hidden shrink-0 admin-slide-up">
                <div
                  className="mx-4 sm:mx-6 lg:mx-8 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(184,150,62,0.08), rgba(52,211,153,0.05))',
                    borderColor: 'rgba(184,150,62,0.2)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'var(--admin-accent-glow)' }}
                    >
                      <Zap size={14} style={{ color: 'var(--admin-accent)' }} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: 'var(--admin-text)', fontFamily: "'DM Sans', sans-serif" }}>
                        While you were away
                      </p>
                      <p className="text-[12px] mt-0.5" style={{ color: 'var(--admin-text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
                        {missedActivity.ordersCount > 0 && (
                          <span>
                            <strong>{missedActivity.ordersCount}</strong> new order{missedActivity.ordersCount > 1 ? 's' : ''}{' '}
                            (₹{missedActivity.totalAmount.toLocaleString('en-IN')})
                          </span>
                        )}
                        {missedActivity.ordersCount > 0 && missedActivity.enquiriesCount > 0 && ' and '}
                        {missedActivity.enquiriesCount > 0 && (
                          <span>
                            <strong>{missedActivity.enquiriesCount}</strong> new enquir{missedActivity.enquiriesCount > 1 ? 'ies' : 'y'}
                          </span>
                        )}
                        {' '}received
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {missedActivity.ordersCount > 0 && (
                      <Link
                        href="/admin/orders"
                        className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--admin-accent)', background: 'var(--admin-accent-glow)' }}
                        onClick={() => setMissedActivity(null)}
                      >
                        Review Orders
                      </Link>
                    )}
                    <button
                      onClick={() => setMissedActivity(null)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--admin-text-dim)' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
            </div>
          )}

          {/* ── MAIN SCROLL AREA ── */}
          <main 
            className="flex-1 overflow-y-auto admin-scroll p-4 sm:p-6 lg:p-8"
            style={{ WebkitTransform: "translate3d(0,0,0)", transform: "translate3d(0,0,0)" }}
          >
            {children}
          </main>

          {/* ── TOAST CONTAINER ── */}
          <div className="absolute bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
              {toasts.map((toast) => (
                <div
                  key={toast.id}
                  className="admin-toast-in pointer-events-auto flex items-start gap-3 w-72 md:w-80 p-4 rounded-xl shadow-xl border"
                  style={{ 
                    background: "rgba(10, 10, 10, 0.95)", 
                    borderColor: "var(--admin-border-active)"
                  }}
                >
                  <div className="shrink-0 mt-0.5">
                    {toast.type === "order" ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : (
                      <Info size={16} className="text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[13px] font-semibold" style={{ color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
                      {toast.title}
                    </h4>
                    <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {toast.message}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeToast(toast.id)}
                    className="shrink-0 text-gray-500 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* ━━━ COMMAND PALETTE ━━━ */}
        {cmdOpen && (
          <>
            <div
              onClick={() => setCmdOpen(false)}
              className="fixed inset-0 z-[200] animate-fade-in"
              style={{ background: "rgba(0,0,0,0.7)" }}
            />
            <div
              className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[201] rounded-xl overflow-hidden border admin-fade-scale-in"
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
            </div>
          </>
        )}
      </div>
    </SidebarContext.Provider>
  );
}
