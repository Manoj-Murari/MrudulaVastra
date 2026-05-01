"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";

const pillars = [
  ["Premium", "Quality"],
  ["Handpicked", "Designs"],
  ["100%", "Authentic"],
] as const;

export default function HeroSection() {
  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MOBILE HERO — Cinematic full-bleed editorial layout
          Only visible on screens < 1024px (lg breakpoint)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="lg:hidden relative w-full h-[65vh] flex flex-col justify-end overflow-hidden">
        {/* Background Image with Ken Burns */}
        <div
          className="absolute inset-0 z-0"
          style={{
            animation: "ken-burns 25s ease-in-out infinite alternate",
            willChange: "transform",
          }}
        >
          <Image
            src="/images/hero-saree.webp"
            alt="Elegant woman wearing deep emerald silk saree"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1vw"
            className="object-cover object-top"
          />
        </div>

        {/* Gradient Overlay — editorial fade from bottom */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0E2219] via-[#0E2219]/60 to-transparent" />

        {/* Content over image */}
        <div className="relative z-[2] px-6 pb-7 pt-12 animate-fade-up">
          {/* Eyebrow */}
          <p
            className="uppercase font-semibold mb-3 flex items-center gap-3 text-gold/80 text-[9px]"
            style={{ letterSpacing: "0.4em" }}
          >
            <span className="inline-block w-8 h-px bg-gold/50 origin-left animate-scale-x" />
            The Heritage Collection
          </p>

          {/* Headline */}
          <h1
            className="font-playfair text-cream font-semibold mb-1 tracking-wide"
            style={{ lineHeight: 1.08, fontSize: "32px" }}
          >
            Timeless
            <br />
            Elegance
          </h1>

          <p
            className="font-playfair text-gold font-semibold italic mb-4"
            style={{ lineHeight: 1.1, fontSize: "21px" }}
          >
            Woven with Love.
          </p>

          {/* Body — shorter for mobile */}
          <p
            className="mb-5 max-w-[280px] text-cream/70 font-medium font-dm"
            style={{ lineHeight: 1.6, fontSize: "12px" }}
          >
            Handpicked sarees, dress materials &amp; kids wear — a curated
            celebration of Indian heritage.
          </p>

          {/* CTA Row */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/collections"
              className="relative px-8 py-3.5 uppercase font-black overflow-hidden bg-gold text-forest-deep flex items-center gap-2.5 active:scale-[0.97] transition-transform"
              style={{ fontSize: "10px", letterSpacing: "0.25em" }}
            >
              Shop Now
              <ArrowRight size={12} />
            </Link>

            <Link
              href="https://www.instagram.com/mrudulavastra/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 uppercase font-black flex items-center gap-2.5 text-cream/60 border border-cream/15 active:scale-[0.97] transition-transform"
              style={{ fontSize: "10px", letterSpacing: "0.25em" }}
            >
              <InstagramIcon size={12} className="opacity-80" />
              Watch Reels
            </Link>
          </div>

          {/* Pillar Stats */}
          <div className="flex items-center gap-7 pt-5 border-t border-cream/10">
            {pillars.map(([label, sub], idx) => (
              <div key={sub} className="relative">
                <p className="font-playfair text-cream font-bold" style={{ fontSize: "14px" }}>
                  {label}
                </p>
                <p
                  className="text-cream/50 font-black uppercase"
                  style={{ fontSize: "7px", letterSpacing: "0.2em", marginTop: "3px" }}
                >
                  {sub}
                </p>
                {idx < pillars.length - 1 && (
                  <span
                    className="absolute top-1/2 -translate-y-1/2 w-px h-5 bg-cream/15"
                    style={{ right: "-16px" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          DESKTOP HERO — Original side-by-side editorial layout
          Only visible on screens >= 1024px (lg breakpoint)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="hidden lg:flex bg-cream font-dm min-h-[75vh] flex-row items-center overflow-hidden w-full max-w-[100vw]">
        {/* ━━ Left: Editorial Text Panel ━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="w-1/2 flex flex-col justify-center items-end px-20 py-0">
          <div className="max-w-lg animate-fade-up">
            {/* Eyebrow */}
            <p
              className="uppercase font-semibold mb-8 flex items-center gap-4 text-forest/50 text-[11px]"
              style={{ letterSpacing: "0.4em" }}
            >
              <span className="inline-block w-12 h-px bg-gold/50 origin-left animate-scale-x" />
              The Heritage Collection
            </p>

            {/* Headline */}
            <h1
              className="font-playfair text-forest font-medium mb-3 tracking-wide"
              style={{ lineHeight: 1.1, fontSize: "clamp(31px, 4.0vw, 51px)" }}
            >
              Timeless Elegance
            </h1>

            <p
              className="font-cormorant text-gold font-medium italic mb-10"
              style={{ lineHeight: 1.1, fontSize: "clamp(28px, 3.5vw, 46px)" }}
            >
              Woven with Love.
            </p>

            {/* Body copy */}
            <p
              className="mb-10 max-w-sm text-text-muted font-medium"
              style={{ lineHeight: 1.8, fontSize: "14px" }}
            >
              Discover handpicked sarees, elegant dress materials, and exquisite kids wear. A curated celebration of Indian heritage, crafted for the modern connoisseur.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-5">
              <Link
                href="/collections"
                className="group relative px-12 py-4 uppercase font-black overflow-hidden bg-forest text-cream transition-all duration-500 flex items-center gap-4 shadow-lg shadow-forest/10 hover:shadow-forest/20"
                style={{ fontSize: "10px", letterSpacing: "0.35em" }}
              >
                <span className="relative z-10">
                  Shop Collection
                </span>
                <ArrowRight
                  size={12}
                  className="relative z-10 group-hover:translate-x-2 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              </Link>
 
              <Link
                href="https://www.instagram.com/mrudulavastra/"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 uppercase font-black transition-all duration-500 flex items-center gap-3 text-forest/60 hover:text-forest"
                style={{ fontSize: "10px", letterSpacing: "0.3em" }}
              >
                <InstagramIcon size={12} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                View Reels
              </Link>
            </div>

            {/* Pillar stats */}
            <div className="mt-12 flex flex-wrap gap-16">
              {pillars.map(([label, sub], idx) => (
                <div key={sub} className="relative">
                  <p className="font-playfair text-forest font-semibold" style={{ fontSize: "16px" }}>
                    {label}
                  </p>
                  <p
                    className="text-forest/80 font-black uppercase"
                    style={{ fontSize: "8px", letterSpacing: "0.2em", marginTop: "4px" }}
                  >
                    {sub}
                  </p>
                  {idx < pillars.length - 1 && (
                    <span
                      className="absolute top-1/2 -translate-y-1/2 w-px h-6 bg-gold/20"
                      style={{ right: "-20px" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ━━ Right: Framed Gallery Image ━━━━━━━━━━━━━━━━━━━━ */}
        <div className="w-1/2 flex items-center justify-center py-12 px-10 lg:px-20 relative">
          <div
            className="relative w-full max-w-[440px] aspect-[3.2/4] animate-fade-up group/hero"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Elegant Floating Background Frame */}
            <div className="absolute -top-8 -right-8 w-48 h-48 border-t border-r border-gold/20 z-0 pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 border-b border-l border-gold/20 z-0 pointer-events-none" />
            
            {/* Main Image Container */}
            <div className="relative z-10 w-full h-full bg-[#F5F0E8] overflow-hidden shadow-[0_30px_100px_rgba(14,34,25,0.12)]">
              {/* Ken Burns + Hover Zoom */}
              <div
                className="absolute inset-0 transition-transform duration-[2000ms] ease-out group-hover/hero:scale-110"
                style={{
                  animation: "ken-burns 25s ease-in-out infinite alternate",
                  willChange: "transform",
                }}
              >
                <Image
                  src="/images/hero-saree.webp"
                  alt="Elegant woman wearing deep emerald silk saree"
                  fill
                  priority
                  sizes="50vw"
                  className="object-cover"
                />
              </div>

              {/* Light Editorial Grain/Texture Overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              
              {/* Subtle inner gold border */}
              <div className="absolute inset-4 border border-white/10 pointer-events-none" />
            </div>

            {/* Floating Badge (Luxury Detail) */}
            <div className="absolute -right-10 top-20 z-20 bg-cream border border-gold/20 px-6 py-4 hidden xl:block shadow-xl animate-fade-in" style={{ animationDelay: "1s" }}>
              <p className="text-[9px] uppercase tracking-[0.3em] font-black text-gold mb-1">Established</p>
              <p className="font-playfair text-forest text-lg italic">Heritage Weaves</p>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-3 animate-bounce">
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-forest/30 vertical-text" style={{ writingMode: 'vertical-rl' }}>Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-gold/50 to-transparent" />
          </div>
        </div>
      </section>
    </>
  );
}
