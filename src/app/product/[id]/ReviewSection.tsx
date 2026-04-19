"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ReviewSection({
  productId,
  reviews,
  rating,
}: {
  productId: string;
  reviews: number;
  rating: number;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setReviewText("");
        setSelectedStar(0);
      }, 2000);
    }, 1000);
  };

  return (
    <section className="max-w-4xl mx-auto px-6 lg:px-10 py-16 text-center font-dm mt-4 border-t border-gold/10">
      <h2 className="text-xl text-text-primary mb-10 font-playfair font-bold">
        Customer Reviews
      </h2>
      {reviews > 0 ? (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <div className="text-left flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.floor(rating)
                      ? "fill-[#1b7a66] text-[#1b7a66]"
                      : "text-gray-200"
                  }
                  strokeWidth={1}
                />
              ))}
            </div>
            <p className="text-sm text-text-muted">
              Based on {reviews} reviews
            </p>
          </div>
          <div className="hidden sm:block w-px h-12 bg-gray-200"></div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-2.5 bg-[#1b7a66] text-white font-medium text-sm transition-colors hover:bg-forest shadow-sm"
          >
            Write a review
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <div className="text-left flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-[#1b7a66]" strokeWidth={1.5} />
              ))}
            </div>
            <p className="text-sm text-text-muted">
              Be the first to write a review
            </p>
          </div>
          <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-[#1b7a66] text-white font-medium text-sm transition-colors hover:bg-forest shadow-sm"
          >
            Write a review
          </button>
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden text-left border border-gold/20"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gold/10 bg-cream/30">
                <h3 className="font-playfair font-bold text-[#1b7a66] text-xl">
                  Write your review
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-text-muted hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {submitSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-[#1b7a66]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="text-[#1b7a66] fill-[#1b7a66]" size={32} />
                    </div>
                    <h4 className="font-playfair text-forest text-xl font-bold mb-2">
                      Thank You!
                    </h4>
                    <p className="text-sm text-text-muted font-dm">
                      Your review has been submitted successfully and will be published soon.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">
                        How would you rate it?
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            onClick={() => setSelectedStar(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              size={28}
                              className={`transition-colors ${
                                (hoveredStar || selectedStar) >= star
                                  ? "text-[#1b7a66] fill-[#1b7a66]"
                                  : "text-gray-200"
                              }`}
                              strokeWidth={1}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="review" className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">
                        Share your thoughts
                      </label>
                      <textarea
                        id="review"
                        required
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Tell us what you loved about this product..."
                        rows={4}
                        className="w-full bg-cream/30 border border-gold/30 p-3 focus:outline-none focus:border-[#1b7a66] text-forest font-dm transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || selectedStar === 0 || !reviewText.trim()}
                      className="w-full py-3.5 bg-[#1b7a66] text-white uppercase tracking-wider text-sm font-bold font-dm transition-all disabled:opacity-50 hover:bg-forest shadow-sm flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                         <>
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           Submitting...
                         </>
                      ) : (
                        "Submit Review"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
