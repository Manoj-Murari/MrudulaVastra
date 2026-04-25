"use client";

import { Star } from "lucide-react";
import OrnamentalDivider from "@/components/ui/OrnamentalDivider";
import type { Database } from "@/lib/supabase/types";

type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section className="bg-forest font-dm py-8 sm:py-20 lg:py-16 px-4 sm:px-6 lg:px-10 overflow-hidden w-full max-w-[100vw]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-16 lg:mb-12 animate-fade-up">
          <p
            className="hidden sm:block uppercase font-bold mb-4 text-gold tracking-[0.5em] text-[9px]"
          >
            Customer Love
          </p>
          <h2
            className="font-playfair text-cream font-medium tracking-wide text-[24px] sm:text-[clamp(24px,3.2vw,40px)]"
          >
            What Our Community Says
          </h2>
          <div className="hidden sm:flex items-center justify-center gap-4 mt-6 opacity-60">
            <div className="h-px w-12 bg-gold/40" />
            <OrnamentalDivider className="max-w-[120px]" />
            <div className="h-px w-12 bg-gold/40" />
          </div>
        </div>

        {/* Mobile: Horizontal swipe carousel | Desktop: 3-column grid */}
        <div className="flex sm:grid sm:grid-cols-3 gap-4 sm:gap-8 lg:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 pb-4 sm:pb-0">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="relative p-6 sm:p-10 lg:p-8 hover:border-gold/60 transition-all duration-500 ease-out animate-fade-up w-[85vw] sm:w-full flex-shrink-0 snap-center group hover:-translate-y-2"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(184,150,62,0.15)",
                animationDelay: `${i * 0.15}s`,
              }}
            >
              {/* Quote Icon Accent */}
              <div className="absolute top-6 left-6 text-gold/10 font-serif text-6xl leading-none pointer-events-none group-hover:text-gold/20 transition-colors duration-500">
                &ldquo;
              </div>

              <div className="flex mb-4 relative z-10">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={12}
                    className="fill-gold text-gold mr-1"
                  />
                ))}
              </div>

              <p
                className="font-cormorant mb-6 italic relative z-10"
                style={{
                  color: "rgba(253,251,247,0.85)",
                  lineHeight: 1.7,
                  fontSize: "18px",
                }}
              >
                {t.text}
              </p>

              <div className="relative z-10 pt-4 border-t border-gold/10">
                <p
                  className="font-playfair text-cream font-medium mb-1"
                  style={{ fontSize: "16px", letterSpacing: "0.02em" }}
                >
                  {t.name}
                </p>
                <p className="text-gold font-bold uppercase" style={{ fontSize: "9px", letterSpacing: "0.2em" }}>
                  {t.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
