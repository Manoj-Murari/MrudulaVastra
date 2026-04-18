"use client";

import { useState } from "react";
import { Search, Users, Crown, Phone, MapPin, Mail } from "lucide-react";

export default function CustomerCRM({ initialCustomers }: { initialCustomers: any[] }) {
  const [search, setSearch] = useState("");

  const filtered = initialCustomers.filter(
    (c) =>
      (c.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").includes(search)
  );

  // Sort by LTV descending
  const sorted = [...filtered].sort((a, b) => b.ltv - a.ltv);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: "var(--admin-text)" }}>
          Customer CRM
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}>
          {initialCustomers.length} registered customers
        </p>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg border"
        style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}
      >
        <Search size={14} style={{ color: "var(--admin-text-dim)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          className="flex-1 bg-transparent outline-none text-[13px]"
          style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}
        />
      </div>

      {/* Customer Cards */}
      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <Users size={40} strokeWidth={1} style={{ color: "var(--admin-text-dim)", margin: "0 auto", marginBottom: 12 }} />
          <p className="text-[13px]" style={{ color: "var(--admin-text-dim)" }}>
            {search ? "No customers match your search" : "No registered customers yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((customer) => (
            <div
              key={customer.id}
              className="rounded-xl border p-5 transition-colors duration-150 group"
              style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--admin-border-active)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--admin-border)")}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
                    style={{ background: "var(--admin-accent-glow)", color: "var(--admin-accent)" }}
                  >
                    {(customer.full_name || "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold truncate" style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}>
                      {customer.full_name || "Anonymous"}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--admin-text-dim)" }}>
                      {customer.orderCount} orders
                    </p>
                  </div>
                </div>
                {customer.ltv > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "var(--admin-accent-glow)" }}>
                    <Crown size={10} style={{ color: "var(--admin-accent)" }} />
                    <span className="text-[10px] font-bold" style={{ color: "var(--admin-accent)", fontFamily: "'DM Sans', sans-serif" }}>
                      ₹{customer.ltv.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                {customer.phone && (
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--admin-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>
                    <Phone size={12} style={{ color: "var(--admin-text-dim)" }} />
                    {customer.phone}
                  </div>
                )}
                {customer.full_address && (
                  <div className="flex items-start gap-2 text-[12px]" style={{ color: "var(--admin-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>
                    <MapPin size={12} className="shrink-0 mt-0.5" style={{ color: "var(--admin-text-dim)" }} />
                    <span className="line-clamp-2">{customer.full_address}{customer.pincode ? `, ${customer.pincode}` : ""}</span>
                  </div>
                )}
              </div>

              {/* LTV Bar */}
              {customer.ltv > 0 && (
                <div className="mt-4 pt-3 border-t" style={{ borderColor: "var(--admin-border)" }}>
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}>
                    <span>Lifetime Value</span>
                    <span style={{ color: "var(--admin-accent)" }}>₹{customer.ltv.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--admin-surface-elevated)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (customer.ltv / Math.max(...sorted.map((c: any) => c.ltv || 1))) * 100)}%`,
                        background: "linear-gradient(90deg, var(--admin-accent), var(--admin-emerald))",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
