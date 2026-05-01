"use client";

import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { InstagramIcon, WhatsappIcon } from "@/components/ui/SocialIcons";
import Link from "next/link";
import AnimatedSection from "@/components/ui/AnimatedSection";

const QUICK_LINKS = [
  { label: "New Arrivals", href: "/collections" },
  { label: "Sarees", href: "/collections/sarees" },
  { label: "Dress Materials", href: "/collections/dress-materials" },
  { label: "Kids Wear", href: "/collections/kids" },
];

const HELP_LINKS = [
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Returns & Exchange", href: "/returns" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Track Your Order", href: "/track-order" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

const SOCIAL_LINKS = [
  { Icon: InstagramIcon, href: "https://www.instagram.com/mrudulavastra/", label: "Instagram" },
  { Icon: WhatsappIcon, href: "https://api.whatsapp.com/send/?phone=917208903117&text&type=phone_number&app_absent=0&utm_source=ig", label: "WhatsApp" },
];

const CONTACT_INFO = [
  { Icon: Phone, text: "+91 7208903117", href: "tel:+917208903117" },
  { Icon: Mail, text: "mrudulavastra@gmail.com", href: "mailto:mrudulavastra@gmail.com" },
  { Icon: MapPin, text: "Machilipatnam, Andhra Pradesh, India", href: null },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to server action / Supabase
    setEmail("");
  };

  return (
    <footer className="bg-forest-deep font-dm overflow-hidden w-full max-w-[100vw]">
      {/* Newsletter Strip — Compact Horizontal on LG */}
      <div className="bg-gold py-8 lg:py-6 px-6 lg:px-10 border-b border-black/5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
          {/* Text Content */}
          <div className="text-center lg:text-left flex-1">
            <p className="uppercase font-bold text-forest/40 tracking-[0.5em] text-[9px] mb-2">
              The Newsletter
            </p>
            <h2 className="font-playfair text-forest font-medium text-[24px] lg:text-[28px] mb-1 leading-tight">
              Join the Mrudula Circle
            </h2>
            <p className="text-[13px] lg:text-[14px] text-forest/70 max-w-md mx-auto lg:mx-0">
              Discover exclusive drops and curated festive offers.
            </p>
          </div>

          {/* Form Content */}
          <div className="w-full lg:w-auto lg:min-w-[450px]">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-5 py-3 outline-none placeholder:text-forest/30 w-full text-[13px] transition-all bg-white/50 border border-forest/10 focus:border-forest/40 focus:bg-white/70"
              />
              <button
                type="submit"
                className="px-8 py-3 uppercase font-black bg-forest text-gold transition-all duration-300 hover:bg-forest/90 text-[10px] tracking-[0.2em]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-10">
        <div className="flex flex-col items-center text-center mb-16 lg:mb-6">
          <AnimatedSection delay={0}>
            <h3 className="font-playfair text-cream font-medium mb-3 text-[24px] lg:text-[32px] tracking-[0.05em]">
              MRUDULA VASTRA
            </h3>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-8 bg-gold/30" />
              <p className="uppercase text-gold font-bold text-[10px] lg:text-[11px] tracking-[0.4em]">
                Elegance Woven in Every Thread
              </p>
              <div className="h-px w-8 bg-gold/30" />
            </div>
            <p className="mb-8 text-[14px] lg:text-[16px] max-w-2xl mx-auto text-cream/40 leading-[1.8] italic font-cormorant">
              Handpicked ethnic wear that blends heritage craftsmanship with contemporary
              elegance — for women and children who deserve the finest. Sourced directly from India's finest weavers.
            </p>
            <div className="flex items-center justify-center gap-6">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border border-gold/20 text-gold transition-all duration-300 group-hover:bg-gold group-hover:text-forest">
                    <social.Icon size={16} />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-gold/40 group-hover:text-gold transition-colors">
                    {social.label}
                  </span>
                </a>
              ))}
            </div>
          </AnimatedSection>
        </div>

        {/* Links Grid — Side-by-side on Mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-6 lg:gap-x-16 lg:gap-y-8 pt-12 lg:pt-6 border-t border-gold/5 text-left sm:text-left">
          {/* Quick Links */}
          <AnimatedSection delay={0.1}>
            <p className="uppercase font-black mb-8 lg:mb-4 text-cream text-[11px] tracking-[0.3em]">
              Quick Links
            </p>
            <div className="space-y-4 lg:space-y-2">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block hover:text-gold transition-all duration-300 text-[14px] text-cream/40 hover:translate-x-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </AnimatedSection>

          {/* Customer Care */}
          <AnimatedSection delay={0.2}>
            <p className="uppercase font-black mb-8 lg:mb-4 text-cream text-[11px] tracking-[0.3em]">
              Customer Care
            </p>
            <div className="space-y-4 lg:space-y-2">
              {HELP_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block hover:text-gold transition-all duration-300 text-[14px] text-cream/40 hover:translate-x-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </AnimatedSection>

          {/* Contact — Spans full width on mobile below the 2 columns */}
          <AnimatedSection delay={0.3} className="col-span-2 lg:col-span-1 mt-4 lg:mt-0">
            <p className="uppercase font-black mb-8 lg:mb-4 text-cream text-[11px] tracking-[0.3em]">
              Reach Us
            </p>
            <div className="space-y-5 lg:space-y-3 mb-8">
              {CONTACT_INFO.map(({ Icon, text, href }) => (
                <div key={text} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/5 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-gold" />
                  </div>
                  {href ? (
                    <a href={href} className="hover:text-gold transition-all text-[14px] text-cream/40 leading-snug">
                      {text}
                    </a>
                  ) : (
                    <span className="text-[14px] text-cream/40 leading-snug">
                      {text}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-gold/10">
              <p className="uppercase font-bold mb-3 text-gold text-[10px] tracking-widest">
                Business Hours
              </p>
              <p className="text-[13px] text-cream/30">
                Mon – Sat: 10am – 7pm <br />
                Sunday: Closed
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Final Bottom Bar */}
      <div className="px-6 lg:px-10 py-6 lg:py-3 bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <p className="text-cream/20 text-[11px] uppercase tracking-widest">
            © 2026 Mrudula Vastra. Elegance Woven in Every Thread.
          </p>
          <div className="flex items-center gap-8">
            {[
              { label: "Terms", href: "/" },
              { label: "Privacy", href: "/privacy-policy" },
              { label: "Sitemap", href: "/sitemap.xml" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-gold transition-colors text-cream/20 text-[11px] uppercase tracking-widest"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-cream/20 text-[10px] uppercase tracking-[0.3em]">
            Crafted in India
          </p>
        </div>

        {/* SEO Hidden Block */}
        <div className="max-w-7xl mx-auto mt-8 text-center text-[8px] text-cream/5 uppercase tracking-tighter">
          <p>
            Mrudula Vastra (also searched as MrudulaVastra, mrudulavastra, Mrudula Vasthram, MrudulaVasthra, Mrudhula Vastra, Mrudula Vastram, మృదుల వస్త్ర) is a premium ethnic wear destination.
          </p>
        </div>
      </div>
    </footer>
  );
}
