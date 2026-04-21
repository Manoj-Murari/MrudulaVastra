"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import OrnamentalDivider from "@/components/ui/OrnamentalDivider";
import type { Database } from "@/lib/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

interface CategorySectionProps {
  categories: Category[];
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

export default function CategorySection({ categories }: CategorySectionProps) {

  return (
    <section className="bg-sand font-dm py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 overflow-hidden w-full max-w-[100vw]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="uppercase font-semibold mb-3 text-gold"
            style={{ fontSize: "11px", letterSpacing: "0.3em" }}
          >
            Explore Our World
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-playfair text-text-primary font-bold"
            style={{ fontSize: "clamp(28px, 3.5vw, 42px)" }}
          >
            Shop by Category
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <OrnamentalDivider className="mt-4 max-w-[200px] mx-auto" />
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7"
        >
          {categories.map((cat) => (
            <Link key={cat.id} href={cat.link || "/collections"} className="block">
              <motion.div
                variants={cardVariants}
                className="group relative overflow-hidden cursor-pointer h-full"
                style={{
                  aspectRatio: "4/5",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                }}
              >
                {/* Image */}
                <Image
                  src={cat.image}
                  alt={`${cat.title} — Premium ${cat.title.toLowerCase()} collection at Mrudula Vastra, Machilipatnam`}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(to top, ${cat.color}ee 0%, ${cat.color}88 45%, transparent 75%)`,
                  }}
                />

                {/* Tag badge */}
                <div
                  className="absolute px-3 py-1.5 text-white uppercase font-semibold bg-gold"
                  style={{ top: 18, left: 18, fontSize: "10px", letterSpacing: "0.15em" }}
                >
                  {cat.tag}
                </div>

                {/* Text content */}
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <p
                    className="uppercase mb-1 font-medium"
                    style={{
                      color: "rgba(253,251,247,0.65)",
                      fontSize: "11px",
                      letterSpacing: "0.2em",
                    }}
                  >
                    {cat.subtitle}
                  </p>
                  <h3
                    className="font-playfair text-cream font-bold mb-4"
                    style={{ fontSize: "clamp(22px, 2.5vw, 30px)" }}
                  >
                    {cat.title}
                  </h3>
                  <div
                    className="inline-flex items-center gap-2 text-white px-5 py-2.5 uppercase font-semibold group-hover:bg-white/10 transition-colors duration-300"
                    style={{
                      border: "1.5px solid rgba(253,251,247,0.5)",
                      fontSize: "11px",
                      letterSpacing: "0.12em",
                    }}
                  >
                    Explore <ChevronRight size={13} />
                  </div>
                </div>

                {/* Hover gold outline */}
                <div
                  className="absolute inset-3 group-hover:border-amber-400/50 transition-all duration-500"
                  style={{ border: "2px solid rgba(184,150,62,0)" }}
                />
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
