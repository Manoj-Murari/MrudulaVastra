"use client";

import { useState, useEffect } from "react";
import { getShippingSettings } from "@/actions/shipping";

// Cache the result in module scope so we only fetch once per session
let cachedThreshold: number | null = null;

export default function AnnouncementBar() {
  // Start with cached value or a real-world default — renders instantly, no flash
  const [threshold, setThreshold] = useState<number>(cachedThreshold ?? 999);

  useEffect(() => {
    if (cachedThreshold !== null) return; // already fetched this session
    getShippingSettings().then(settings => {
      if (settings?.minFreeShippingOrderValue) {
        cachedThreshold = settings.minFreeShippingOrderValue;
        setThreshold(settings.minFreeShippingOrderValue);
      }
    });
  }, []);

  return (
    <div className="bg-forest text-center py-2 text-xs tracking-[0.15em] text-amber-200/80 uppercase font-dm">
      {/* Short version on mobile, full on sm+ */}
      <span className="sm:hidden">✦ &nbsp; Free Shipping Above ₹{threshold.toLocaleString("en-IN")} &nbsp; ✦</span>
      <span className="hidden sm:inline">✦ &nbsp; Free Shipping on Orders Above ₹{threshold.toLocaleString("en-IN")} Across India &nbsp; ✦ &nbsp; Authentic Handloom Fabrics &nbsp; ✦</span>
    </div>
  );
}
