"use client";

import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { InstagramIcon, FacebookIcon, YoutubeIcon } from "@/components/ui/SocialIcons";
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
  { Icon: FacebookIcon, href: "/", label: "Facebook" },
  { Icon: YoutubeIcon, href: "/", label: "YouTube" },
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
      {/* Newsletter Strip */}
      <div className="bg-gold py-10 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="font-playfair font-normal" style={{ color: "#0E2219", fontSize: "20px" }}>
              Join the Mrudula Circle
            </p>
            <p style={{ color: "rgba(14,34,25,0.7)", fontSize: "13px" }}>
              Get exclusive drops, early access &amp; festive offers.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 sm:gap-0 w-full sm:w-auto max-w-sm">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-5 py-3.5 outline-none placeholder:text-emerald-900/40 w-full sm:w-56"
              style={{
                background: "rgba(14,34,25,0.1)",
                border: "1.5px solid rgba(14,34,25,0.3)",
                color: "#0E2219",
                fontSize: "13px",
              }}
            />
            <button
              type="submit"
              className="px-6 py-3.5 uppercase font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 whitespace-nowrap w-full sm:w-auto"
              style={{
                background: "#0E2219",
                color: "#B8963E",
                fontSize: "12px",
                letterSpacing: "0.1em",
              }}
            >
              <Mail size={13} />
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">
        {/* Brand */}
        <AnimatedSection delay={0}>
          <h3
            className="font-playfair text-cream font-medium mb-2"
            style={{ fontSize: "20px", letterSpacing: "0.06em" }}
          >
            MRUDULA VASTRA
          </h3>
          <p
            className="uppercase mb-5 text-gold"
            style={{ fontSize: "10px", letterSpacing: "0.25em" }}
          >
            Elegance Woven in Every Thread
          </p>
          <p
            className="mb-6"
            style={{ color: "rgba(253,251,247,0.5)", fontSize: "13px", lineHeight: 1.8 }}
          >
            Handpicked ethnic wear that blends heritage craftsmanship with contemporary
            elegance — for women and children who deserve the finest.
          </p>
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target={social.href !== "#" ? "_blank" : undefined}
                rel={social.href !== "#" ? "noopener noreferrer" : undefined}
                className="w-9 h-9 rounded-full flex items-center justify-center text-amber-400/60 hover:text-amber-400 hover:border-amber-400 transition-all duration-200"
                style={{ border: "1px solid rgba(184,150,62,0.3)" }}
                aria-label={social.label}
              >
                <social.Icon size={15} />
              </a>
            ))}
          </div>
        </AnimatedSection>

        {/* Quick Links */}
        <AnimatedSection delay={0.1}>
          <p
            className="uppercase font-semibold mb-5 text-cream"
            style={{ fontSize: "12px", letterSpacing: "0.2em" }}
          >
            Quick Links
          </p>
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block mb-3 hover:text-amber-400 transition-colors duration-200"
              style={{ color: "rgba(253,251,247,0.45)", fontSize: "13px" }}
            >
              {link.label}
            </Link>
          ))}
        </AnimatedSection>

        {/* Customer Care */}
        <AnimatedSection delay={0.2}>
          <p
            className="uppercase font-semibold mb-5 text-cream"
            style={{ fontSize: "12px", letterSpacing: "0.2em" }}
          >
            Customer Care
          </p>
          {HELP_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block mb-3 hover:text-amber-400 transition-colors duration-200"
              style={{ color: "rgba(253,251,247,0.45)", fontSize: "13px" }}
            >
              {link.label}
            </Link>
          ))}
        </AnimatedSection>

        {/* Contact */}
        <AnimatedSection delay={0.3}>
          <p
            className="uppercase font-semibold mb-5 text-cream"
            style={{ fontSize: "12px", letterSpacing: "0.2em" }}
          >
            Reach Us
          </p>
          <div className="space-y-4">
            {CONTACT_INFO.map(({ Icon, text, href }) => (
              <div key={text} className="flex items-start gap-3">
                <Icon
                  size={14}
                  className="text-gold flex-shrink-0"
                  style={{ marginTop: "2px" }}
                />
                {href ? (
                  <a
                    href={href}
                    className="hover:text-amber-400 transition-colors duration-200"
                    style={{ color: "rgba(253,251,247,0.5)", fontSize: "13px", lineHeight: 1.5 }}
                  >
                    {text}
                  </a>
                ) : (
                  <span style={{ color: "rgba(253,251,247,0.5)", fontSize: "13px", lineHeight: 1.5 }}>
                    {text}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div
            className="mt-6 p-4"
            style={{
              background: "rgba(184,150,62,0.1)",
              border: "1px solid rgba(184,150,62,0.2)",
            }}
          >
            <p
              className="uppercase font-semibold mb-1 text-gold"
              style={{ fontSize: "11px", letterSpacing: "0.1em" }}
            >
              Business Hours
            </p>
            <p style={{ color: "rgba(253,251,247,0.5)", fontSize: "12px" }}>
              Mon – Sat: 10am – 7pm
            </p>
            <p style={{ color: "rgba(253,251,247,0.5)", fontSize: "12px" }}>Sunday: Closed</p>
          </div>
        </AnimatedSection>
      </div>

      {/* Bottom Bar */}
      <div className="px-6 lg:px-10 py-6" style={{ borderTop: "1px solid rgba(184,150,62,0.1)" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-3 text-center sm:text-left">
          <p style={{ color: "rgba(253,251,247,0.3)", fontSize: "12px" }}>
            © 2026 Mrudula Vastra. All Rights Reserved.
          </p>
          <div className="flex items-center gap-5">
            {[
              { label: "Terms", href: "/" },
              { label: "Privacy", href: "/privacy-policy" },
              { label: "Sitemap", href: "/sitemap.xml" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-amber-400/60 transition-colors"
                style={{ color: "rgba(253,251,247,0.3)", fontSize: "12px" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p style={{ color: "rgba(253,251,247,0.25)", fontSize: "11px" }}>
            Made with ❤️ in India
          </p>
        </div>
        
        {/* SEO Hidden Block — Helps Google associate misspellings with our brand */}
        <div className="max-w-7xl mx-auto mt-6 text-center" style={{ color: "rgba(253,251,247,0.05)", fontSize: "8px" }}>
          <p>
            Mrudula Vastra (also searched as MrudulaVastra, mrudulavastra, Mrudula Vasthram, MrudulaVasthra, Mrudhula Vastra, Mrudula Vastram, మృదుల వస్త్ర) is a premium ethnic wear destination.
          </p>
        </div>
      </div>
    </footer>
  );
}
