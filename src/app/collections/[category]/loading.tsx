import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Skeleton */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-10 pb-8 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="space-y-4">
            <div className="h-2 w-24 bg-gold/10 rounded-full" />
            <div className="h-10 w-48 bg-forest/5 rounded-lg" />
          </div>
          <div className="hidden lg:block h-4 w-64 bg-text-muted/10 rounded-full" />
        </div>
      </section>

      {/* Utility Bar Skeleton */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-8 border-y border-gold/10 py-6 animate-pulse">
        <div className="flex items-center gap-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 w-16 bg-forest/5 rounded-full" />
          ))}
        </div>
      </div>

      {/* Grid Skeleton */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="aspect-[4/5] bg-forest/5 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-forest/5 rounded" />
                <div className="h-3 w-1/2 bg-forest/5 rounded opacity-60" />
                <div className="h-4 w-1/4 bg-forest/10 rounded mt-4" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
