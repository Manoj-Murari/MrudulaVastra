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
      // Check if user has already seen the modal
      const hasSeen = localStorage.getItem("hasSeenWelcomeModal");
      if (hasSeen) return;

      // Check if user is already authenticated
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // If they are logged in, never show the modal and mark it as seen
        localStorage.setItem("hasSeenWelcomeModal", "true");
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
    localStorage.setItem("hasSeenWelcomeModal", "true");
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
        className="relative w-full max-w-[380px] bg-cream shadow-[0_20px_60px_rgba(0,0,0,0.3)] z-10 overflow-hidden flex flex-col animate-fade-up"
      >
        {/* Top Image Section */}
        <div className="relative w-full h-[280px]">
          <img
            src="/images/welcome-modal-bg.png"
            alt="Premium Indian Silk Saree"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          {/* Dark overlay to make text pop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1.5 z-20"
            aria-label="Close welcome modal"
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          {/* Text Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center pb-10 z-10">
            <h2 className="font-playfair text-[32px] text-white font-medium mb-3 leading-[1.1] drop-shadow-md">
              Join the Mrudula Vastra Family!
            </h2>
            <p className="text-[13px] text-white/90 leading-relaxed drop-shadow-sm font-dm">
              Subscribe for exclusive early access to handpicked weaves, new arrivals, and style inspiration!
            </p>
          </div>
        </div>

        {/* Bottom Action Section */}
        <div className="p-7 lg:p-8 flex flex-col gap-3 bg-cream">
          <Link
            href="/login"
            onClick={handleClose}
            className="w-full flex items-center justify-center bg-forest text-cream text-[11px] uppercase tracking-widest py-4 hover:bg-forest/90 transition-colors shadow-md"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            onClick={handleClose}
            className="w-full flex items-center justify-center bg-transparent text-forest border border-forest/30 text-[11px] uppercase tracking-widest py-4 hover:bg-forest/5 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
