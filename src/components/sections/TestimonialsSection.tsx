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
    <section className="bg-forest font-dm py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 overflow-hidden w-full max-w-[100vw]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14 animate-fade-up">
          <p
            className="uppercase font-semibold mb-3 text-gold"
            style={{ fontSize: "11px", letterSpacing: "0.3em" }}
          >
            Customer Love
          </p>
          <h2
            className="font-playfair text-cream font-normal"
            style={{ fontSize: "clamp(26px, 3vw, 40px)" }}
          >
            What Our Community Says
          </h2>
          <OrnamentalDivider className="mt-4 max-w-[200px] mx-auto opacity-40" />
        </div>

        <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-8 hover:border-amber-400/40 transition-colors duration-300 animate-fade-up"
              style={{
                background: "rgba(253,251,247,0.05)",
                border: "1px solid rgba(184,150,62,0.2)",
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={13}
                    className="fill-amber-400 text-amber-400 mr-0.5"
                  />
                ))}
              </div>
              <p
                className="mb-6 italic"
                style={{
                  color: "rgba(253,251,247,0.75)",
                  lineHeight: 1.8,
                  fontSize: "14px",
                }}
              >
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <p
                  className="font-playfair text-cream font-medium"
                  style={{ fontSize: "15px" }}
                >
                  {t.name}
                </p>
                <p className="text-gold" style={{ fontSize: "11px", letterSpacing: "0.1em" }}>
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
