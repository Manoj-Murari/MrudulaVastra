import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/ui/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us — Visit Our Boutique in Machilipatnam",
  description:
    "Get in touch with Mrudula Vastra — India's premium ethnic wear boutique in Machilipatnam, Andhra Pradesh. Call +91 7208903117, email mrudulavastra@gmail.com, or visit our store. Mon–Sat 10 AM – 7 PM.",
  alternates: {
    canonical: "https://mrudulavastra.in/contact",
  },
  openGraph: {
    title: "Contact Mrudula Vastra — Machilipatnam, Andhra Pradesh",
    description:
      "Reach out for styling advice, collection inquiries, or to visit our boutique. Available Mon–Sat, 10 AM – 7 PM.",
    url: "https://mrudulavastra.in/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-screen bg-cream">
        {/* ── Hero ─────────────────────────────────────── */}
        <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 text-center">
          <div className="relative z-10 max-w-3xl mx-auto px-6">
            <h1 className="font-playfair text-forest font-light text-4xl lg:text-5xl mb-6 tracking-wide">
              Reach Us
            </h1>
            <p className="text-text-muted font-dm text-sm lg:text-base max-w-xl mx-auto leading-relaxed">
              Whether you have a question about our collections, need styling advice,
              or want to arrange a private viewing — we&apos;re here to assist.
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
          <div className="lg:pl-10">
            <h2 className="font-playfair text-forest font-light text-3xl mb-8">
              Send an Inquiry
            </h2>

            <ContactForm />
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
