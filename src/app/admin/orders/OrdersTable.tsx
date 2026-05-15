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
  MapPin,
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
  const emptyLineItem = () => ({ productId: "", size: "", quantity: 1 });
  const [offlineForm, setOfflineForm] = useState({
    customerName: "",
    phone: "",
    customerEmail: "",
    paymentMode: "UPI",
    lineItems: [emptyLineItem()]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateLineItem = (idx: number, field: string, value: any) => {
    setOfflineForm(prev => {
      const items = [...prev.lineItems];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, lineItems: items };
    });
  };
  const addLineItem = () => setOfflineForm(prev => ({ ...prev, lineItems: [...prev.lineItems, emptyLineItem()] }));
  const removeLineItem = (idx: number) => setOfflineForm(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== idx) }));

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

  const [trackingForm, setTrackingForm] = useState({ carrierName: "", trackingId: "", trackingUrl: "" });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);

    let carrierName = undefined;
    let trackingId = undefined;
    let trackingUrl = undefined;
    if (newStatus === "shipped") {
      carrierName = trackingForm.carrierName || undefined;
      trackingId = trackingForm.trackingId || undefined;
      trackingUrl = trackingForm.trackingUrl || undefined;
    } else if (newStatus === "delivered") {
      // no-op
    }

    // Optimistic update
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, carrier_name: carrierName, tracking_id: trackingId, tracking_url: trackingUrl } : o)));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev: any) => ({ ...prev, status: newStatus, carrier_name: carrierName, tracking_id: trackingId, tracking_url: trackingUrl }));
    }

    await updateOrderStatus(orderId, newStatus, carrierName, trackingId, trackingUrl);
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
                  className="grid grid-cols-[1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-4 border-b cursor-pointer transition-colors duration-150 admin-table-row-hover"
                  style={{
                    borderColor: "var(--admin-border)",
                    fontFamily: "'DM Sans', sans-serif",
                    opacity: order.status === "cancelled" ? 0.6 : 1
                  }}
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
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "var(--admin-text-dim)" }}>Tracking Link (URL)</label>
                        <input
                          type="url"
                          value={trackingForm.trackingUrl}
                          onChange={(e) => setTrackingForm((prev) => ({ ...prev, trackingUrl: e.target.value }))}
                          placeholder="https://..."
                          className="w-full bg-transparent border rounded-md px-3 py-2 outline-none text-[12px]"
                          style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)" }}
                        />
                      </div>
                    </div>
                  )}

                  {getNextStatus(selectedOrder.status) === "delivered" && (
                    <div className="mt-4 p-3 rounded-lg border space-y-3" style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface-elevated)" }}>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "var(--admin-amber)" }}>Confirm Delivery</label>
                        <p className="text-[12px] text-[var(--admin-text-dim)]">Marking this as delivered will notify the customer.</p>
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

                {/* Customer Details */}
                <div className="rounded-lg border p-4" style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: "var(--admin-text-dim)" }}>
                    Customer Details
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[12px]" style={{ color: "var(--admin-text-muted)" }}>Name</span>
                      <span className="text-[13px] font-medium" style={{ color: "var(--admin-text)" }}>
                        {selectedOrder.customer_name || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[12px]" style={{ color: "var(--admin-text-muted)" }}>Phone</span>
                      <span className="text-[13px] font-medium" style={{ color: "var(--admin-text)" }}>
                        {selectedOrder.phone ? (
                          <a href={`tel:${selectedOrder.phone}`} style={{ color: "var(--admin-accent)" }}>{selectedOrder.phone}</a>
                        ) : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[12px]" style={{ color: "var(--admin-text-muted)" }}>Email</span>
                      <span className="text-[13px] font-medium" style={{ color: "var(--admin-text)" }}>
                        {selectedOrder.customer_email ? (
                          <a href={`mailto:${selectedOrder.customer_email}`} style={{ color: "var(--admin-accent)" }}>{selectedOrder.customer_email}</a>
                        ) : (
                          <span style={{ color: "var(--admin-amber)" }}>Not provided</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[12px]" style={{ color: "var(--admin-text-muted)" }}>Source</span>
                      <span
                        className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: selectedOrder.user_id ? "var(--admin-blue-muted)" : "var(--admin-amber-muted)",
                          color: selectedOrder.user_id ? "var(--admin-blue)" : "var(--admin-amber)",
                        }}
                      >
                        {selectedOrder.user_id ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {(selectedOrder.shipping_address || selectedOrder.shipping_city || selectedOrder.shipping_state || selectedOrder.shipping_pincode) && (
                  <div className="rounded-lg border p-4" style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-1.5" style={{ color: "var(--admin-text-dim)" }}>
                      <MapPin size={12} />
                      Shipping Address
                    </p>
                    <div className="space-y-2">
                      {selectedOrder.shipping_address && (
                        <p className="text-[13px] leading-relaxed" style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}>
                          {selectedOrder.shipping_address}
                        </p>
                      )}
                      <p className="text-[12px]" style={{ color: "var(--admin-text-muted)" }}>
                        {[selectedOrder.shipping_city, selectedOrder.shipping_state].filter(Boolean).join(", ")}
                        {selectedOrder.shipping_pincode && (
                          <span className="ml-1.5 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--admin-accent-glow)", color: "var(--admin-accent)", border: "1px solid var(--admin-border-active)" }}>
                            {selectedOrder.shipping_pincode}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Details */}
                <div className="rounded-lg border p-4" style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: "var(--admin-text-dim)" }}>
                    Payment Details
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px]" style={{ color: "var(--admin-text-muted)" }}>Total Amount</span>
                      <span className="text-xl font-bold" style={{ color: "var(--admin-accent)", fontFamily: "'DM Sans', sans-serif" }}>
                        ₹{selectedOrder.total_amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {selectedOrder.payment_mode && (
                      <div className="flex justify-between">
                        <span className="text-[12px]" style={{ color: "var(--admin-text-muted)" }}>Payment Mode</span>
                        <span className="text-[13px] font-medium" style={{ color: "var(--admin-text)" }}>
                          {selectedOrder.payment_mode}
                        </span>
                      </div>
                    )}
                    {selectedOrder.razorpay_payment_id && (
                      <div className="flex justify-between">
                        <span className="text-[12px]" style={{ color: "var(--admin-text-muted)" }}>Razorpay ID</span>
                        <span className="text-[11px] font-mono" style={{ color: "var(--admin-text-dim)" }}>
                          {selectedOrder.razorpay_payment_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping / Tracking */}
                {(selectedOrder.carrier_name || selectedOrder.tracking_id || ["shipped", "delivered"].includes(selectedOrder.status)) && (
                  <div className="rounded-lg border p-4" style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: "var(--admin-text-dim)" }}>
                      Shipping & Tracking
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[12px]" style={{ color: "var(--admin-text-muted)" }}>Carrier</span>
                        <span className="text-[13px] font-medium" style={{ color: "var(--admin-text)" }}>
                          {selectedOrder.carrier_name || "Not assigned"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[12px]" style={{ color: "var(--admin-text-muted)" }}>Tracking ID</span>
                        <span className="text-[13px] font-mono font-medium" style={{ color: "var(--admin-text)" }}>
                          {selectedOrder.tracking_id || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Line Items */}
                {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                  <div className="rounded-lg border p-4" style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: "var(--admin-text-dim)" }}>
                      Items ({selectedOrder.order_items.length})
                    </p>
                    <div className="space-y-3">
                      {selectedOrder.order_items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--admin-border)" }}>
                          <div className="flex items-center gap-3">
                            {item.products?.image && (
                              <img
                                src={item.products.image}
                                alt={item.products.name}
                                className="w-10 h-10 rounded-md object-cover border"
                                style={{ borderColor: "var(--admin-border)" }}
                              />
                            )}
                            <div>
                              <p className="text-[13px] font-medium" style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}>
                                {item.products?.name || `Product #${item.product_id}`}
                              </p>
                              <p className="text-[11px] flex items-center gap-1.5 flex-wrap" style={{ color: "var(--admin-text-dim)" }}>
                                Qty: {item.quantity} × ₹{item.unit_price.toLocaleString("en-IN")}
                                {item.variant && (
                                  <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--admin-accent-glow)", color: "var(--admin-accent)", border: "1px solid var(--admin-border-active)" }}>
                                    Size: {item.variant}
                                  </span>
                                )}
                                {item.products?.category && (
                                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: "var(--admin-surface-elevated)", color: "var(--admin-text-dim)" }}>
                                    {item.products.category}
                                  </span>
                                )}
                              </p>
                            </div>
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
                    // Submit each line item as a separate order (they share customer info)
                    let lastError = "";
                    for (const item of offlineForm.lineItems) {
                      if (!item.productId) continue;
                      const res = await createOfflineOrder({
                        customerName: offlineForm.customerName,
                        phone: offlineForm.phone,
                        customerEmail: offlineForm.customerEmail || undefined,
                        productId: Number(item.productId),
                        size: item.size || undefined,
                        quantity: Number(item.quantity),
                        paymentMode: offlineForm.paymentMode
                      });
                      if (res.error) { lastError = res.error; break; }
                    }
                    setIsSubmitting(false);
                    if (lastError) { alert(lastError); }
                    else {
                      setIsAddingOffline(false);
                      setOfflineForm({ customerName: "", phone: "", customerEmail: "", paymentMode: "UPI", lineItems: [emptyLineItem()] });
                      window.location.reload();
                    }
                  }}
                  className="space-y-5"
                >
                  {/* ── Customer Info ── */}
                  <div className="space-y-4 pb-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
                    <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "var(--admin-accent)" }}>Customer Details</p>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Customer Name</label>
                      <input
                        required
                        value={offlineForm.customerName}
                        onChange={e => {
                          // Allow only alphabets and spaces
                          const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                          setOfflineForm({ ...offlineForm, customerName: val });
                        }}
                        placeholder="Full name (letters only)"
                        className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]"
                        style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Phone Number</label>
                      <input
                        required
                        value={offlineForm.phone}
                        onChange={e => {
                          // Allow only digits, max 10
                          const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setOfflineForm({ ...offlineForm, phone: val });
                        }}
                        placeholder="10-digit number"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]"
                        style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Email (Optional)</label>
                      <input
                        type="email"
                        value={offlineForm.customerEmail}
                        onChange={e => setOfflineForm({ ...offlineForm, customerEmail: e.target.value })}
                        placeholder="customer@email.com"
                        className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]"
                        style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Payment Mode</label>
                      <select value={offlineForm.paymentMode} onChange={e => setOfflineForm({ ...offlineForm, paymentMode: e.target.value })} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)", background: "var(--admin-surface)" }}>
                        <option value="Cash" style={{ background: "var(--admin-surface)", color: "var(--admin-text)" }}>Cash</option>
                        <option value="UPI" style={{ background: "var(--admin-surface)", color: "var(--admin-text)" }}>UPI</option>
                        <option value="Bank Transfer" style={{ background: "var(--admin-surface)", color: "var(--admin-text)" }}>Bank Transfer</option>
                      </select>
                    </div>
                  </div>

                  {/* ── Product Line Items ── */}
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "var(--admin-accent)" }}>Products Ordered</p>

                    {offlineForm.lineItems.map((item, idx) => {
                      const selectedProduct = products.find(p => p.id === Number(item.productId));
                      const sizeInvVariant = (selectedProduct?.variants || []).find((v: any) => v.type === "size_inventory");
                      const hasSizes = sizeInvVariant && Object.keys(sizeInvVariant.data).length > 0;

                      return (
                        <div key={idx} className="p-3 rounded-xl border space-y-3" style={{ borderColor: "var(--admin-border-active)", background: "var(--admin-surface-elevated)" }}>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--admin-text-dim)" }}>Item {idx + 1}</span>
                            {offlineForm.lineItems.length > 1 && (
                              <button type="button" onClick={() => removeLineItem(idx)} className="p-1 rounded" style={{ color: "var(--admin-red)" }}>
                                <X size={14} />
                              </button>
                            )}
                          </div>

                          <div>
                            <label className="block text-[11px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "var(--admin-text-dim)" }}>Product</label>
                            <select
                              required
                              value={item.productId}
                              onChange={e => { updateLineItem(idx, "productId", e.target.value); updateLineItem(idx, "size", ""); }}
                              className="w-full bg-transparent border rounded-lg px-3 py-2 outline-none text-[12px]"
                              style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)", background: "var(--admin-surface)" }}
                            >
                              <option value="" disabled>Select product...</option>
                              {products.map(p => {
                                const sv = (p.variants || []).find((v: any) => v.type === "size_inventory");
                                const hs = sv && Object.keys(sv.data).length > 0;
                                return (
                                  <option key={p.id} value={p.id} disabled={p.inventory_count < 1} style={{ background: "var(--admin-surface)", color: "var(--admin-text)" }}>
                                    {p.name} {hs ? "(Sizes)" : `(Stock: ${p.inventory_count})`}
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {hasSizes && (
                            <div>
                              <label className="block text-[11px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "var(--admin-text-dim)" }}>Size</label>
                              <select
                                required
                                value={item.size}
                                onChange={e => updateLineItem(idx, "size", e.target.value)}
                                className="w-full bg-transparent border rounded-lg px-3 py-2 outline-none text-[12px]"
                                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)", background: "var(--admin-surface)" }}
                              >
                                <option value="" disabled>Select size...</option>
                                {Object.entries(sizeInvVariant.data).map(([size, count]) => (
                                  <option key={size} value={size} disabled={(count as number) < 1} style={{ background: "var(--admin-surface)", color: "var(--admin-text)" }}>
                                    {size} (Stock: {count as number})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div>
                            <label className="block text-[11px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "var(--admin-text-dim)" }}>Quantity</label>
                            <input
                              required
                              type="number"
                              min="1"
                              onFocus={(e) => e.target.select()}
                              max={(() => {
                                const p = products.find(p => p.id === Number(item.productId));
                                if (!p) return 1;
                                if (item.size) {
                                  const sizeInv = (p.variants || []).find((v: any) => v.type === "size_inventory")?.data;
                                  return sizeInv ? sizeInv[item.size] || 1 : 1;
                                }
                                return p.inventory_count;
                              })()}
                              value={item.quantity}
                              onChange={e => updateLineItem(idx, "quantity", parseInt(e.target.value) || 1)}
                              className="w-full bg-transparent border rounded-lg px-3 py-2 outline-none text-[12px]"
                              style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={addLineItem}
                      className="w-full py-2 rounded-lg text-[11px] uppercase tracking-wider font-bold border-dashed border-2 flex items-center justify-center gap-2 transition-colors"
                      style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text-dim)" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--admin-accent)"; e.currentTarget.style.borderColor = "var(--admin-accent)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--admin-text-dim)"; e.currentTarget.style.borderColor = "var(--admin-border-active)"; }}
                    >
                      <Plus size={14} /> Add Another Product
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-2.5 rounded-lg text-[12px] uppercase tracking-wider font-bold transition-colors disabled:opacity-50"
                    style={{ background: "var(--admin-accent)", color: "#000", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {isSubmitting ? "Saving..." : `Save Order (${offlineForm.lineItems.length} item${offlineForm.lineItems.length > 1 ? "s" : ""})`}
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
