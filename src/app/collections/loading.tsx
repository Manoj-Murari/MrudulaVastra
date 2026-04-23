"use client";

import { motion } from "framer-motion";

export default function LoadingCollections() {
  return (
    <div className="bg-cream min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto font-dm">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mt-6">
        
        {/* Main Content Area Skeleton */}
        <div className="flex-1 w-full">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="h-3 w-16 bg-gold/20 rounded mb-4"
              />
              <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                className="h-10 lg:h-12 w-64 lg:w-80 bg-forest/10 rounded mb-4"
              />
              <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                className="h-4 w-48 bg-text-muted/10 rounded"
              />
            </div>

            {/* Controls Skeleton */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                className="h-10 w-24 bg-forest/5 border border-forest/10 rounded"
              />
              <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="h-10 w-40 bg-forest/5 border border-forest/10 rounded"
              />
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col h-full relative">
                {/* Image Placeholder */}
                <motion.div
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: [0.6, 0.9, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                  className="aspect-[3/4] mb-5 bg-sand relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </motion.div>

                {/* Details Placeholder */}
                <div className="flex-1 flex flex-col">
                  <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                    className="h-2 w-16 bg-text-muted/20 rounded mb-2 mt-auto"
                  />
                  <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 + 0.1 }}
                    className="h-4 w-3/4 bg-forest/15 rounded mb-3"
                  />
                  <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 + 0.2 }}
                    className="h-4 w-20 bg-forest/10 rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
