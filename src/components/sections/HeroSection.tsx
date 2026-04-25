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
    <section className="bg-cream font-dm lg:min-h-[75vh] flex flex-col lg:flex-row items-center overflow-hidden w-full max-w-[100vw]">
      {/* ━━ Left: Editorial Text Panel ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-end px-8 sm:px-14 lg:px-20 py-16 lg:py-0 order-2 lg:order-1">
        <div className="max-w-lg animate-fade-up">
          {/* Eyebrow */}
          <p
            className="uppercase font-semibold mb-8 flex items-center gap-4 text-forest/50 text-[9px] lg:text-[11px]"
            style={{ letterSpacing: "0.4em" }}
          >
            <span
              className="inline-block w-12 h-px bg-gold/50 origin-left animate-scale-x"
            />
            The Heritage Collection
          </p>

          {/* Headline */}
          <h1
            className="font-playfair text-forest font-semibold lg:font-medium mb-3 tracking-wide"
            style={{ lineHeight: 1.1, fontSize: "clamp(31px, 4.0vw, 51px)" }}
          >
            Timeless Elegance
          </h1>

          <p
            className="font-playfair text-gold font-semibold lg:font-medium italic mb-8"
            style={{ lineHeight: 1.1, fontSize: "clamp(25px, 3.0vw, 41px)" }}
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
              <div className="absolute inset-0 bg-forest translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
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
          </div>

          {/* Pillar stats */}
          <div className="mt-12 flex flex-wrap gap-12 lg:gap-16">
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
          </div>
        </div>
      </div>

      {/* ━━ Right: Framed Gallery Image ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center p-8 lg:py-12 lg:px-20 order-1 lg:order-2">
        <div
          className="relative w-full max-w-sm lg:max-w-[420px] aspect-[3/4] shadow-lg shadow-forest/5 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          {/* Subtle offset gold frame */}
          <div className="absolute top-4 left-4 lg:top-6 lg:left-6 w-full h-full border border-gold/30 z-0" />
          
          <div className="relative z-10 w-full h-full bg-[#F5F0E8] overflow-hidden">
            {/* Ken Burns slow drift — CSS only for GPU compositing */}
            <div
              className="absolute inset-0"
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
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Very light inner vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(14,34,25,0.03)] pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
