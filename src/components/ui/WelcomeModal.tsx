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
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop — NO backdrop-blur */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/50 cursor-pointer animate-fade-in"
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[800px] bg-cream shadow-[0_30px_100px_rgba(0,0,0,0.4)] z-10 overflow-hidden flex flex-col lg:flex-row animate-fade-up rounded-sm"
      >
        {/* Close Button — Absolute positioned for both layouts */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/80 lg:text-forest/40 hover:text-white lg:hover:text-forest transition-colors p-1.5 z-30"
          aria-label="Close welcome modal"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* Image Section */}
        <div className="relative w-full lg:w-1/2 h-[220px] sm:h-[280px] lg:h-auto lg:min-h-[480px]">
          <img
            src="/images/welcome-modal-bg.png"
            alt="Premium Indian Silk Saree"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          {/* Dark overlay for mobile text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
          
          {/* Subtle gold inner border (Desktop Only) */}
          <div className="hidden lg:block absolute inset-4 border border-white/20 pointer-events-none" />
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 lg:p-14 text-center lg:text-left bg-cream">
          {/* Eyebrow (Desktop Only) */}
          <p className="hidden lg:block uppercase text-gold font-bold text-[10px] tracking-[0.4em] mb-4">
            Exclusive Invitation
          </p>

          <h2 className="font-playfair text-[26px] sm:text-[32px] lg:text-[42px] text-forest font-medium lg:font-light mb-3 sm:mb-4 lg:mb-6 leading-[1.1] text-white lg:text-forest drop-shadow-md lg:drop-shadow-none absolute inset-x-0 bottom-6 lg:static p-6 lg:p-0">
            Join the Mrudula Vastra Family!
          </h2>

          <p className="text-[12px] sm:text-[13px] lg:text-[15px] text-white/90 lg:text-text-muted leading-relaxed font-dm mb-6 sm:mb-8 lg:mb-10 lg:max-w-[320px] absolute inset-x-0 bottom-0 lg:static p-6 pt-0 lg:p-0 hidden lg:block">
            Subscribe for exclusive early access to handpicked weaves, new arrivals, and boutique style inspiration.
          </p>
          
          {/* Mobile-only paragraph (visible over image) */}
          <p className="lg:hidden text-[12px] text-white/90 leading-relaxed font-dm mb-4 drop-shadow-sm absolute inset-x-0 bottom-4 p-6 pt-0">
            Subscribe for exclusive early access to handpicked weaves & new arrivals!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:gap-4 w-full lg:max-w-[280px]">
            <Link
              href="/login"
              onClick={handleClose}
              className="w-full flex items-center justify-center bg-forest text-cream text-[11px] uppercase tracking-widest py-4 hover:bg-forest/90 transition-all shadow-md active:scale-[0.98]"
            >
              Log In
            </Link>
            <Link
              href="/login?view=signup"
              onClick={handleClose}
              className="w-full flex items-center justify-center bg-transparent text-forest border border-forest/30 text-[11px] uppercase tracking-widest py-4 hover:bg-forest/5 transition-all active:scale-[0.98]"
            >
              Sign Up
            </Link>
          </div>
          
          {/* Footer Note (Desktop Only) */}
          <p className="hidden lg:block mt-8 text-[10px] text-text-muted/40 uppercase tracking-widest font-medium">
            Handpicked Ethnic Elegance
          </p>
        </div>
      </div>
    </div>
  );
}
