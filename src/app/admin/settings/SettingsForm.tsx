"use client";

import { useState } from "react";
import { updateShippingSettings } from "@/actions/shipping";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function SettingsForm({
  initialSettings
}: {
  initialSettings: { shippingCharge: number; minFreeShippingOrderValue: number };
}) {
  const [shippingCharge, setShippingCharge] = useState<string>(String(initialSettings.shippingCharge));
  const [minFreeShippingOrderValue, setMinFreeShippingOrderValue] = useState<string>(String(initialSettings.minFreeShippingOrderValue));
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(null);
    setError(null);

    const res = await updateShippingSettings({
      shippingCharge: Number(shippingCharge || 0),
      minFreeShippingOrderValue: Number(minFreeShippingOrderValue || 0),
    });

    if (res.success) {
      setSuccess("Shipping settings updated successfully!");
    } else {
      setError("Failed to update shipping settings. Please try again.");
    }
    setIsSaving(false);
  };

  const cleanNumericInput = (val: string) => {
    // Allows digits only. Removes any leading zeros except if the value is just "0"
    const cleaned = val.replace(/\D/g, "");
    return cleaned === "" ? "" : cleaned.replace(/^0+(?=\d)/, "");
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 rounded-xl border p-6" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)", fontFamily: "'DM Sans', sans-serif" }}>
      {success && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-sm">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg border border-red-500/30 bg-red-500/5 text-red-400 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>
            Standard Shipping Charge (₹)
          </label>
          <input
            required
            type="text"
            inputMode="numeric"
            value={shippingCharge}
            onChange={(e) => setShippingCharge(cleanNumericInput(e.target.value))}
            className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]"
            style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)" }}
          />
          <p className="text-[11px] mt-1.5 opacity-70" style={{ color: "var(--admin-text-muted)" }}>
            The base delivery fee added to orders.
          </p>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>
            Min Order Value for Free Shipping (₹)
          </label>
          <input
            required
            type="text"
            inputMode="numeric"
            value={minFreeShippingOrderValue}
            onChange={(e) => setMinFreeShippingOrderValue(cleanNumericInput(e.target.value))}
            className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]"
            style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)" }}
          />
          <p className="text-[11px] mt-1.5 opacity-70" style={{ color: "var(--admin-text-muted)" }}>
            Free shipping applies if the order total matches or exceeds this threshold.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 rounded-lg text-[13px] uppercase tracking-wider font-bold transition-all disabled:opacity-50"
          style={{ background: "var(--admin-accent)", color: "#000" }}
        >
          {isSaving ? "Saving Settings..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
