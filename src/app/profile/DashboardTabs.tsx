"use client";

import { useState } from "react";
import { Package, User, LogOut, ChevronRight } from "lucide-react";
import { updateProfile } from "@/actions/profile";

export default function DashboardTabs({ profile, orders, userEmail }: { profile: any; orders: any[]; userEmail: string }) {
  const [activeTab, setActiveTab] = useState<"orders" | "shipping">("orders");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");

  async function handleProfileUpdate(formData: FormData) {
    setIsUpdating(true);
    setMessage("");
    const result = await updateProfile(formData);
    if (result.error) setMessage("Error: " + result.error);
    if (result.success) setMessage(result.success);
    setIsUpdating(false);
  }

  return (
    <div className="bg-white border border-gold/10 overflow-hidden shadow-sm">
      {/* Tab Headers */}
      <div className="flex border-b border-gold/20">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 py-4 font-dm text-sm uppercase tracking-wider font-bold transition-colors ${
            activeTab === "orders" ? "bg-forest text-white" : "text-forest hover:bg-forest/5"
          }`}
        >
          My Orders
        </button>
        <button
          onClick={() => setActiveTab("shipping")}
          className={`flex-1 py-4 font-dm text-sm uppercase tracking-wider font-bold transition-colors ${
            activeTab === "shipping" ? "bg-forest text-white" : "text-forest hover:bg-forest/5"
          }`}
        >
          Shipping Details
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTab === "orders" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="uppercase text-gold font-dm font-medium tracking-[0.3em] text-[10px]">
                Order History
              </p>
              <Package size={18} className="text-gold" />
            </div>

            {!orders || orders.length === 0 ? (
              <div className="text-center py-10">
                <Package size={40} strokeWidth={1} className="text-gold/30 mx-auto mb-4" />
                <p className="text-text-muted font-dm text-sm">No orders yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-cream/30 border border-gold/10 hover:border-gold/30 transition-colors gap-3"
                  >
                    <div>
                      <p className="font-dm text-forest font-medium text-sm">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-text-muted font-dm text-xs mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                      <div className="text-left sm:text-right">
                        <p className="font-dm text-forest font-semibold text-sm">
                          ₹{order.total_amount.toLocaleString("en-IN")}
                        </p>
                        <span
                          className={`inline-block text-[10px] uppercase tracking-wider font-bold font-dm mt-1 px-2 py-0.5 ${
                            order.status === "paid"
                              ? "bg-emerald-50 text-emerald-700"
                              : order.status === "pending"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-text-muted hidden sm:block" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "shipping" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="uppercase text-gold font-dm font-medium tracking-[0.3em] text-[10px]">
                Profile & Shipping
              </p>
              <User size={18} className="text-gold" />
            </div>

            {message && (
              <p className={`p-3 mb-6 font-dm text-sm ${message.includes("Error") ? "bg-red-50 text-red-600" : "bg-emerald-50 text-forest"}`}>
                {message}
              </p>
            )}

            <form action={handleProfileUpdate} className="space-y-5">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Email Address</label>
                <input type="email" disabled value={userEmail} className="w-full bg-cream border-b border-gold/10 py-2 focus:outline-none text-text-muted cursor-not-allowed font-dm" />
                <p className="text-[10px] text-text-muted/60 mt-1">Email cannot be changed.</p>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Full Name</label>
                <input type="text" name="fullName" defaultValue={profile?.full_name || ""} required className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">WhatsApp Number</label>
                  <input type="text" name="phone" defaultValue={profile?.phone || ""} required className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Pincode</label>
                  <input type="text" name="pincode" defaultValue={profile?.pincode || ""} required className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Full Delivery Address</label>
                <textarea name="fullAddress" defaultValue={profile?.full_address || ""} required rows={3} className="w-full bg-transparent border border-gold/30 p-3 focus:outline-none focus:border-forest text-forest font-dm transition-colors resize-none" />
              </div>

              <button type="submit" disabled={isUpdating} className="w-full py-4 mt-2 bg-forest text-white uppercase tracking-[0.15em] text-sm font-bold transition-all disabled:opacity-70 hover:bg-forest/90">
                {isUpdating ? "Saving..." : "Save Details"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
