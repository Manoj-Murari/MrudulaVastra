"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Heart } from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";

const posts = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  img: `/images/insta-${i + 1}.webp`,
}));

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

export default function InstagramBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="bg-sand py-20 lg:py-24 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-3"
          >
            <InstagramIcon size={18} className="text-gold" />
            <p
              className="uppercase font-semibold text-gold font-dm"
              style={{ fontSize: "11px", letterSpacing: "0.3em" }}
            >
              Follow Our Journey
            </p>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-playfair text-text-primary font-bold mb-2"
            style={{ fontSize: "clamp(24px, 3vw, 38px)" }}
          >
            @mrudulavstra
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-text-muted font-dm"
            style={{ fontSize: "14px" }}
          >
            Real women. Real elegance. Daily drops on Instagram.
          </motion.p>
        </div>

        <motion.div
          ref={ref}
          variants={gridVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-10"
        >
          {posts.map((post) => (
            <motion.div
              key={post.id}
              variants={itemVariants}
              className="group relative overflow-hidden aspect-square cursor-pointer"
            >
              <Image
                src={post.img}
                alt="Instagram post"
                fill
                sizes="(max-width: 640px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                style={{ background: "rgba(26,60,46,0.7)" }}
              >
                <Heart size={20} className="text-white fill-white" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <a
            href="#"
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
        </motion.div>
      </div>
    </section>
  );
}
