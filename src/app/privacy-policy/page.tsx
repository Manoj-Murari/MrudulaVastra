import type { Metadata } from "next";
import { Shield, Eye, Lock, Database, Cookie, UserCheck, Bell, Mail } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Mrudula Vastra",
  description:
    "Read Mrudula Vastra's privacy policy to understand how we collect, use, and protect your personal information.",
};

const SECTIONS = [
  {
    icon: Database,
    title: "Information We Collect",
    content: [
      "**Personal Information:** When you create an account, place an order, or contact us, we collect your name, email address, phone number, and shipping address.",
      "**Payment Information:** Payment details are processed securely through our payment gateway (Razorpay) and are never stored on our servers.",
      "**Browsing Information:** We collect non-personal data such as browser type, device information, pages visited, and time spent on our website to improve your shopping experience.",
      "**Communication Data:** If you reach out to us via email, phone, or social media, we retain the communication for customer service purposes.",
    ],
  },
  {
    icon: Eye,
    title: "How We Use Your Information",
    content: [
      "**Order Processing:** To process and deliver your orders, send order confirmation and shipping updates.",
      "**Customer Support:** To respond to your queries, complaints, and requests efficiently.",
      "**Personalization:** To personalize your browsing experience and show relevant product recommendations.",
      "**Marketing:** To send promotional emails and offers, but only with your consent. You can unsubscribe at any time.",
      "**Analytics:** To analyze website traffic and user behavior to improve our services and product offerings.",
    ],
  },
  {
    icon: Lock,
    title: "Data Security",
    content: [
      "We implement industry-standard security measures including SSL encryption, secure servers, and regular security audits to protect your personal information.",
      "All payment transactions are encrypted and processed through PCI-DSS compliant payment gateways.",
      "Access to personal information is restricted to authorized employees who need it to perform their duties.",
      "We regularly review and update our security practices to ensure the highest level of data protection.",
    ],
  },
  {
    icon: Cookie,
    title: "Cookies",
    content: [
      "We use cookies to enhance your browsing experience, remember your preferences, and analyze website traffic.",
      "**Essential Cookies:** Required for the website to function properly (e.g., shopping cart, authentication).",
      "**Analytics Cookies:** Help us understand how visitors interact with our website to improve our services.",
      "**Marketing Cookies:** Used to deliver relevant advertisements and track marketing campaign effectiveness.",
      "You can manage your cookie preferences through your browser settings at any time.",
    ],
  },
  {
    icon: UserCheck,
    title: "Your Rights",
    content: [
      "**Access:** You have the right to request a copy of the personal data we hold about you.",
      "**Correction:** You can request correction of inaccurate or incomplete personal data.",
      "**Deletion:** You can request deletion of your personal data, subject to legal retention requirements.",
      "**Opt-out:** You can unsubscribe from marketing communications at any time by clicking the unsubscribe link in our emails.",
      "To exercise any of these rights, please contact us at mrudulavastra@gmail.com.",
    ],
  },
  {
    icon: Bell,
    title: "Third-Party Sharing",
    content: [
      "We do not sell, trade, or rent your personal information to third parties.",
      "We may share your information with trusted service providers (courier partners, payment gateways) solely for order fulfillment.",
      "We may disclose personal information if required by law or to protect the rights and safety of our users.",
      "All third-party service providers are contractually obligated to handle your data securely and confidentially.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-screen bg-cream">
        <Breadcrumb items={[{ label: "Privacy Policy" }]} />

        {/* Hero */}
        <section className="relative py-20 lg:py-28 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-forest/5 to-transparent" />
          <div className="relative z-10 max-w-3xl mx-auto px-6">
            <p
              className="uppercase text-gold font-dm font-medium tracking-[0.35em] mb-4"
              style={{ fontSize: "11px" }}
            >
              Privacy Policy
            </p>
            <h1 className="font-playfair text-forest font-bold text-4xl lg:text-5xl mb-6">
              Your Privacy
              <br />
              Matters to Us
            </h1>
            <p className="text-text-muted font-dm text-lg max-w-xl mx-auto leading-relaxed">
              We are committed to protecting your personal information and being
              transparent about how we collect and use your data.
            </p>
            <p className="text-text-muted/60 font-dm text-sm mt-4">
              Last updated: April 2026
            </p>
          </div>
        </section>

        {/* Policy Sections */}
        <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-24 space-y-8">
          {SECTIONS.map((section) => (
            <div
              key={section.title}
              className="bg-white border border-gold/10 p-8 lg:p-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <section.icon size={22} className="text-gold" />
                <h2 className="font-playfair text-forest font-bold text-xl">
                  {section.title}
                </h2>
              </div>
              <ul className="space-y-4">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0 mt-2" />
                    <p
                      className="text-text-muted font-dm text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: item.replace(
                          /\*\*(.*?)\*\*/g,
                          '<strong class="text-forest">$1</strong>'
                        ),
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact for Privacy */}
          <div className="bg-forest text-white p-10 lg:p-14 text-center">
            <Shield size={28} className="text-gold mx-auto mb-4" />
            <h2 className="font-playfair font-bold text-2xl mb-4">
              Questions About Your Privacy?
            </h2>
            <p className="text-white/70 font-dm text-sm mb-6 max-w-lg mx-auto leading-relaxed">
              If you have any questions or concerns about our privacy practices or
              wish to exercise your data rights, please don&apos;t hesitate to contact us.
            </p>
            <div className="flex items-center justify-center gap-2 text-white/80 font-dm text-sm">
              <Mail size={16} className="text-gold" />
              <a
                href="mailto:mrudulavastra@gmail.com"
                className="hover:text-gold transition-colors"
              >
                mrudulavastra@gmail.com
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
