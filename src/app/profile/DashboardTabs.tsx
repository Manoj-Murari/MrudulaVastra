"use client";

import { useState, useTransition } from "react";
import { Package, MapPin, ChevronRight, Plus, Star, Trash2, Edit3, Home, Briefcase, Users, Heart, MoreHorizontal } from "lucide-react";
import { updateProfile } from "@/actions/profile";
import { addAddress, updateAddress, deleteAddress, setDefaultAddress, type Address } from "@/actions/addresses";

/* ── Constants ──────────────────────────────────────── */

const LABEL_OPTIONS = [
  { value: "Home", icon: Home },
  { value: "Office", icon: Briefcase },
  { value: "Parents", icon: Users },
  { value: "Partner", icon: Heart },
  { value: "Other", icon: MoreHorizontal },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

/* ── Component Types ─────────────────────────────────── */

interface UserProfile {
  full_name?: string | null;
  phone?: string | null;
  pincode?: string | null;
  city?: string | null;
  state?: string | null;
  full_address?: string | null;
}

interface OrderItemProduct {
  name?: string;
  image?: string;
  category?: string;
}

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  products?: OrderItemProduct;
}

interface UserOrder {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  order_items?: OrderItem[];
}

interface DashboardTabsProps {
  profile: UserProfile;
  orders: UserOrder[];
  userEmail: string;
  addresses?: Address[];
}

/* ── Address Form Component ──────────────────────────── */

