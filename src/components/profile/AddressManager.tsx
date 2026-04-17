"use client";

import { useState, useTransition } from "react";
import { MapPin, Plus, Pencil, Trash2, Star, X, Check } from "lucide-react";
import { addAddress, updateAddress, deleteAddress, setDefaultAddress } from "@/actions/address";

interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

interface AddressManagerProps {
  addresses: Address[];
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Puducherry", "Jammu and Kashmir", "Ladakh",
];

function AddressForm({
  address,
  onClose,
  mode,
}: {
  address?: Address;
  onClose: () => void;
  mode: "add" | "edit";
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      setError("");
      setSuccess("");
      const action = mode === "add" ? addAddress : updateAddress;
      const result = await action(formData);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(result.success || "Done!");
        setTimeout(onClose, 800);
      }
    });
  };

  return (
    <div className="bg-white border border-gold/15 p-6 lg:p-8 mt-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-playfair text-forest font-bold text-lg">
          {mode === "add" ? "Add New Address" : "Edit Address"}
        </h3>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-forest transition-colors p-1"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {address && <input type="hidden" name="id" value={address.id} />}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="addr-name" className="block text-forest font-dm font-medium text-sm mb-1.5">
              Full Name *
            </label>
            <input
              id="addr-name"
              name="full_name"
              type="text"
              defaultValue={address?.full_name || ""}
              required
              placeholder="Full name"
              className="w-full px-4 py-3 bg-cream border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/50"
            />
          </div>
          <div>
            <label htmlFor="addr-phone" className="block text-forest font-dm font-medium text-sm mb-1.5">
              Phone Number *
            </label>
            <input
              id="addr-phone"
              name="phone"
              type="tel"
              defaultValue={address?.phone || ""}
              required
              pattern="[0-9]{10}"
              maxLength={10}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="10-digit mobile number"
              className="w-full px-4 py-3 bg-cream border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="addr-line1" className="block text-forest font-dm font-medium text-sm mb-1.5">
            Address Line 1 *
          </label>
          <input
            id="addr-line1"
            name="address_line1"
            type="text"
            defaultValue={address?.address_line1 || ""}
            required
            placeholder="House/Flat No., Building, Street"
            className="w-full px-4 py-3 bg-cream border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/50"
          />
        </div>

        <div>
          <label htmlFor="addr-line2" className="block text-forest font-dm font-medium text-sm mb-1.5">
            Address Line 2
          </label>
          <input
            id="addr-line2"
            name="address_line2"
            type="text"
            defaultValue={address?.address_line2 || ""}
            placeholder="Landmark, Area (optional)"
            className="w-full px-4 py-3 bg-cream border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/50"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="addr-city" className="block text-forest font-dm font-medium text-sm mb-1.5">
              City *
            </label>
            <input
              id="addr-city"
              name="city"
              type="text"
              defaultValue={address?.city || ""}
              required
              placeholder="City"
              className="w-full px-4 py-3 bg-cream border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/50"
            />
          </div>
          <div>
            <label htmlFor="addr-state" className="block text-forest font-dm font-medium text-sm mb-1.5">
              State *
            </label>
            <select
              id="addr-state"
              name="state"
              defaultValue={address?.state || ""}
              required
              className="w-full px-4 py-3 bg-cream border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest"
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="addr-pincode" className="block text-forest font-dm font-medium text-sm mb-1.5">
              Pincode *
            </label>
            <input
              id="addr-pincode"
              name="pincode"
              type="text"
              defaultValue={address?.pincode || ""}
              required
              placeholder="6-digit PIN"
              pattern="[0-9]{6}"
              maxLength={6}
              className="w-full px-4 py-3 bg-cream border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            id="addr-default"
            name="is_default"
            type="checkbox"
            defaultChecked={address?.is_default || false}
            value="true"
            className="w-4 h-4 accent-forest"
          />
          <label htmlFor="addr-default" className="text-forest font-dm text-sm cursor-pointer">
            Set as default address
          </label>
        </div>

        {error && (
          <p className="text-red-600 font-dm text-sm bg-red-50 p-3 border border-red-100">
            {error}
          </p>
        )}
        {success && (
          <p className="text-emerald-700 font-dm text-sm bg-emerald-50 p-3 border border-emerald-100 flex items-center gap-2">
            <Check size={14} /> {success}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 bg-forest text-white uppercase tracking-[0.15em] text-sm font-bold font-dm hover:bg-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            "Saving..."
          ) : mode === "add" ? (
            <>
              <Plus size={16} /> Save Address
            </>
          ) : (
            <>
              <Check size={16} /> Update Address
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function AddressManager({ addresses }: AddressManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    const formData = new FormData();
    formData.set("id", id);

    startTransition(async () => {
      await deleteAddress(formData);
    });
  };

  const handleSetDefault = (id: string) => {
    const formData = new FormData();
    formData.set("id", id);

    startTransition(async () => {
      await setDefaultAddress(formData);
    });
  };

  return (
    <div className="bg-white border border-gold/10 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <p className="uppercase text-gold font-dm font-medium tracking-[0.3em] text-[10px]">
            Saved Addresses
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAddress(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-1.5 text-forest font-dm font-semibold text-xs uppercase tracking-wider hover:text-gold transition-colors"
        >
          <Plus size={14} />
          Add New
        </button>
      </div>

      {/* Address Cards */}
      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-10">
          <MapPin size={40} strokeWidth={1} className="text-gold/30 mx-auto mb-4" />
          <p className="text-text-muted font-dm text-sm mb-1">No saved addresses yet.</p>
          <p className="text-text-muted/60 font-dm text-xs">
            Add an address for faster checkout.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 mt-4 text-forest font-dm font-semibold text-sm underline underline-offset-4 hover:text-gold transition-colors"
          >
            <Plus size={14} /> Add Address
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`relative p-5 border transition-colors ${
                addr.is_default
                  ? "bg-forest/[0.03] border-forest/15"
                  : "bg-cream/50 border-gold/8 hover:border-gold/20"
              }`}
            >
              {/* Default badge */}
              {addr.is_default && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold font-dm px-2 py-0.5 bg-forest text-white">
                  <Star size={9} fill="currentColor" /> Default
                </span>
              )}

              <p className="font-dm text-forest font-semibold text-sm">{addr.full_name}</p>
              <p className="text-text-muted font-dm text-sm mt-1 leading-relaxed">
                {addr.address_line1}
                {addr.address_line2 && <>, {addr.address_line2}</>}
                <br />
                {addr.city}, {addr.state} — {addr.pincode}
              </p>
              <p className="text-text-muted/70 font-dm text-xs mt-1">
                Phone: {addr.phone}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gold/8">
                <button
                  onClick={() => {
                    setEditingAddress(addr);
                    setShowForm(true);
                  }}
                  className="flex items-center gap-1 text-forest/70 font-dm text-xs hover:text-forest transition-colors"
                >
                  <Pencil size={12} /> Edit
                </button>
                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    disabled={isPending}
                    className="flex items-center gap-1 text-forest/70 font-dm text-xs hover:text-gold transition-colors disabled:opacity-50"
                  >
                    <Star size={12} /> Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(addr.id)}
                  disabled={isPending}
                  className="flex items-center gap-1 text-red-400 font-dm text-xs hover:text-red-600 transition-colors ml-auto disabled:opacity-50"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <AddressForm
          address={editingAddress || undefined}
          mode={editingAddress ? "edit" : "add"}
          onClose={() => {
            setShowForm(false);
            setEditingAddress(null);
          }}
        />
      )}
    </div>
  );
}
