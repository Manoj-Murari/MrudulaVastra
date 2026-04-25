"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let timer: NodeJS.Timeout;

    const checkStatus = async () => {
      // Check if user is already authenticated
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // If they are logged in, never show the modal
        return;
      }

      // Wait 5 seconds before showing
      timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);
    };

    checkStatus();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  // Prevent hydration mismatch by not rendering anything until mounted
  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 cursor-pointer animate-fade-in"
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[850px] bg-cream shadow-[0_30px_100px_rgba(0,0,0,0.4)] z-10 overflow-hidden flex flex-col lg:flex-row animate-fade-up rounded-sm"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white lg:text-forest/40 hover:text-white lg:hover:text-forest transition-colors p-1.5 z-30"
          aria-label="Close welcome modal"
        >
          <X size={22} strokeWidth={1.5} />
        </button>

        {/* Image Section */}
        <div className="relative w-full lg:w-1/2 h-[160px] sm:h-[220px] lg:h-auto lg:min-h-[500px]">
          <img
            src="/images/welcome-modal-bg.png"
            alt="Premium Indian Silk Saree"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          {/* Subtle overlay for image depth on desktop */}
          <div className="hidden lg:block absolute inset-0 bg-black/5" />
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 lg:p-16 text-center lg:text-left bg-cream">
          {/* Eyebrow */}
          <p className="uppercase text-gold font-bold text-[9px] lg:text-[10px] tracking-[0.4em] mb-3 lg:mb-6">
            Exclusive Invitation
          </p>

          <h2 className="font-playfair text-[22px] sm:text-[28px] lg:text-[44px] text-forest font-medium lg:font-light mb-3 lg:mb-6 leading-[1.2] lg:leading-[1.1]">
            Join the Mrudula Vastra Family!
          </h2>

          <p className="text-[12px] lg:text-[15px] text-text-muted leading-relaxed font-dm mb-6 lg:mb-10 max-w-[340px] mx-auto lg:mx-0">
            Subscribe for exclusive early access to handpicked weaves, new arrivals, and boutique style inspiration.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:gap-4 w-full lg:max-w-[300px]">
            <Link
              href="/login"
              onClick={handleClose}
              className="w-full flex items-center justify-center bg-forest text-cream text-[11px] uppercase font-bold tracking-[0.2em] py-4 hover:bg-forest/90 transition-all shadow-lg active:scale-[0.98]"
            >
              Log In
            </Link>
            <Link
              href="/login?view=signup"
              onClick={handleClose}
              className="w-full flex items-center justify-center bg-transparent text-forest border border-forest/30 text-[11px] uppercase font-bold tracking-[0.2em] py-4 hover:bg-forest/5 transition-all active:scale-[0.98]"
            >
              Sign Up
            </Link>
          </div>
          
          {/* Footer Note (Desktop Only) */}
          <p className="hidden lg:block mt-10 text-[10px] text-text-muted/40 uppercase tracking-widest font-medium">
            Handpicked Ethnic Elegance
          </p>
        </div>
      </div>
    </div>
  );
}
