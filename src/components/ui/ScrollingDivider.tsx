"use client";

import { motion } from "framer-motion";

export default function ScrollingDivider() {
  const words = [
    "MRUDULA VASTRA",
    "✦",
    "PREMIUM COLLECTION",
    "✦",
    "HANDPICKED SAREES",
    "✦",
    "KIDS WEAR",
    "✦",
    "ETHNIC",
    "✦"
  ];

  // We create a sufficiently long repeating string to ensure it covers ultra-wide screens.
  // 6 repetitions of the sequence ensures the content is wider than 4k monitors.
  const repeatedWords = [...words, ...words, ...words, ...words, ...words, ...words];

  return (
    <div className="bg-forest py-4 lg:py-5 overflow-hidden flex whitespace-nowrap border-y border-gold/20">
      <motion.div
        className="flex gap-8 lg:gap-12 items-center min-w-max pr-8 lg:pr-12"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 35, // Slow, buttery smooth luxury pace
        }}
      >
        {/* Render the massive array twice to ensure the -50% translation snaps back seamlessly */}
        {[...repeatedWords, ...repeatedWords].map((word, i) => (
          <span
            key={i}
            className="font-playfair text-[11px] lg:text-[13px] tracking-[0.25em] uppercase text-gold"
          >
            {word}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
