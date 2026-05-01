"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

  const message = `✦ Free Shipping on Orders Above ₹${shippingSettings.minFreeShippingOrderValue.toLocaleString("en-IN")} ✦ Authentic Handloom Fabrics ✦ Discover Exclusive Heritage Sarees ✦ `;
  // Multiple repetitions of the string ensures continuous, unbroken scrolling
  const repeatedText = `${message} ${message} ${message} ${message} `;

  return (
    <div className="bg-forest h-8 sm:h-9 flex items-center overflow-hidden font-dm select-none border-b border-gold/10 relative">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 25
        }}
        className="flex whitespace-nowrap text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.15em] text-amber-200/80 uppercase font-medium select-none pl-4"
      >
        <span className="pr-4">{repeatedText}</span>
        <span className="pr-4">{repeatedText}</span>
      </motion.div>
    </div>
  );
}
