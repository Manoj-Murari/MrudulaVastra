"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";

/* ── Cinematic easing — slow entrance, snappy settle ── */
const luxuryEase = [0.16, 1, 0.3, 1] as const;

const textReveal = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: 0.3 + i * 0.15,
      duration: 1.2,
      ease: luxuryEase,
    },
  }),
};

const imageReveal = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { delay: 0.2, duration: 1.4, ease: luxuryEase },
  },
};

const lineExpand = {
  hidden: { scaleX: 0 },
  visible: (i: number) => ({
    scaleX: 1,
    transition: { delay: 1.0 + i * 0.1, duration: 0.8, ease: luxuryEase },
  }),
};

const pillars = [
  ["Premium", "Quality"],
  ["Handpicked", "Designs"],
  ["100%", "Authentic"],
] as const;

export default function HeroSection() {
  return (
    <section className="bg-cream font-dm lg:min-h-[85vh] flex flex-col lg:flex-row items-center overflow-hidden w-full max-w-[100vw]">
      {/* ━━ Left: Editorial Text Panel ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-14 lg:pl-24 lg:pr-16 py-16 lg:py-0 order-2 lg:order-1">
        <div className="max-w-lg">
          {/* Eyebrow */}
          <motion.p
            custom={0}
            variants={textReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="uppercase font-semibold mb-8 flex items-center gap-4 text-forest/50"
            style={{ fontSize: "9px", letterSpacing: "0.4em" }}
          >
            <motion.span
              className="inline-block w-12 h-px bg-gold/50"
              custom={0}
              variants={lineExpand}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{ transformOrigin: "left" }}
            />
            The Heritage Collection
          </motion.p>

          {/* Headline — High contrast, refined scale */}
          <motion.h1
            custom={1}
            variants={textReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-playfair text-forest font-semibold lg:font-medium mb-3 tracking-wide"
            style={{ lineHeight: 1.1, fontSize: "clamp(36px, 4.5vw, 56px)" }}
          >
            Timeless Elegance
          </motion.h1>

          <motion.p
            custom={2}
            variants={textReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-playfair text-gold font-semibold lg:font-medium italic mb-8"
            style={{ lineHeight: 1.1, fontSize: "clamp(30px, 3.5vw, 46px)" }}
          >
            Woven with Love.
          </motion.p>

          {/* Body copy */}
          <motion.p
            custom={3}
            variants={textReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-10 max-w-sm text-text-muted font-medium"
            style={{ lineHeight: 1.8, fontSize: "14px" }}
          >
            Discover handpicked sarees, elegant dress materials, and exquisite kids wear. A curated celebration of Indian heritage, crafted for the modern connoisseur.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            custom={4}
            variants={textReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap gap-5"
          >
            <Link
              href="/collections"
              className="group relative px-10 py-4 uppercase font-black overflow-hidden bg-transparent border border-forest/20 text-forest transition-colors duration-500 flex items-center gap-3"
              style={{ fontSize: "10px", letterSpacing: "0.3em" }}
            >
              <span className="relative z-10 group-hover:text-cream transition-colors duration-500">
                Shop Collection
              </span>
              <ArrowRight
                size={12}
                className="relative z-10 group-hover:translate-x-1.5 group-hover:text-cream transition-all duration-500"
              />
              <span className="absolute inset-0 bg-forest translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            </Link>

            <Link
              href="https://www.instagram.com/mrudulavastra/"
              target="_blank"
              rel="noopener noreferrer"
              className="group px-8 py-4 uppercase font-black transition-all duration-500 flex items-center gap-3 text-forest/60 hover:text-forest"
              style={{
                fontSize: "10px",
                letterSpacing: "0.3em",
              }}
            >
              <InstagramIcon size={12} className="opacity-80 group-hover:opacity-100 transition-opacity" />
              View Reels
            </Link>
          </motion.div>

          {/* Pillar stats */}
          <motion.div
            custom={5}
            variants={textReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex items-center gap-10 mt-16"
          >
            {pillars.map(([label, sub], idx) => (
              <div key={sub} className="relative">
                <p
                  className="font-playfair text-forest font-bold lg:font-semibold"
                  style={{ fontSize: "16px" }}
                >
                  {label}
                </p>
                <p
                  className="text-forest/80 font-black uppercase"
                  style={{ fontSize: "8px", letterSpacing: "0.2em", marginTop: "4px" }}
                >
                  {sub}
                </p>
                {/* Vertical divider between stats */}
                {idx < pillars.length - 1 && (
                  <span
                    className="absolute top-1/2 -translate-y-1/2 w-px h-6 bg-gold/20"
                    style={{ right: "-20px" }}
                  />
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ━━ Right: Framed Gallery Image ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-20 order-1 lg:order-2">
        <motion.div
          variants={imageReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative w-full max-w-sm lg:max-w-md aspect-[3/4] shadow-2xl shadow-forest/5"
        >
          {/* Subtle offset gold frame */}
          <div className="absolute top-4 left-4 lg:top-6 lg:left-6 w-full h-full border border-gold/30 z-0" />
          
          <div className="relative z-10 w-full h-full bg-[#F5F0E8] overflow-hidden">
            {/* Ken Burns slow drift */}
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 25,
                ease: "linear",
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <Image
                src="/images/hero-saree.webp"
                alt="Elegant woman wearing deep emerald silk saree"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>

            {/* Very light inner vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(14,34,25,0.05)] pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
