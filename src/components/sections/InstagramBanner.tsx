"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";

const posts = [
  { id: 0, img: "/images/insta-1.webp", alt: "Premium silk saree styling — elegant draping by Mrudula Vastra customer" },
  { id: 1, img: "/images/insta-2.webp", alt: "Handpicked Kanjivaram saree in rich jewel tones from Mrudula Vastra" },
  { id: 2, img: "/images/insta-3.webp", alt: "Traditional Indian ethnic wear — festive saree collection from Machilipatnam" },
  { id: 3, img: "/images/insta-4.webp", alt: "Banarasi silk saree with intricate zari work — Mrudula Vastra collection" },
  { id: 4, img: "/images/insta-5.webp", alt: "Premium dress materials and unstitched fabrics by Mrudula Vastra" },
  { id: 5, img: "/images/insta-6.webp", alt: "Designer ethnic outfit for kids — adorable traditional wear from Mrudula Vastra" },
];

export default function InstagramBanner() {
  return (
    <section className="bg-sand py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 overflow-hidden w-full max-w-[100vw]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-up">
          <div className="flex items-center justify-center gap-3 mb-3">
            <InstagramIcon size={18} className="text-gold" />
            <p
              className="uppercase font-semibold text-gold font-dm"
              style={{ fontSize: "11px", letterSpacing: "0.3em" }}
            >
              Follow Our Journey
            </p>
          </div>
          <h2
            className="font-playfair font-normal mb-2"
            style={{ fontSize: "clamp(24px, 3vw, 38px)" }}
          >
            <a href="https://www.instagram.com/mrudulavastra/" target="_blank" rel="noopener noreferrer" className="text-text-primary hover:text-gold transition-colors duration-300">
              @mrudulavastra
            </a>
          </h2>
          <p
            className="text-text-muted font-dm"
            style={{ fontSize: "14px" }}
          >
            Real women. Real elegance. Daily drops on Instagram.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-10">
          {posts.map((post, idx) => (
            <div
              key={post.id}
              className="group relative overflow-hidden aspect-square cursor-pointer animate-fade-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <Image
                src={post.img}
                alt={post.alt}
                fill
                sizes="(max-width: 640px) 50vw, 16vw"
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
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
            className="inline-flex items-center gap-2.5 px-10 py-3.5 uppercase font-semibold text-forest hover:bg-emerald-900 hover:text-white transition-all duration-300 font-dm"
            style={{
              border: "1.5px solid #1A3C2E",
              fontSize: "12px",
              letterSpacing: "0.15em",
            }}
          >
            <InstagramIcon size={14} />
            Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
