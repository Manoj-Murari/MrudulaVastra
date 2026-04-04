"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star } from "lucide-react";
import OrnamentalDivider from "@/components/ui/OrnamentalDivider";
import { TESTIMONIALS } from "@/data/testimonials";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  },
};

export default function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="bg-forest font-dm py-20 lg:py-28 px-6 lg:px-10">
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
            Customer Love
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-playfair text-cream font-bold"
            style={{ fontSize: "clamp(26px, 3vw, 40px)" }}
          >
            What Our Community Says
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <OrnamentalDivider className="mt-4 max-w-[200px] mx-auto opacity-40" />
          </motion.div>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid sm:grid-cols-3 gap-6 lg:gap-8"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="p-8 hover:border-amber-400/40 transition-colors duration-300"
              style={{
                background: "rgba(253,251,247,0.05)",
                border: "1px solid rgba(184,150,62,0.2)",
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
                  className="font-playfair text-cream font-semibold"
                  style={{ fontSize: "15px" }}
                >
                  {t.name}
                </p>
                <p className="text-gold" style={{ fontSize: "11px", letterSpacing: "0.1em" }}>
                  {t.location}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
