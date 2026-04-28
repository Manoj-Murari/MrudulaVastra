"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Ticket, 
  X, 
  Search, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  CheckCircle2
} from "lucide-react";
import { upsertCoupon, deleteCoupon, toggleCouponStatus, type Coupon } from "@/actions/coupons";

export default function CouponManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState<Coupon>({
    code: "",
    type: "percentage",
    value: 10,
    min_purchase: 0,
    is_active: true
  });

  const filtered = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = async (id: string, current: boolean) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c));
    const res = await toggleCouponStatus(id, current);
    if (res.error) {
      alert("Failed to update status: " + res.error);
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: current } : c));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    const original = [...coupons];
    setCoupons(prev => prev.filter(c => c.id !== id));
    const res = await deleteCoupon(id);
    if (res.error) {
      alert("Failed to delete: " + res.error);
      setCoupons(original);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    const res = await upsertCoupon(formData);
    if (res.success && res.data) {
      setCoupons(prev => [res.data, ...prev.filter(c => c.id !== res.data.id)]);
      setIsAdding(false);
      setFormData({ code: "", type: "percentage", value: 10, min_purchase: 0, is_active: true });
    } else {
      setError(res.error || "Failed to save coupon. Make sure you created the 'coupons' table in Supabase.");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: "var(--admin-text)" }}>
            Coupon Management
          </h1>
          <p className="text-[13px] mt-1" style={{ fontFamily: "'DM Sans', sans-serif", color: "var(--admin-text-dim)" }}>
            Create and manage discount codes for your customers.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] uppercase tracking-wider font-bold transition-colors"
          style={{ background: "var(--admin-accent)", color: "#000", fontFamily: "'DM Sans', sans-serif" }}
        >
          <Plus size={14} /> Create Coupon
        </button>
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
          placeholder="Search by coupon code…"
          className="flex-1 bg-transparent outline-none text-[13px]"
          style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}
        />
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[13px]" style={{ color: "var(--admin-text-dim)" }}>
            No coupons found.
          </div>
        ) : (
          filtered.map((coupon) => (
            <div
              key={coupon.id || coupon.code}
              className="rounded-xl border p-4 transition-all"
              style={{
                background: "var(--admin-surface)",
                borderColor: "var(--admin-border)",
                fontFamily: "'DM Sans', sans-serif",
                opacity: coupon.is_active ? 1 : 0.6,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--admin-surface-elevated)", color: "var(--admin-accent)" }}>
                    <Ticket size={16} />
                  </div>
                  <span className="font-bold tracking-wider uppercase text-[15px]" style={{ color: "var(--admin-text)" }}>
                    {coupon.code}
                  </span>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => coupon.id && handleToggle(coupon.id, coupon.is_active)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors"
                    style={{
                      background: coupon.is_active ? "var(--admin-emerald-muted)" : "var(--admin-surface-elevated)",
                      color: coupon.is_active ? "var(--admin-emerald)" : "var(--admin-text-dim)",
                    }}
                  >
                    {coupon.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {coupon.is_active ? "Active" : "Disabled"}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--admin-border)" }}>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-[0.1em] mb-1" style={{ color: "var(--admin-text-dim)" }}>Discount</p>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--admin-text)" }}>
                    {coupon.type === "percentage" ? `${coupon.value}% OFF` : `₹${coupon.value.toLocaleString()} OFF`}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-[0.1em] mb-1" style={{ color: "var(--admin-text-dim)" }}>Min. Purchase</p>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--admin-text-muted)" }}>
                    ₹{coupon.min_purchase.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => coupon.id && handleDelete(coupon.id)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "var(--admin-red)" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border overflow-x-auto admin-scroll" style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}>
        <div className="min-w-[650px] w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-[10px] uppercase tracking-[0.2em] font-bold" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Min. Purchase</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[13px]" style={{ color: "var(--admin-text-dim)" }}>
                    No coupons found.
                  </td>
                </tr>
              ) : (
                filtered.map((coupon) => (
                  <tr key={coupon.id || coupon.code} className="border-b transition-colors duration-150" style={{ borderColor: "var(--admin-border)" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-surface-elevated)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: "var(--admin-surface-elevated)", color: "var(--admin-accent)" }}>
                          <Ticket size={16} />
                        </div>
                        <span className="font-bold tracking-wider uppercase" style={{ color: "var(--admin-text)" }}>{coupon.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4" style={{ color: "var(--admin-text-muted)" }}>
                      {coupon.type === "percentage" ? `${coupon.value}% OFF` : `₹${coupon.value.toLocaleString()} OFF`}
                    </td>
                    <td className="px-6 py-4" style={{ color: "var(--admin-text-muted)" }}>
                      ₹{coupon.min_purchase.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => coupon.id && handleToggle(coupon.id, coupon.is_active)}
                          className="flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors"
                          style={{
                            background: coupon.is_active ? "var(--admin-emerald-muted)" : "var(--admin-surface-elevated)",
                            color: coupon.is_active ? "var(--admin-emerald)" : "var(--admin-text-dim)",
                          }}
                        >
                          {coupon.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          {coupon.is_active ? "Active" : "Disabled"}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => coupon.id && handleDelete(coupon.id)}
                        className="p-2 transition-colors rounded-lg"
                        style={{ color: "var(--admin-text-dim)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--admin-red)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--admin-text-dim)")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="fixed inset-0 z-[200]"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[201] p-8 rounded-2xl border shadow-2xl"
              style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border-active)", fontFamily: "'DM Sans', sans-serif" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "var(--admin-text)" }}>Create Coupon</h2>
                <button onClick={() => setIsAdding(false)} style={{ color: "var(--admin-text-dim)" }}><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Coupon Code</label>
                  <input
                    required
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="E.G. FESTIVE20"
                    className="w-full bg-transparent border rounded-lg px-4 py-3 text-[13px] outline-none"
                    style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Type</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as any})}
                      className="w-full bg-transparent border rounded-lg px-4 py-3 text-[13px] outline-none appearance-none"
                      style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
                    >
                      <option value="percentage" style={{ background: "var(--admin-surface)" }}>Percentage (%)</option>
                      <option value="fixed" style={{ background: "var(--admin-surface)" }}>Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Value</label>
                    <input
                      required
                      type="number"
                      value={formData.value}
                      onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                      className="w-full bg-transparent border rounded-lg px-4 py-3 text-[13px] outline-none"
                      style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Min. Purchase Amount (₹)</label>
                  <input
                    required
                    type="number"
                    value={formData.min_purchase}
                    onChange={e => setFormData({...formData, min_purchase: Number(e.target.value)})}
                    className="w-full bg-transparent border rounded-lg px-4 py-3 text-[13px] outline-none"
                    style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
                  />
                </div>

                {error && (
                  <div className="p-3 rounded border flex gap-2 text-[12px]" style={{ background: "var(--admin-red-muted)", borderColor: "rgba(248,113,113,0.15)", color: "var(--admin-red)" }}>
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 text-black font-bold uppercase tracking-widest text-[12px] rounded-lg transition-opacity active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{ background: "var(--admin-accent)" }}
                >
                  {isSaving ? "Saving..." : <><CheckCircle2 size={16} /> Save Coupon</>}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
