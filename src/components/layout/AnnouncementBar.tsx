"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getShippingSettings } from "@/actions/shipping";

export default function AnnouncementBar() {
  const [shippingSettings, setShippingSettings] = useState({ minFreeShippingOrderValue: 999 });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    async function fetchSettings() {
      const settings = await getShippingSettings();
      if (settings) {
        setShippingSettings(settings);
      }
    }
    fetchSettings();
  }, []);

  const announcements = [
    `✦ Free Shipping on Orders Above ₹${shippingSettings.minFreeShippingOrderValue.toLocaleString("en-IN")} ✦`,
    "✦ Authentic Handloom Fabrics ✦",
    "✦ Discover Exclusive Heritage Sarees ✦"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [announcements.length]);

  return (
    <div className="bg-forest text-center h-8 sm:h-9 flex items-center justify-center relative overflow-hidden font-dm select-none border-b border-gold/10">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -15, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.15em] text-amber-200/80 uppercase font-medium px-4 select-none"
        >
          {announcements[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
