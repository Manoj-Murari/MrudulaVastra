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
    <section className="bg-cream font-dm py-12 lg:py-16 px-6 sm:px-10 overflow-hidden w-full max-w-[100vw]">
      <div className="max-w-5xl lg:max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20 animate-fade-up">
          <p
            className="uppercase font-semibold mb-4 text-forest/40"
            style={{ fontSize: "10px", letterSpacing: "0.4em" }}
          >
            The Curations
          </p>
          <h2
            className="font-playfair text-forest font-light tracking-wide"
            style={{ fontSize: "clamp(32px, 4vw, 56px)" }}
          >
            Shop by Category
          </h2>
          <OrnamentalDivider className="mt-6 max-w-[160px] mx-auto opacity-60" />
        </div>

        {/* Category Gallery */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8 -mx-6 px-6 md:mx-0 md:px-0">
          {categories.map((cat, idx) => (
            <Link 
              key={cat.id} 
              href={cat.link || "/collections"} 
              prefetch={true} 
              className="block group w-[80vw] sm:w-[60vw] md:w-full flex-shrink-0 snap-center animate-fade-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex flex-col items-center">
                
                {/* Premium Designer Frame */}
                <div className="relative p-2 lg:p-3 bg-cream border border-gold/40 shadow-md mb-6 w-full group-hover:border-gold transition-colors duration-700">
                  
                  {/* Decorative Corner Diamonds */}
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-cream border border-gold/50 rotate-45 group-hover:bg-gold transition-colors duration-700 z-10 lg:hidden" />
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-cream border border-gold/50 rotate-45 group-hover:bg-gold transition-colors duration-700 z-10 lg:hidden" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-cream border border-gold/50 rotate-45 group-hover:bg-gold transition-colors duration-700 z-10 lg:hidden" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-cream border border-gold/50 rotate-45 group-hover:bg-gold transition-colors duration-700 z-10 lg:hidden" />

                  {/* Inner Fine Border */}
                  <div className="border-[0.5px] border-forest/30 p-1 lg:p-2">
                    
                    {/* Image Container */}
                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F5F0E8]">
                      <Image
                        src={cat.image}
                        alt={`${cat.title} collection at Mrudula Vastra`}
                        fill
                        sizes="(max-width: 768px) 80vw, 33vw"
                        priority={idx < 2}
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </div>
                </div>

                {/* Typography */}
                <div className="text-center">
                  <h3 className="font-playfair text-forest font-light text-2xl lg:text-3xl mb-2 tracking-wide group-hover:text-gold transition-colors duration-500">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] uppercase tracking-widest font-bold text-forest mt-2 group-hover:text-gold transition-colors duration-500">
                    Explore &rarr;
                  </p>
                </div>

              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