function AddressForm({
  address,
  onCancel,
  onSaved,
}: {
  address?: Address | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setMessage("");
      const result = address
        ? await updateAddress(formData)
        : await addAddress(formData);

      if (result.error) {
        setMessage("Error: " + result.error);
      } else if (result.success) {
        setMessage(result.success);
        setTimeout(() => onSaved(), 800);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5 bg-cream/50 border border-gold/10 p-6">
      {address && <input type="hidden" name="addressId" value={address.id} />}

      <h4 className="font-playfair text-forest font-bold text-lg">
        {address ? "Edit Address" : "Add New Address"}
      </h4>

      {message && (
        <p className={`p-3 font-dm text-sm ${message.includes("Error") ? "bg-red-50 text-red-600" : "bg-emerald-50 text-forest"}`}>
          {message}
        </p>
      )}

      {/* Label selector */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-3">Address Label</label>
        <div className="flex flex-wrap gap-2">
          {LABEL_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <label key={opt.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="label"
                  value={opt.value}
                  defaultChecked={address ? address.label === opt.value : opt.value === "Home"}
                  className="peer sr-only"
                />
                <div className="flex items-center gap-1.5 px-3 py-2 border border-gold/20 text-text-muted text-xs font-dm uppercase tracking-wider peer-checked:bg-forest peer-checked:text-white peer-checked:border-forest transition-all">
                  <Icon size={12} />
                  {opt.value}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Full Name</label>
          <input type="text" name="fullName" defaultValue={address?.full_name || ""} required className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors" />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Phone</label>
          <input type="text" name="phone" defaultValue={address?.phone || ""} onChange={(e) => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 15)} required className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors" />
        </div>
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Full Delivery Address</label>
        <textarea name="fullAddress" defaultValue={address?.full_address || ""} required rows={2} className="w-full bg-transparent border border-gold/30 p-3 focus:outline-none focus:border-forest text-forest font-dm transition-colors resize-none" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">City</label>
          <input type="text" name="city" defaultValue={address?.city || ""} required className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors" />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">State</label>
          <select name="state" defaultValue={address?.state || ""} required className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors">
            <option value="" disabled>Select</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Pincode</label>
          <input type="text" name="pincode" defaultValue={address?.pincode || ""} onChange={(e) => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6)} required className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors" />
        </div>
      </div>

      {/* Default checkbox */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" name="isDefault" value="true" defaultChecked={address?.is_default || false} className="accent-forest w-4 h-4" />
        <span className="text-xs font-dm text-text-muted">Set as default address</span>
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={isPending} className="flex-1 py-3 bg-forest text-white uppercase tracking-[0.15em] text-sm font-bold transition-all disabled:opacity-70 hover:bg-forest/90">
          {isPending ? "Saving..." : address ? "Update Address" : "Save Address"}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-3 border border-gold/20 text-text-muted uppercase tracking-[0.15em] text-sm font-bold font-dm hover:bg-cream transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ── Address Card Component ──────────────────────────── */

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const LabelIcon = LABEL_OPTIONS.find(o => o.value === address.label)?.icon || Home;

  return (
    <div className={`relative border p-5 transition-all ${address.is_default ? "border-forest/30 bg-forest/[0.02]" : "border-gold/15 hover:border-gold/30"}`}>
      {/* Label badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LabelIcon size={14} className="text-forest" />
          <span className="text-xs font-dm font-bold uppercase tracking-wider text-forest">{address.label}</span>
          {address.is_default && (
            <span className="flex items-center gap-1 text-[9px] bg-forest text-white px-2 py-0.5 uppercase tracking-wider font-bold">
              <Star size={8} fill="currentColor" /> Default
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="p-1.5 hover:bg-forest/5 transition-colors rounded" title="Edit">
            <Edit3 size={13} className="text-text-muted" />
          </button>
          <button onClick={onDelete} className="p-1.5 hover:bg-red-50 transition-colors rounded" title="Delete">
            <Trash2 size={13} className="text-red-400" />
          </button>
        </div>
      </div>

      <p className="font-dm text-forest text-sm font-medium">{address.full_name}</p>
      <p className="font-dm text-text-muted text-xs mt-1 leading-relaxed">
        {address.full_address}, {address.city}, {address.state} — {address.pincode}
      </p>
      <p className="font-dm text-text-muted text-xs mt-1">{address.phone}</p>

      {!address.is_default && (
        <button onClick={onSetDefault} className="mt-3 text-[10px] text-forest/60 hover:text-forest font-dm uppercase tracking-widest underline underline-offset-4 transition-colors">
          Set as default
        </button>
      )}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────── */

export default function DashboardTabs({ profile, orders, userEmail, addresses: initialAddresses = [] }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "addresses">("orders");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Address state
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  async function refreshAddresses() {
    // Re-fetch from server
    const { getUserAddresses } = await import("@/actions/addresses");
    const fresh = await getUserAddresses();
    setAddresses(fresh);
    setShowForm(false);
    setEditingAddress(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this address?")) return;
    const result = await deleteAddress(id);
    if (result.success) refreshAddresses();
  }

  async function handleSetDefault(id: string) {
    const result = await setDefaultAddress(id);
    if (result.success) refreshAddresses();
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
          onClick={() => setActiveTab("addresses")}
          className={`flex-1 py-4 font-dm text-sm uppercase tracking-wider font-bold transition-colors ${
            activeTab === "addresses" ? "bg-forest text-white" : "text-forest hover:bg-forest/5"
          }`}
        >
          Saved Addresses
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6 sm:p-8">
        {/* ── ORDERS TAB ──────────────────────────── */}
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
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;

                  return (
                  <div
                    key={order.id}
                    className="flex flex-col bg-cream/30 border border-gold/10 hover:border-gold/30 transition-all overflow-hidden"
                  >
                    {/* Header: Clickable to expand */}
                    <div
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer gap-3"
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
                        <ChevronRight 
                          size={16} 
                          className={`text-text-muted hidden sm:block transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} 
                        />
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-4 border-t border-gold/10 bg-white/50">
                        {order.order_items && order.order_items.length > 0 ? (
                          <div className="space-y-4">
                            <h4 className="text-[10px] uppercase tracking-wider font-bold text-text-muted font-dm">
                              Order Items
                            </h4>
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex gap-4 p-3 bg-white border border-gold/5">
                                {item.products?.image && (
                                  <div className="w-16 h-20 bg-cream relative shrink-0">
                                    <img 
                                      src={item.products.image} 
                                      alt={item.products.name || "Product"} 
                                      className="absolute inset-0 w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex flex-col justify-center flex-1">
                                  <p className="font-dm text-forest text-sm font-medium">
                                    {item.products?.name || `Product #${item.product_id}`}
                                  </p>
                                  <div className="flex justify-between items-center mt-2 w-full pr-2">
                                    <p className="text-text-muted font-dm text-xs">
                                      Qty: {item.quantity} × ₹{item.unit_price.toLocaleString("en-IN")}
                                    </p>
                                    <p className="font-dm text-forest text-sm font-semibold">
                                      ₹{(item.quantity * item.unit_price).toLocaleString("en-IN")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-text-muted text-sm font-dm">Order details are not available.</p>
                        )}
                        <div className="mt-4 pt-4 border-t border-gold/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="text-left font-dm">
                            <p className="text-[11px] uppercase tracking-wider font-bold text-text-muted mb-1">Payment Details</p>
                            <p className="text-xs text-forest">Method: Secure Online Payment</p>
                            {order.razorpay_payment_id && <p className="text-[10px] text-text-muted mt-0.5 break-all">Txn ID: {order.razorpay_payment_id}</p>}
                            {order.razorpay_order_id && <p className="text-[10px] text-text-muted mt-0.5 break-all">Ref: {order.razorpay_order_id}</p>}
                          </div>
                          <p className="text-[11px] text-text-muted font-dm">
                            Need help? Contact <a href="mailto:orders@mrudulavastra.in" className="text-forest underline font-semibold">Support</a>.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )})}
              </div>
            )}
          </div>
        )}

        {/* ── ADDRESSES TAB ────────────────────────── */}
        {activeTab === "addresses" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="uppercase text-gold font-dm font-medium tracking-[0.3em] text-[10px]">
                Saved Addresses ({addresses.length}/5)
              </p>
              <MapPin size={18} className="text-gold" />
            </div>

            {/* Address Cards */}
            {addresses.length > 0 && !showForm && !editingAddress && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    onEdit={() => { setEditingAddress(addr); setShowForm(false); }}
                    onDelete={() => handleDelete(addr.id)}
                    onSetDefault={() => handleSetDefault(addr.id)}
                  />
                ))}
              </div>
            )}

            {/* Add / Edit Form */}
            {(showForm || editingAddress) ? (
              <AddressForm
                address={editingAddress}
                onCancel={() => { setShowForm(false); setEditingAddress(null); }}
                onSaved={refreshAddresses}
              />
            ) : (
              <div>
                {addresses.length === 0 && (
                  <div className="text-center py-8 mb-6">
                    <MapPin size={40} strokeWidth={1} className="text-gold/30 mx-auto mb-4" />
                    <p className="text-text-muted font-dm text-sm">No saved addresses yet.</p>
                    <p className="text-text-muted/60 font-dm text-xs mt-1">Add an address for faster checkout.</p>
                  </div>
                )}

                {addresses.length < 5 && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full py-4 border-2 border-dashed border-gold/20 text-forest hover:border-forest/30 hover:bg-forest/[0.02] transition-all flex items-center justify-center gap-2 font-dm text-sm uppercase tracking-wider font-bold"
                  >
                    <Plus size={16} />
                    Add New Address
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
