"use client";

import { useState, useEffect } from "react";
import { getShippingSettings } from "@/actions/shipping";

export default function AnnouncementBar() {
  const [shippingSettings, setShippingSettings] = useState({ minFreeShippingOrderValue: 999 });

  useEffect(() => {
    async function fetchSettings() {
      const settings = await getShippingSettings();
      if (settings) {
        setShippingSettings(settings);
      }
    }
    fetchSettings();
  }, []);

  return (
    <div className="bg-forest text-center py-2 text-xs tracking-[0.15em] text-amber-200/80 uppercase font-dm">
      ✦ &nbsp; Free Shipping on Orders Above ₹{shippingSettings.minFreeShippingOrderValue.toLocaleString("en-IN")} &nbsp; ✦ &nbsp; Authentic Handloom Fabrics &nbsp; ✦
    </div>
  );
}
