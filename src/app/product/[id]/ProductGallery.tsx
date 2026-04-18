"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGalleryProps {
  primaryImage: string;
  galleryImages: string[] | null;
  productName: string;
  badge?: string | null;
  tag?: string | null;
  isSoldOut?: boolean;
}

export default function ProductGallery({ primaryImage, galleryImages, productName, badge, tag, isSoldOut }: ProductGalleryProps) {
  const allImages = [primaryImage, ...(galleryImages || [])].filter(Boolean);
  
  // Guard against duplicate URLs and filter place holders
  const images = Array.from(new Set(allImages)).filter(url => !url.includes("/api/placeholder"));

  const [activeImage, setActiveImage] = useState(images.length > 0 ? images[0] : "");

  return (
    <div className="w-full lg:w-1/2 flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 lg:items-start lg:sticky lg:top-[120px]">
      
      {/* Thumbnail Gallery (Bottom on mobile, Left Sidebar on Desktop - Myntra/Ajio style) */}
      {images.length > 1 && (
        <div className="flex lg:flex-col items-start gap-3 overflow-x-auto lg:overflow-y-auto admin-scroll shrink-0 pb-2 lg:pb-0 w-full lg:w-20" style={{ maxHeight: "calc(100vh - 140px)" }}>
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`relative w-16 h-20 lg:w-20 lg:h-28 shrink-0 overflow-hidden transition-all duration-300 outline-none ${
                activeImage === img 
                  ? "border border-forest shadow-md" 
                  : "border border-transparent opacity-60 hover:opacity-100 hover:border-gold/50"
              }`}
            >
              <Image 
                src={img} 
                alt={`${productName} thumbnail ${idx + 1}`} 
                fill 
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image View */}
      <div className="relative w-full aspect-[3/4] bg-[#F5F0E8] overflow-hidden group">
        {activeImage ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={activeImage}
                alt={productName}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-playfair text-forest/20 font-bold text-4xl tracking-widest mb-2">MV</p>
            <p className="text-forest/15 font-dm text-xs uppercase tracking-[0.3em]">Mrudula Vastra</p>
          </div>
        )}

        {badge && (
          <span className="absolute top-4 left-4 bg-forest text-white px-4 py-1.5 text-xs uppercase tracking-wider font-bold font-dm z-10">
            {badge}
          </span>
        )}
        {tag && (
          <span className="absolute bottom-4 left-0 bg-gold text-white px-4 py-1.5 text-xs uppercase tracking-wider font-bold font-dm z-10 transition-transform duration-300 group-hover:-translate-y-2">
            {tag}
          </span>
        )}
        
        {isSoldOut && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="px-5 py-2 bg-neutral-800 text-white text-xs font-bold uppercase tracking-[0.2em] font-dm">
              Sold Out
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
