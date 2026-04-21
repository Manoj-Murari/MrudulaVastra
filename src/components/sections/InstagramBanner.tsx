"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
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
    <section className="bg-sand py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 overflow-hidden w-full max-w-[100vw]">
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
            className="font-playfair font-bold mb-2"
            style={{ fontSize: "clamp(24px, 3vw, 38px)" }}
          >
            <a href="https://www.instagram.com/mrudulavastra/" target="_blank" rel="noopener noreferrer" className="text-text-primary hover:text-gold transition-colors duration-300">
              @mrudulavastra
            </a>
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
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-10"
        >
          {posts.map((post) => (
            <motion.div
              key={post.id}
              variants={itemVariants}
              className="group relative overflow-hidden aspect-square cursor-pointer"
            >
              <Image
                src={post.img}
                alt={post.alt}
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
        </motion.div>
      </div>
    </section>
  );
}
