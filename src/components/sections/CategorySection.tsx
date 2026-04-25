"use client";

import Image from "next/image";
import Link from "next/link";
import OrnamentalDivider from "@/components/ui/OrnamentalDivider";
import type { Database } from "@/lib/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

interface CategorySectionProps {
  categories: Category[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="bg-cream font-dm py-10 lg:py-16 px-5 sm:px-10 overflow-hidden w-full max-w-[100vw]">
        <div className="max-w-5xl lg:max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-10 lg:mb-16 animate-fade-up">
          <p
            className="hidden sm:block uppercase font-bold mb-4 text-gold tracking-[0.5em] text-[9px]"
          >
            The Curations
          </p>
          <h2
            className="font-playfair text-forest font-medium tracking-wide text-[24px] sm:text-[clamp(24px,3.2vw,40px)]"
          >
            Shop by Category
          </h2>
          <div className="hidden sm:flex items-center justify-center gap-4 mt-6 opacity-60">
            <div className="h-px w-12 bg-gold/40" />
            <OrnamentalDivider className="max-w-[120px]" />
            <div className="h-px w-12 bg-gold/40" />
          </div>
        </div>

        {/* Category Gallery — 2-col grid on mobile, 4-col on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 lg:gap-10">
          {categories.map((cat, idx) => (
            <Link 
              key={cat.id} 
              href={cat.link || "/collections"} 
              prefetch={true} 
              className="block group animate-fade-up"
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              <div className="flex flex-col items-center">
                
                {/* Premium Designer Frame */}
                <div className="relative p-1.5 sm:p-2 lg:p-[14px] bg-white border border-gold/20 shadow-sm mb-4 sm:mb-8 w-full transition-all duration-700 ease-out group-hover:shadow-[0_20px_50px_rgba(184,150,62,0.12)] group-hover:-translate-y-2 group-hover:border-gold/50">
                  
                  {/* Subtle Corner Accents (Desktop Only) */}
                  <div className="hidden lg:block absolute -top-1 -left-1 w-4 h-4 border-t border-l border-gold/0 group-hover:border-gold/40 transition-all duration-700" />
                  <div className="hidden lg:block absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-gold/0 group-hover:border-gold/40 transition-all duration-700" />

                  {/* Inner Fine Border */}
                  <div className="border-[0.5px] border-forest/10 p-0.5 sm:p-1 lg:p-2.5">
                    
                    {/* Image Container */}
                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F5F0E8]">
                      <Image
                        src={cat.image}
                        alt={`${cat.title} collection at Mrudula Vastra`}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        priority={idx < 2}
                        className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                      />
                      
                      {/* Inner Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1s] ease-in-out" />
                    </div>
                  </div>
                </div>

                {/* Typography */}
                <div className="text-center">
                  <h3 className="font-playfair text-forest font-medium text-lg sm:text-2xl lg:text-[26px] mb-2 tracking-wide group-hover:text-gold transition-colors duration-500">
                    {cat.title}
                  </h3>
                  <div className="flex flex-col items-center">
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-black text-forest/40 group-hover:text-gold transition-colors duration-500">
                      Explore
                    </p>
                    <div className="h-px w-0 group-hover:w-8 bg-gold transition-all duration-500 mt-1" />
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
