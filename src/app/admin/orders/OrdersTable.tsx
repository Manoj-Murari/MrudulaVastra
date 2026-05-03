"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  ChevronRight,
  Clock,
  Truck,
  CheckCircle,
  Package,
  Plus,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { updateOrderStatus, createOfflineOrder, cancelOrder } from "@/actions/admin";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "Pending", color: "var(--admin-amber)", bg: "var(--admin-amber-muted)", icon: Clock },
  paid: { label: "Paid", color: "var(--admin-emerald)", bg: "var(--admin-emerald-muted)", icon: CheckCircle },
  shipped: { label: "Shipped", color: "var(--admin-blue)", bg: "var(--admin-blue-muted)", icon: Truck },
  delivered: { label: "Delivered", color: "var(--admin-emerald)", bg: "var(--admin-emerald-muted)", icon: Package },
  cancelled: { label: "Cancelled", color: "var(--admin-red)", bg: "var(--admin-red-muted)", icon: XCircle },
};

export default function OrdersTable({ initialOrders, products = [] }: { initialOrders: any[], products?: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isAddingOffline, setIsAddingOffline] = useState(false);
  const [offlineForm, setOfflineForm] = useState({
    customerName: "",
    phone: "",
    productId: "",
    size: "",
    quantity: 1,
    paymentMode: "Cash"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = orders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesSource = sourceFilter === "all" 
      ? true 
      : sourceFilter === "offline" 
        ? !o.user_id 
        : !!o.user_id;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const [trackingForm, setTrackingForm] = useState({ carrierName: "", trackingId: "", customerEmail: "" });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    
    // Pass carrier details if marking as shipped
    let carrierName = undefined;
    let trackingId = undefined;
    let customerEmail = undefined;
    if (newStatus === "shipped") {
      carrierName = trackingForm.carrierName || undefined;
      trackingId = trackingForm.trackingId || undefined;
      customerEmail = trackingForm.customerEmail || undefined;
    } else if (newStatus === "delivered") {
      // Also allow email override for delivered if they didn't provide it before
      customerEmail = trackingForm.customerEmail || undefined;
    }

    // Optimistic update
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, carrier_name: carrierName, tracking_id: trackingId, ...(customerEmail && { customer_email: customerEmail }) } : o)));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev: any) => ({ ...prev, status: newStatus, carrier_name: carrierName, tracking_id: trackingId, ...(customerEmail && { customer_email: customerEmail }) }));
    }

    await updateOrderStatus(orderId, newStatus, carrierName, trackingId, customerEmail);
    setUpdatingId(null);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order? This will restock all items.")) return;
    setUpdatingId(orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o)));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev: any) => ({ ...prev, status: "cancelled" }));
    }
    await cancelOrder(orderId);
    setUpdatingId(null);
  };

  const getNextStatus = (current: string) => {
    const flow = ["pending", "paid", "shipped", "delivered"];
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: "var(--admin-text)" }}>
            Fulfillment Engine
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}>
            {orders.length} total orders · {orders.filter((o) => o.status === "pending").length} pending
          </p>
        </div>
        <button
          onClick={() => setIsAddingOffline(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] uppercase tracking-wider font-bold transition-colors"
          style={{ background: "var(--admin-accent)", color: "#000", fontFamily: "'DM Sans', sans-serif" }}
        >
          <Plus size={14} /> Add Offline Order
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg border flex-1"
          style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}
        >
          <Search size={14} style={{ color: "var(--admin-text-dim)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID…"
            className="flex-1 bg-transparent outline-none text-[13px]"
            style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap overflow-x-auto pb-1 sm:pb-0 admin-scroll">
          {/* Source Filter */}
          <div className="flex bg-admin-surface rounded-lg p-1 border" style={{ borderColor: "var(--admin-border)" }}>
            {["all", "online", "offline"].map((s) => (
              <button
                key={s}
                onClick={() => setSourceFilter(s)}
                className="px-3 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold transition-all"
                style={{
                  background: sourceFilter === s ? "var(--admin-accent)" : "transparent",
                  color: sourceFilter === s ? "#000" : "var(--admin-text-dim)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="w-[1px] h-full bg-admin-border mx-1 hidden sm:block" />

          {["all", "pending", "paid", "shipped", "delivered", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-2 rounded-lg text-[11px] uppercase tracking-wider font-bold transition-colors"
              style={{
                background: statusFilter === s ? "var(--admin-accent-glow)" : "var(--admin-surface)",
                color: statusFilter === s ? "var(--admin-accent)" : "var(--admin-text-dim)",
                border: `1px solid ${statusFilter === s ? "var(--admin-border-active)" : "var(--admin-border)"}`,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[13px]" style={{ color: "var(--admin-text-dim)" }}>
            No orders match your filters
          </div>
        ) : (
          filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="rounded-xl border p-4 cursor-pointer active:scale-[0.98] transition-all"
                style={{
                  background: "var(--admin-surface)",
                  borderColor: "var(--admin-border)",
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: order.status === "cancelled" ? 0.6 : 1,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col">
                    <span className={`text-[13px] font-semibold ${order.status === "cancelled" ? "line-through" : ""}`} style={{ color: "var(--admin-text)" }}>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[9px] uppercase tracking-tighter opacity-60 font-bold" style={{ color: order.user_id ? "var(--admin-blue)" : "var(--admin-accent)" }}>
                      {order.user_id ? "Online" : "Offline"}
                    </span>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    <cfg.icon size={11} />
                    {cfg.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: "var(--admin-text-dim)" }}>
                    {new Date(order.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="text-[15px] font-bold" style={{ color: "var(--admin-text)" }}>
                    ₹{order.total_amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border overflow-x-auto admin-scroll" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
        <div className="min-w-[650px] w-full">
          {/* Table Header */}
          <div
          className="grid grid-cols-[1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-3 border-b text-[10px] uppercase tracking-[0.2em] font-bold"
          style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}
        >
          <span>Order ID</span>
          <span>Date</span>
          <span>Status</span>
          <span className="text-right">Total</span>
          <span />
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[13px]" style={{ color: "var(--admin-text-dim)" }}>
            No orders match your filters
          </div>
        ) : (
          filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="grid grid-cols-[1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-4 border-b cursor-pointer transition-colors duration-150"
                style={{ 
                  borderColor: "var(--admin-border)", 
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: order.status === "cancelled" ? 0.6 : 1
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-surface-elevated)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div className="flex flex-col">
                  <span className={`text-[13px] font-semibold ${order.status === "cancelled" ? "line-through" : ""}`} style={{ color: "var(--admin-text)" }}>
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60 font-bold" style={{ color: order.user_id ? "var(--admin-blue)" : "var(--admin-accent)" }}>
                    {order.user_id ? "Online Store" : "In-Store / Offline"}
                  </span>
                </div>
                <span className="text-[12px]" style={{ color: "var(--admin-text-muted)" }}>
                  {new Date(order.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    <cfg.icon size={11} />
                    {cfg.label}
                  </span>
                </span>
                <span className="text-[13px] font-semibold text-right" style={{ color: "var(--admin-text)" }}>
                  ₹{order.total_amount.toLocaleString("en-IN")}
                </span>
                <span className="flex items-center justify-center">
                  <ChevronRight size={14} style={{ color: "var(--admin-text-dim)" }} />
                </span>
              </div>
            );
          })
        )}
        </div>
      </div>

      {/* ── Order Detail Side Panel ── */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 z-[150]"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg z-[151] overflow-y-auto admin-scroll border-l"
              style={{ background: "var(--admin-bg)", borderColor: "var(--admin-border)" }}
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "var(--admin-text)" }}>
                      Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                    </h2>
                    <p className="text-[11px] mt-1" style={{ color: "var(--admin-text-dim)" }}>
                      Placed {new Date(selectedOrder.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg" style={{ color: "var(--admin-text-dim)" }}>
                    <X size={18} />
                  </button>
                </div>

                {/* Status + Actions */}
                <div className="rounded-lg border p-4" style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: "var(--admin-text-dim)" }}>
                    Fulfillment Status
                  </p>
                  <div className="flex items-center gap-3">
                    {["pending", "paid", "shipped", "delivered"].map((status, i) => {
                      const cfg = STATUS_CONFIG[status];
                      const isActive = selectedOrder.status === status;
                      const isPast = ["pending", "paid", "shipped", "delivered"].indexOf(selectedOrder.status) >= i;
                      return (
                        <div key={status} className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                            style={{
                              background: isPast ? cfg.bg : "transparent",
                              border: isActive ? `2px solid ${cfg.color}` : `1px solid var(--admin-border)`,
                            }}
                          >
                            <cfg.icon size={14} style={{ color: isPast ? cfg.color : "var(--admin-text-dim)" }} />
                          </div>
                          {i < 3 && (
                            <div className="w-6 h-px" style={{ background: isPast ? cfg.color : "var(--admin-border)" }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {getNextStatus(selectedOrder.status) === "shipped" && (
                    <div className="mt-4 p-3 rounded-lg border space-y-3" style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface-elevated)" }}>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "var(--admin-text-dim)" }}>Courier Name</label>
                        <input
                          value={trackingForm.carrierName}
                          onChange={(e) => setTrackingForm((prev) => ({ ...prev, carrierName: e.target.value }))}
                          placeholder="e.g. Delhivery, Blue Dart"
                          className="w-full bg-transparent border rounded-md px-3 py-2 outline-none text-[12px]"
                          style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)" }}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "var(--admin-text-dim)" }}>Tracking ID</label>
                        <input
                          value={trackingForm.trackingId}
                          onChange={(e) => setTrackingForm((prev) => ({ ...prev, trackingId: e.target.value }))}
                          placeholder="e.g. 123456789"
                          className="w-full bg-transparent border rounded-md px-3 py-2 outline-none text-[12px]"
                          style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)" }}
                        />
                      </div>
                      {!selectedOrder.customer_email && (
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "var(--admin-amber)" }}>Customer Email (Optional - For Updates)</label>
                          <input
                            type="email"
                            value={trackingForm.customerEmail}
                            onChange={(e) => setTrackingForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
                            placeholder="To send shipping email..."
                            className="w-full bg-transparent border rounded-md px-3 py-2 outline-none text-[12px]"
                            style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)" }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {getNextStatus(selectedOrder.status) === "delivered" && !selectedOrder.customer_email && (
                    <div className="mt-4 p-3 rounded-lg border space-y-3" style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface-elevated)" }}>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "var(--admin-amber)" }}>Customer Email (Optional - For Delivery Email)</label>
                        <input
                          type="email"
                          value={trackingForm.customerEmail}
                          onChange={(e) => setTrackingForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
                          placeholder="To send delivery confirmation..."
                          className="w-full bg-transparent border rounded-md px-3 py-2 outline-none text-[12px]"
                          style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)" }}
                        />
                      </div>
                    </div>
                  )}

                  {getNextStatus(selectedOrder.status) && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, getNextStatus(selectedOrder.status)!)}
                      disabled={updatingId === selectedOrder.id || selectedOrder.status === "cancelled"}
                      className="mt-4 w-full py-2.5 rounded-lg text-[12px] uppercase tracking-wider font-bold transition-colors disabled:opacity-50"
                      style={{
                        background: "var(--admin-accent)",
                        color: "#000",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {updatingId === selectedOrder.id ? "Updating…" : `Mark as ${getNextStatus(selectedOrder.status)}`}
                    </button>
                  )}
                  {selectedOrder.status !== "cancelled" && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      disabled={updatingId === selectedOrder.id}
                      className="mt-2 w-full py-2.5 rounded-lg text-[12px] uppercase tracking-wider font-bold transition-colors border"
                      style={{
                        borderColor: "var(--admin-red)",
                        color: "var(--admin-red)",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {updatingId === selectedOrder.id ? "Processing…" : "Cancel Order"}
                    </button>
                  )}
                </div>

                {/* Summary */}
                <div className="rounded-lg border p-4" style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: "var(--admin-text-dim)" }}>
                    Order Summary
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px]" style={{ color: "var(--admin-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>Total</span>
                    <span className="text-xl font-bold" style={{ color: "var(--admin-accent)", fontFamily: "'DM Sans', sans-serif" }}>
                      ₹{selectedOrder.total_amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Line Items */}
                {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                  <div className="rounded-lg border p-4" style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: "var(--admin-text-dim)" }}>
                      Items ({selectedOrder.order_items.length})
                    </p>
                    <div className="space-y-3">
                      {selectedOrder.order_items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--admin-border)" }}>
                          <div>
                            <p className="text-[13px] font-medium" style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}>
                              {item.products?.name || `Product #${item.product_id}`}
                            </p>
                            <p className="text-[11px]" style={{ color: "var(--admin-text-dim)" }}>
                              Qty: {item.quantity} × ₹{item.unit_price.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <span className="text-[13px] font-semibold" style={{ color: "var(--admin-text)" }}>
                            ₹{(item.quantity * item.unit_price).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Offline Order Modal ── */}
      <AnimatePresence>
        {isAddingOffline && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingOffline(false)}
              className="fixed inset-0 z-[150]"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="fixed top-0 right-0 h-full w-full max-w-md z-[151] overflow-y-auto admin-scroll border-l"
              style={{ background: "var(--admin-bg)", borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Add Offline Order
                  </h2>
                  <button onClick={() => setIsAddingOffline(false)} className="p-2 rounded-lg" style={{ color: "var(--admin-text-dim)" }}>
                    <X size={18} />
                  </button>
                </div>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    const res = await createOfflineOrder({
                      customerName: offlineForm.customerName,
                      phone: offlineForm.phone,
                      productId: Number(offlineForm.productId),
                      size: offlineForm.size || undefined,
                      quantity: Number(offlineForm.quantity),
                      paymentMode: offlineForm.paymentMode
                    });
                    setIsSubmitting(false);
                    if (res.error) alert(res.error);
                    else {
                      setIsAddingOffline(false);
                      window.location.reload();
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Customer Name</label>
                    <input required value={offlineForm.customerName} onChange={e => setOfflineForm({...offlineForm, customerName: e.target.value})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)" }} />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Phone Number</label>
                    <input required value={offlineForm.phone} onChange={e => setOfflineForm({...offlineForm, phone: e.target.value})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)" }} />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Product</label>
                    <select required value={offlineForm.productId} onChange={e => setOfflineForm({...offlineForm, productId: e.target.value, size: ""})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)", background: "var(--admin-surface)" }}>
                      <option value="" disabled style={{ background: "var(--admin-surface)", color: "var(--admin-text)" }}>Select a product...</option>
                      {products.map(p => {
                        const sizeInvVariant = (p.variants || []).find((v: any) => v.type === "size_inventory");
                        const hasSizes = sizeInvVariant && Object.keys(sizeInvVariant.data).length > 0;
                        const totalStock = p.inventory_count;
                        return (
                          <option key={p.id} value={p.id} disabled={totalStock < 1} style={{ background: "var(--admin-surface)", color: "var(--admin-text)" }}>
                            {p.name} {hasSizes ? `(Sizes Available)` : `(Stock: ${totalStock})`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  {offlineForm.productId && (() => {
                    const selectedProduct = products.find(p => p.id === Number(offlineForm.productId));
                    const sizeInvVariant = (selectedProduct?.variants || []).find((v: any) => v.type === "size_inventory");
                    if (sizeInvVariant && Object.keys(sizeInvVariant.data).length > 0) {
                      return (
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Size</label>
                          <select required value={offlineForm.size} onChange={e => setOfflineForm({...offlineForm, size: e.target.value})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)", background: "var(--admin-surface)" }}>
                            <option value="" disabled style={{ background: "var(--admin-surface)", color: "var(--admin-text)" }}>Select a size...</option>
                            {Object.entries(sizeInvVariant.data).map(([size, count]) => (
                              <option key={size} value={size} disabled={(count as number) < 1} style={{ background: "var(--admin-surface)", color: "var(--admin-text)" }}>
                                {size} (Stock: {count as number})
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Quantity</label>
                    <input required type="number" min="1" max={
                      (() => {
                        const p = products.find(p => p.id === Number(offlineForm.productId));
                        if (!p) return 1;
                        if (offlineForm.size) {
                          const sizeInv = (p.variants || []).find((v: any) => v.type === "size_inventory")?.data;
                          return sizeInv ? sizeInv[offlineForm.size] || 1 : 1;
                        }
                        return p.inventory_count;
                      })()
                    } value={offlineForm.quantity} onChange={e => setOfflineForm({...offlineForm, quantity: parseInt(e.target.value) || 1})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)" }} />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Payment Mode</label>
                    <select value={offlineForm.paymentMode} onChange={e => setOfflineForm({...offlineForm, paymentMode: e.target.value})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)", background: "var(--admin-surface)" }}>
                      <option value="Cash" style={{ background: "var(--admin-surface)", color: "var(--admin-text)" }}>Cash</option>
                      <option value="UPI" style={{ background: "var(--admin-surface)", color: "var(--admin-text)" }}>UPI</option>
                      <option value="Bank Transfer" style={{ background: "var(--admin-surface)", color: "var(--admin-text)" }}>Bank Transfer</option>
                    </select>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full mt-4 py-2.5 rounded-lg text-[12px] uppercase tracking-wider font-bold transition-colors disabled:opacity-50" style={{ background: "var(--admin-accent)", color: "#000", fontFamily: "'DM Sans', sans-serif" }}>
                    {isSubmitting ? "Saving..." : "Save Offline Order"}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
