"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import OrnamentalDivider from "@/components/ui/OrnamentalDivider";

// Real product images already used on the site — pulled from category/hero assets
const posts = [
  { id: 0, img: "/images/Saree.jpeg",          alt: "Premium handloom silk saree — Mrudula Vastra signature collection" },
  { id: 1, img: "/images/Dresses.jpeg",         alt: "Elegant ethnic dress — curated women's wear by Mrudula Vastra" },
  { id: 2, img: "/images/Dress-Materials.jpeg", alt: "Unstitched dress material — rich fabric selection at Mrudula Vastra" },
  { id: 3, img: "/images/Kids-Wear.jpeg",       alt: "Traditional kids ethnic wear — adorable festive outfits for children" },
  { id: 4, img: "/images/hero-saree.webp",      alt: "Heritage silk saree — deep emerald handloom weave from Machilipatnam" },
  { id: 5, img: "/images/Saree.jpeg",           alt: "Kanjivaram silk saree — luxurious zari border collection at Mrudula Vastra" },
];

export default function InstagramBanner() {
  return (
    <section className="bg-sand py-12 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 overflow-hidden w-full max-w-[100vw]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 lg:mb-16 animate-fade-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <InstagramIcon size={16} className="text-gold" />
            <p className="uppercase font-bold text-gold tracking-[0.5em] text-[9px]">
              Follow Our Journey
            </p>
          </div>

          <h2
            className="font-playfair text-forest font-medium tracking-wide mb-4"
            style={{ fontSize: "clamp(24px, 3.2vw, 40px)" }}
          >
            <a href="https://www.instagram.com/mrudulavastra/" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors duration-300">
              @mrudulavastra
            </a>
          </h2>

          <div className="hidden sm:flex items-center justify-center gap-4 mb-6 opacity-60">
            <div className="h-px w-12 bg-gold/40" />
            <OrnamentalDivider className="max-w-[120px]" />
            <div className="h-px w-12 bg-gold/40" />
          </div>

          <p
            className="hidden sm:block text-text-muted font-dm max-w-md mx-auto"
            style={{ fontSize: "14px", lineHeight: 1.6 }}
          >
            Real women. Real elegance. Daily drops on Instagram.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3 mb-10">
          {posts.map((post, idx) => (
            <div
              key={post.id}
              className={`group relative overflow-hidden aspect-square cursor-pointer animate-fade-up ${idx >= 4 ? "hidden md:block" : ""}`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <Image
                src={post.img}
                alt={post.alt}
                fill
                sizes="(max-width: 640px) 50vw, 16vw"
                loading="lazy"
                className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                style={{ background: "rgba(26,60,46,0.7)" }}
              >
                <Heart size={20} className="text-white fill-white" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <a
            href="https://www.instagram.com/mrudulavastra/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-3 px-12 py-4 uppercase font-black overflow-hidden bg-forest text-cream transition-all duration-500 shadow-lg shadow-forest/10 hover:shadow-forest/20"
            style={{ fontSize: "10px", letterSpacing: "0.3em" }}
          >
            <InstagramIcon size={14} className="relative z-10" />
            <span className="relative z-10">Follow on Instagram</span>
            <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          </a>
        </div>
      </div>
    </section>
  );
}
