"use client";

import { motion } from "framer-motion";

export default function LoadingProduct() {
  return (
    <div className="bg-cream min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto font-dm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        
        {/* Left: Image Gallery Skeleton */}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                className="w-16 h-20 sm:w-20 sm:h-28 bg-forest/5 flex-shrink-0 relative overflow-hidden rounded-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-full aspect-[3/4] sm:aspect-auto sm:h-[70vh] bg-forest/5 relative overflow-hidden rounded-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>

        {/* Right: Product Details Skeleton */}
        <div className="flex flex-col py-4 lg:py-10">
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-3 w-24 bg-text-muted/20 rounded mb-4"
          />
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
            className="h-10 lg:h-12 w-3/4 bg-forest/10 rounded mb-4"
          />
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="h-8 w-32 bg-forest/15 rounded mb-8"
          />
          
          <div className="space-y-3 mb-10">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 + (i * 0.1) }}
                className="h-3 w-full bg-text-muted/10 rounded"
              />
            ))}
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
              className="h-3 w-2/3 bg-text-muted/10 rounded"
            />
          </div>

          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className="h-14 w-full bg-forest/15 rounded mb-6"
          />

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="h-12 w-full bg-forest/5 rounded"
            />
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="h-12 w-full bg-forest/5 rounded"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
