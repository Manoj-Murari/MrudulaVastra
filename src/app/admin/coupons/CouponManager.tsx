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
          <h1 className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Coupon Management
          </h1>
          <p className="text-[13px] mt-1 text-zinc-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Create and manage discount codes for your customers.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] uppercase tracking-wider font-bold transition-colors bg-[#B8963E] text-black"
        >
          <Plus size={14} /> Create Coupon
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50">
        <Search size={14} className="text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by coupon code…"
          className="flex-1 bg-transparent outline-none text-[13px] text-zinc-200"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 bg-zinc-900/80">
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Min. Purchase</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No coupons found.
                  </td>
                </tr>
              ) : (
                filtered.map((coupon) => (
                  <tr key={coupon.id || coupon.code} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-[#B8963E]">
                          <Ticket size={16} />
                        </div>
                        <span className="font-bold tracking-wider text-zinc-200 uppercase">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {coupon.type === "percentage" ? `${coupon.value}% OFF` : `₹${coupon.value.toLocaleString()} OFF`}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      ₹{coupon.min_purchase.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => coupon.id && handleToggle(coupon.id, coupon.is_active)}
                          className={`flex items-center gap-2 px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                            coupon.is_active 
                              ? "bg-emerald-500/10 text-emerald-500" 
                              : "bg-zinc-800 text-zinc-500"
                          }`}
                        >
                          {coupon.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          {coupon.is_active ? "Active" : "Disabled"}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => coupon.id && handleDelete(coupon.id)}
                        className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
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
              className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[201] p-8 rounded-2xl border border-zinc-800 bg-[#0c0c0c] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Create Coupon</h2>
                <button onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Coupon Code</label>
                  <input
                    required
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="E.G. FESTIVE20"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8963E] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as any})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8963E] appearance-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Value</label>
                    <input
                      required
                      type="number"
                      value={formData.value}
                      onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8963E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Min. Purchase Amount (₹)</label>
                  <input
                    required
                    type="number"
                    value={formData.min_purchase}
                    onChange={e => setFormData({...formData, min_purchase: Number(e.target.value)})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8963E]"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded bg-red-500/10 border border-red-500/20 flex gap-2 text-xs text-red-400">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-4 bg-[#B8963E] text-black font-bold uppercase tracking-widest text-[12px] rounded-lg hover:opacity-90 transition-opacity active:scale-[0.98] flex items-center justify-center gap-2"
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
