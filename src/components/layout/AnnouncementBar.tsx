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

  // Use explicit non-breaking spaces for a wide, premium margin
  const space = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";
  
  const m1 = `✦ Free Shipping on Orders Above ₹${shippingSettings.minFreeShippingOrderValue.toLocaleString("en-IN")}`;
  const m2 = `✦ Authentic Handloom Fabrics`;
  const m3 = `✦ Discover Exclusive Heritage Sarees`;

  // Concatenate with distinct non-breaking space separation
  const message = `${m1}${space}${m2}${space}${m3}${space}`;
  
  // Multiple repetitions to build the marquee loop
  const repeatedText = `${message}${message}${message}`;

  return (
    <div className="bg-forest h-8 sm:h-9 flex items-center overflow-hidden font-dm select-none border-b border-gold/10 relative">
      <div
        className="flex whitespace-nowrap text-[11px] sm:text-[13px] tracking-[0.1em] sm:tracking-[0.15em] text-amber-200/80 uppercase font-medium select-none"
        style={{
          animation: "scroll-marquee 55s linear infinite",
          willChange: "transform",
        }}
      >
        <span>{repeatedText}</span>
        <span>{repeatedText}</span>
      </div>
    </div>
  );
}
