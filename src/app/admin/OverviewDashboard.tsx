"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import {
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  Users,
  AlertTriangle,
  Clock,
  PackageX,
  ArrowUpRight,
  ArrowDownRight,
  Package,
} from "lucide-react";

/* ─── Types ───────────────────────────────────────────────── */
interface OverviewData {
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    totalCustomers: number;
    totalProducts: number;
  };
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  categories: { name: string; count: number; revenue: number }[];
  actionItems: {
    pendingOrders: number;
    lowStock: number;
    outOfStock: number;
    lowStockProducts: any[];
  };
  recentOrders: any[];
}

/* ─── Palette ─────────────────────────────────────────────── */
const PIE_COLORS = ["#B8963E", "#34D399", "#60A5FA", "#F87171", "#A78BFA", "#FBBF24"];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.4, 0.25, 1] as const } },
};

/* ─── Custom Tooltip ──────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="admin-chart-tooltip">
      <p style={{ color: "var(--admin-text-muted)", fontSize: "11px", marginBottom: 6 }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, fontSize: "13px", fontWeight: 600 }}>
          {entry.name === "revenue" ? `₹${entry.value.toLocaleString("en-IN")}` : `${entry.value} orders`}
        </p>
      ))}
    </div>
  );
}

/* ─── MAIN COMPONENT ──────────────────────────────────────── */
export default function OverviewDashboard({ data }: { data: OverviewData }) {
  const [isMounted, setIsMounted] = useState(false);
  const { kpis, revenueByMonth, categories, actionItems, recentOrders } = data;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate real month-over-month trend
  const calcTrend = (current: number, prev: number): { label: string | null; up: boolean } => {
    if (prev === 0 && current === 0) return { label: null, up: true };
    if (prev === 0 && current > 0) return { label: "New", up: true };
    const pct = ((current - prev) / prev) * 100;
    const sign = pct >= 0 ? "+" : "";
    return { label: `${sign}${pct.toFixed(1)}%`, up: pct >= 0 };
  };

  const thisMonth = revenueByMonth[revenueByMonth.length - 1] ?? { revenue: 0, orders: 0 };
  const lastMonth = revenueByMonth[revenueByMonth.length - 2] ?? { revenue: 0, orders: 0 };

  const revTrend = calcTrend(thisMonth.revenue, lastMonth.revenue);
  const orderTrend = calcTrend(thisMonth.orders, lastMonth.orders);
  const avgCurrent = thisMonth.orders > 0 ? thisMonth.revenue / thisMonth.orders : 0;
  const avgPrev = lastMonth.orders > 0 ? lastMonth.revenue / lastMonth.orders : 0;
  const avgTrend = calcTrend(avgCurrent, avgPrev);
  const custTrend = calcTrend(kpis.totalCustomers, 0);

  const kpiCards = [
    {
      label: "Total Revenue",
      value: `₹${kpis.totalRevenue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      trend: revTrend.label,
      trendUp: revTrend.up,
      color: "var(--admin-emerald)",
      bg: "var(--admin-emerald-muted)",
    },
    {
      label: "Total Orders",
      value: kpis.totalOrders.toString(),
      icon: ShoppingCart,
      trend: orderTrend.label,
      trendUp: orderTrend.up,
      color: "var(--admin-blue)",
      bg: "var(--admin-blue-muted)",
    },
    {
      label: "Avg. Order Value",
      value: `₹${kpis.avgOrderValue.toLocaleString("en-IN")}`,
      icon: TrendingUp,
      trend: avgTrend.label,
      trendUp: avgTrend.up,
      color: "var(--admin-accent)",
      bg: "var(--admin-accent-glow)",
    },
    {
      label: "Customers",
      value: kpis.totalCustomers.toString(),
      icon: Users,
      trend: kpis.totalCustomers > 0 ? custTrend.label : null,
      trendUp: custTrend.up,
      color: "var(--admin-amber)",
      bg: "var(--admin-amber-muted)",
    },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* ── Header ── */}
      <motion.div variants={fadeUp}>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif", color: "var(--admin-text)" }}
        >
          Dashboard Overview
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}>
          Real-time snapshot of your Mrudula Vastra operations
        </p>
      </motion.div>

      {/* ── KPI Matrix ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="rounded-xl border p-5 flex flex-col justify-between"
            style={{
              background: "var(--admin-surface)",
              borderColor: "var(--admin-border)",
              minHeight: 140,
            }}
          >
            <div className="flex items-center justify-between">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: kpi.bg }}
              >
                <kpi.icon size={17} style={{ color: kpi.color }} />
              </div>
              {kpi.trend !== null && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{
                    background: kpi.trendUp ? "var(--admin-emerald-muted)" : "var(--admin-red-muted)",
                    color: kpi.trendUp ? "var(--admin-emerald)" : "var(--admin-red)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {kpi.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {kpi.trend}
                </div>
              )}
            </div>
            <div className="mt-4">
              <p
                className="text-[11px] uppercase tracking-[0.15em] font-medium mb-1"
                style={{ color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}
              >
                {kpi.label}
              </p>
              <p
                className="text-2xl font-bold tracking-tight"
                style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}
              >
                {kpi.value}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Chart — 2/3 width */}
        <motion.div
          variants={fadeUp}
          className="xl:col-span-2 rounded-xl border p-6"
          style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}
              >
                Revenue & Orders
              </h3>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--admin-text-dim)" }}>
                Last 6 months
              </p>
            </div>
            <div className="flex items-center gap-4 text-[11px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--admin-accent)" }} />
                <span style={{ color: "var(--admin-text-dim)" }}>Revenue</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--admin-emerald)" }} />
                <span style={{ color: "var(--admin-text-dim)" }}>Orders</span>
              </span>
            </div>
          </div>
          <div className="h-[280px] w-full min-w-0">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart data={revenueByMonth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B8963E" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#B8963E" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34D399" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(184,150,62,0.06)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#4A473F", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}
                    axisLine={{ stroke: "rgba(184,150,62,0.08)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#4A473F", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#B8963E"
                    strokeWidth={2}
                    fill="url(#goldGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#B8963E", stroke: "#0B0F0D", strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#34D399"
                    strokeWidth={2}
                    fill="url(#emeraldGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#34D399", stroke: "#0B0F0D", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Category Donut — 1/3 width */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl border p-6"
          style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
        >
          <h3
            className="text-sm font-bold mb-1"
            style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}
          >
            Category Mix
          </h3>
          <p className="text-[11px] mb-4" style={{ color: "var(--admin-text-dim)" }}>
            Product distribution
          </p>
          <div className="h-[200px] w-full min-w-0">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                    stroke="none"
                  >
                    {categories.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--admin-surface-elevated)",
                      border: "1px solid var(--admin-border-active)",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "var(--admin-text)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categories.map((cat: any, i: number) => (
              <div key={cat.name} className="flex items-center gap-2 text-[11px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span style={{ color: "var(--admin-text-muted)" }}>{cat.name}</span>
                <span className="ml-auto font-semibold" style={{ color: "var(--admin-text)" }}>{cat.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Row: Action Center + Recent Orders ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Action Center */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl border p-6"
          style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
        >
          <h3
            className="text-sm font-bold mb-5"
            style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}
          >
            ⚡ Needs Attention
          </h3>
          <div className="space-y-3">
            {actionItems.pendingOrders > 0 && (
              <div
                className="flex items-center gap-3 p-3 rounded-lg border"
                style={{ background: "var(--admin-amber-muted)", borderColor: "rgba(251,191,36,0.15)" }}
              >
                <Clock size={16} style={{ color: "var(--admin-amber)" }} />
                <span className="text-[13px] font-medium" style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}>
                  <strong>{actionItems.pendingOrders}</strong> orders awaiting fulfillment
                </span>
              </div>
            )}
            {actionItems.lowStock > 0 && (
              <div
                className="flex items-center gap-3 p-3 rounded-lg border"
                style={{ background: "var(--admin-red-muted)", borderColor: "rgba(248,113,113,0.15)" }}
              >
                <AlertTriangle size={16} style={{ color: "var(--admin-red)" }} />
                <span className="text-[13px] font-medium" style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}>
                  <strong>{actionItems.lowStock}</strong> products critically low on stock
                </span>
              </div>
            )}
            {actionItems.outOfStock > 0 && (
              <div
                className="flex items-center gap-3 p-3 rounded-lg border"
                style={{ background: "var(--admin-red-muted)", borderColor: "rgba(248,113,113,0.15)" }}
              >
                <PackageX size={16} style={{ color: "var(--admin-red)" }} />
                <span className="text-[13px] font-medium" style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}>
                  <strong>{actionItems.outOfStock}</strong> products completely out of stock
                </span>
              </div>
            )}
            {actionItems.pendingOrders === 0 && actionItems.lowStock === 0 && actionItems.outOfStock === 0 && (
              <div className="text-center py-6">
                <p className="text-[13px]" style={{ color: "var(--admin-emerald)", fontFamily: "'DM Sans', sans-serif" }}>
                  ✓ Everything is running smoothly
                </p>
              </div>
            )}

            {/* Low Stock List */}
            {actionItems.lowStockProducts.length > 0 && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-3" style={{ color: "var(--admin-text-dim)" }}>
                  Low Stock Items
                </p>
                {actionItems.lowStockProducts.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Package size={13} style={{ color: "var(--admin-text-dim)" }} />
                      <span className="text-[12px] font-medium" style={{ color: "var(--admin-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>
                        {p.name}
                      </span>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        background: p.inventory_count === 0 ? "var(--admin-red-muted)" : "var(--admin-amber-muted)",
                        color: p.inventory_count === 0 ? "var(--admin-red)" : "var(--admin-amber)",
                      }}
                    >
                      {p.inventory_count} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl border p-6"
          style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
        >
          <h3
            className="text-sm font-bold mb-5"
            style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}
          >
            Recent Orders
          </h3>
          {recentOrders.length === 0 ? (
            <p className="text-center py-8 text-[13px]" style={{ color: "var(--admin-text-dim)" }}>
              No orders yet
            </p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg transition-colors duration-150"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-surface-elevated)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div>
                    <p className="text-[12px] font-semibold" style={{ color: "var(--admin-text)" }}>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-dim)" }}>
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-semibold" style={{ color: "var(--admin-text)" }}>
                      ₹{order.total_amount.toLocaleString("en-IN")}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold"
                      style={{
                        background:
                          order.status === "paid"
                            ? "var(--admin-emerald-muted)"
                            : order.status === "shipped"
                            ? "var(--admin-blue-muted)"
                            : "var(--admin-amber-muted)",
                        color:
                          order.status === "paid"
                            ? "var(--admin-emerald)"
                            : order.status === "shipped"
                            ? "var(--admin-blue)"
                            : "var(--admin-amber)",
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
