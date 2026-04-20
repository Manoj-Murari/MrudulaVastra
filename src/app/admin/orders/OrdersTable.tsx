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
} from "lucide-react";
import { updateOrderStatus } from "@/actions/admin";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "Pending", color: "var(--admin-amber)", bg: "var(--admin-amber-muted)", icon: Clock },
  paid: { label: "Paid", color: "var(--admin-emerald)", bg: "var(--admin-emerald-muted)", icon: CheckCircle },
  shipped: { label: "Shipped", color: "var(--admin-blue)", bg: "var(--admin-blue-muted)", icon: Truck },
  delivered: { label: "Delivered", color: "var(--admin-emerald)", bg: "var(--admin-emerald-muted)", icon: Package },
};

export default function OrdersTable({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    // Optimistic update
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
    }
    await updateOrderStatus(orderId, newStatus);
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: "var(--admin-text)" }}>
          Fulfillment Engine
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}>
          {orders.length} total orders · {orders.filter((o) => o.status === "pending").length} pending
        </p>
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
          {["all", "pending", "paid", "shipped", "delivered"].map((s) => (
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

      {/* Table */}
      <div className="rounded-xl border overflow-x-auto admin-scroll" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
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
                style={{ borderColor: "var(--admin-border)", fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-surface-elevated)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span className="text-[13px] font-semibold" style={{ color: "var(--admin-text)" }}>
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
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
                  {getNextStatus(selectedOrder.status) && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, getNextStatus(selectedOrder.status)!)}
                      disabled={updatingId === selectedOrder.id}
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
    </div>
  );
}
