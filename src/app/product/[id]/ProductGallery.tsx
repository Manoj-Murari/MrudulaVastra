"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activeIndex = images.indexOf(activeImage);

  const handleNext = useCallback(() => {
    if (images.length === 0) return;
    setActiveImage(images[(activeIndex + 1) % images.length]);
  }, [activeIndex, images]);

  const handlePrev = useCallback(() => {
    if (images.length === 0) return;
    setActiveImage(images[(activeIndex - 1 + images.length) % images.length]);
  }, [activeIndex, images]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (primaryImage) {
      setActiveImage(primaryImage);
    }
  }, [primaryImage]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handleNext, handlePrev]);

  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isLightboxOpen]);

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
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing touch-pan-y"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = offset.x;
                if (swipe < -50) {
                  handleNext();
                } else if (swipe > 50) {
                  handlePrev();
                }
              }}
            >
              <Image
                src={activeImage}
                alt={productName}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
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

        {/* Zoom Button */}
        {activeImage && (
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-sm outline-none"
            aria-label="Expand image"
          >
            <Maximize2 size={16} className="text-gray-700" />
          </button>
        )}
      </div>

      {/* Full Size Lightbox Overlay */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[999] bg-white flex flex-col cursor-zoom-out"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between p-4 md:p-8 absolute top-0 left-0 right-0 z-20 font-dm pointer-events-none">
              <span className="text-gray-400 text-[10px] md:text-xs font-medium tracking-[0.2em] bg-white/50 px-3 py-1.5 backdrop-blur-sm pointer-events-auto">
                {activeIndex + 1} / {images.length}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(false);
                }}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-gray-400 hover:text-forest transition-colors outline-none pointer-events-auto group"
                aria-label="Close lightbox"
              >
                <X size={24} strokeWidth={1} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Main Image View */}
            <div className="flex-1 relative w-full h-full p-4 lg:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
                  className="w-full h-full relative cursor-grab active:cursor-grabbing touch-pan-y"
                  onClick={(e) => e.stopPropagation()}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, { offset }) => {
                    const swipe = offset.x;
                    if (swipe < -50) {
                      handleNext();
                    } else if (swipe > 50) {
                      handlePrev();
                    }
                  }}
                >
                  <Image
                    src={activeImage}
                    alt={`${productName} zoomed`}
                    fill
                    priority
                    sizes="100vw"
                    className="object-contain pointer-events-none"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-gray-300 hover:text-forest transition-all z-20 outline-none group"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={32} strokeWidth={1} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-gray-300 hover:text-forest transition-all z-20 outline-none group"
                  aria-label="Next image"
                >
                  <ChevronRight size={32} strokeWidth={1} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
