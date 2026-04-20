"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import OrnamentalDivider from "@/components/ui/OrnamentalDivider";


const stats = [
  ["Premium", "Quality"],
  ["Handpicked", "Designs"],
  ["100%", "Authentic"],
] as const;

const textReveal = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.15, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

const imageReveal = {
  hidden: { scale: 1.08, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as const } },
};

const floatingBadge = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 1.2, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

export default function HeroSection() {
  return (
    <section className="bg-cream font-dm min-h-[88vh] grid lg:grid-cols-2 overflow-hidden w-full max-w-[100vw]">
      {/* Left: Text Panel */}
      <div className="flex flex-col justify-center px-8 sm:px-14 lg:px-20 py-16 lg:py-0 order-2 lg:order-1">
        <div className="max-w-lg">
          <motion.p
            custom={0}
            variants={textReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="uppercase font-semibold mb-5 flex items-center gap-2 text-gold"
            style={{ fontSize: "11px", letterSpacing: "0.3em" }}
          >
            <span className="inline-block w-6 h-px bg-gold" />
            Summer Collection 2025
          </motion.p>

          <motion.h1
            custom={1}
            variants={textReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-playfair text-text-primary font-bold mb-2"
            style={{ lineHeight: 1.12, fontSize: "clamp(36px, 5vw, 62px)" }}
          >
            Wear the Art
          </motion.h1>

          <motion.p
            custom={2}
            variants={textReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-playfair text-forest font-bold italic mb-6"
            style={{ lineHeight: 1.12, fontSize: "clamp(36px, 5vw, 62px)" }}
          >
            of India.
          </motion.p>

          <motion.p
            custom={3}
            variants={textReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-10 max-w-sm text-text-body"
            style={{ lineHeight: 1.75, fontSize: "15px" }}
          >
            Handpicked sarees, elegant dress materials, and adorable kids wear —
            crafted with love, woven with tradition.
          </motion.p>

          <motion.div
            custom={4}
            variants={textReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <OrnamentalDivider className="mb-10 max-w-xs" />
          </motion.div>

          <motion.div
            custom={5}
            variants={textReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/collections" className="px-8 py-4 uppercase font-semibold hover:opacity-90 transition-all duration-300 flex items-center gap-2.5 group bg-forest text-cream" style={{ fontSize: "13px", letterSpacing: "0.1em" }}>
              Shop the Collection
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link href="https://www.instagram.com/mrudulavastra/" target="_blank" rel="noopener noreferrer" className="px-8 py-4 uppercase font-semibold hover:bg-amber-50 transition-all duration-300 flex items-center gap-2.5 text-gold" style={{ border: "1.5px solid #B8963E", fontSize: "13px", letterSpacing: "0.1em" }}>
              <Play size={13} className="fill-current" />
              View Reels
            </Link>
          </motion.div>

          <motion.div
            custom={6}
            variants={textReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex items-center gap-8 mt-12"
          >
            {stats.map(([num, label]) => (
              <div key={label}>
                <p className="font-playfair text-forest font-bold" style={{ fontSize: "22px" }}>
                  {num}
                </p>
                <p className="text-text-muted" style={{ fontSize: "11px", letterSpacing: "0.05em" }}>
                  {label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right: Image Panel */}
      <motion.div
        variants={imageReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative overflow-hidden order-1 lg:order-2 min-h-[50vh] sm:min-h-[60vh] lg:min-h-0"
      >
        <Image
          src="/images/hero-saree.webp"
          alt="Elegant woman wearing deep emerald silk saree"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          style={{ filter: "brightness(0.92) saturate(1.1)" }}
        />

        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 60%, rgba(26,60,46,0.35) 100%)",
          }}
        />

        {/* Floating Instagram badge */}
        <motion.a
          href="https://www.instagram.com/mrudulavastra/"
          target="_blank"
          rel="noopener noreferrer"
          variants={floatingBadge}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="absolute p-3 sm:p-4 shadow-2xl max-w-[180px] sm:max-w-[200px] cursor-pointer block bottom-4 right-4 sm:bottom-8 sm:right-8"
          style={{
            background: "rgba(253,251,247,0.95)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-forest flex items-center justify-center flex-shrink-0 mt-0.5">
              <InstagramIcon size={15} className="text-white" />
            </div>
            <div>
              <p className="text-text-primary font-bold transition-colors hover:text-gold" style={{ fontSize: "12px" }}>
                @mrudulavastra
              </p>
              <p className="text-text-muted" style={{ fontSize: "10px", marginTop: "2px" }}>
                Follow us for daily drops ✨
              </p>
            </div>
          </div>
        </motion.a>

        {/* Gold accent corners */}
        <div
          className="absolute w-12 h-12"
          style={{
            borderTop: "3px solid #B8963E",
            borderLeft: "3px solid #B8963E",
            top: 24,
            left: 24,
          }}
        />
        <div
          className="absolute w-12 h-12 hidden lg:block"
          style={{
            borderBottom: "3px solid #B8963E",
            borderRight: "3px solid #B8963E",
            bottom: 24,
            right: 140,
          }}
        />
      </motion.div>
    </section>
  );
}
