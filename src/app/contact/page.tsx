import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "Contact — Mrudula Vastra",
  description:
    "Get in touch with Mrudula Vastra. Based in Machilipatnam, Andhra Pradesh. Call us or send us a message.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Breadcrumb items={[{ label: "Contact" }]} />
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative py-24 lg:py-32 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-forest/5 to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <p
            className="uppercase text-gold font-dm font-medium tracking-[0.35em] mb-4"
            style={{ fontSize: "11px" }}
          >
            Get In Touch
          </p>
          <h1 className="font-playfair text-forest font-bold text-4xl lg:text-5xl mb-6">
            We&apos;d Love to
            <br />
            Hear From You
          </h1>
          <p className="text-text-muted font-dm text-lg max-w-xl mx-auto leading-relaxed">
            Whether you have a question about our collections, need styling advice,
            or want to visit our boutique — we&apos;re here to help.
          </p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 lg:px-10 pb-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Details */}
          <div className="space-y-10">
            <div>
              <p className="uppercase text-gold font-dm font-medium tracking-[0.3em] mb-6 text-[10px]">
                Contact Details
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-forest/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={18} className="text-forest" />
                  </div>
                  <div>
                    <h3 className="font-dm text-forest font-semibold text-sm mb-1">
                      Our Boutique
                    </h3>
                    <p className="text-text-muted font-dm text-sm leading-relaxed">
                      Mrudula Vastra
                      <br />
                      Machilipatnam
                      <br />
                      Andhra Pradesh, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-forest/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone size={18} className="text-forest" />
                  </div>
                  <div>
                    <h3 className="font-dm text-forest font-semibold text-sm mb-1">
                      Phone
                    </h3>
                    <p className="text-text-muted font-dm text-sm">+91 7208903117</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-forest/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail size={18} className="text-forest" />
                  </div>
                  <div>
                    <h3 className="font-dm text-forest font-semibold text-sm mb-1">
                      Email
                    </h3>
                    <p className="text-text-muted font-dm text-sm">
                      mrudulavastra@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-forest/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock size={18} className="text-forest" />
                  </div>
                  <div>
                    <h3 className="font-dm text-forest font-semibold text-sm mb-1">
                      Store Hours
                    </h3>
                    <p className="text-text-muted font-dm text-sm">
                      Monday – Saturday: 10:00 AM – 7:00 PM
                    </p>
                    <p className="text-text-muted font-dm text-sm">
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white border border-gold/10 p-8 lg:p-10">
            <p className="uppercase text-gold font-dm font-medium tracking-[0.3em] mb-2 text-[10px]">
              Send a Message
            </p>
            <h2 className="font-playfair text-forest font-bold text-2xl mb-8">
              Drop Us a Line
            </h2>

            <form className="space-y-6">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-forest font-dm font-medium text-sm mb-2"
                >
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-cream border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/50"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-forest font-dm font-medium text-sm mb-2"
                >
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-cream border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/50"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-forest font-dm font-medium text-sm mb-2"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 bg-cream border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/50"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-forest font-dm font-medium text-sm mb-2"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  placeholder="Tell us more..."
                  className="w-full px-4 py-3 bg-cream border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/50 resize-none"
                />
              </div>

              <button
                type="button"
                className="w-full py-4 bg-forest text-white uppercase tracking-[0.15em] text-sm font-bold font-dm hover:bg-forest/90 transition-colors flex items-center justify-center gap-2"
              >
                <Send size={16} />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
