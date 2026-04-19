/**
 * JSON-LD Structured Data — Organization, LocalBusiness & WebSite schema
 * Injected into the homepage layout to establish brand entity with Google.
 */
export default function JsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://mrudulavastra.in/#organization",
    name: "Mrudula Vastra",
    alternateName: ["MrudulaVastra", "Mrudula Vastra Boutique"],
    url: "https://mrudulavastra.in",
    logo: {
      "@type": "ImageObject",
      url: "https://mrudulavastra.in/images/hero-saree.webp",
      width: 1200,
      height: 630,
    },
    description:
      "Mrudula Vastra is a premium Indian ethnic wear boutique based in Machilipatnam, offering handpicked sarees, dress materials, and kids wear sourced from India's finest weavers.",
    foundingDate: "2024",
    foundingLocation: {
      "@type": "Place",
      name: "Machilipatnam, Andhra Pradesh, India",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91-7208903117",
        contactType: "customer service",
        email: "mrudulavastra@gmail.com",
        availableLanguage: ["English", "Hindi", "Telugu"],
        areaServed: "IN",
      },
    ],
    sameAs: [
      "https://www.instagram.com/mrudulavastra/",
    ],
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": "https://mrudulavastra.in/#localbusiness",
    name: "Mrudula Vastra",
    image: "https://mrudulavastra.in/images/hero-saree.webp",
    url: "https://mrudulavastra.in",
    telephone: "+91-7208903117",
    email: "mrudulavastra@gmail.com",
    description:
      "Premium Indian ethnic wear boutique in Machilipatnam specializing in handloom sarees, silk sarees, designer dress materials, and traditional kids wear. Nationwide delivery available.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Machilipatnam",
      addressLocality: "Machilipatnam",
      addressRegion: "Andhra Pradesh",
      postalCode: "521001",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 16.1875,
      longitude: 81.1389,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "10:00",
        closes: "19:00",
      },
    ],
    priceRange: "₹₹-₹₹₹",
    paymentAccepted: "Cash, UPI, Credit Card, Debit Card, Net Banking",
    currenciesAccepted: "INR",
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Mrudula Vastra Collections",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Sarees",
          description:
            "Handloom, Kanjivaram, Banarasi, Pochampally, Chanderi silk sarees",
        },
        {
          "@type": "OfferCatalog",
          name: "Dress Materials",
          description: "Premium unstitched dress materials and suit fabrics",
        },
        {
          "@type": "OfferCatalog",
          name: "Kids Wear",
          description: "Traditional Indian ethnic wear for children",
        },
      ],
    },
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://mrudulavastra.in/#website",
    name: "Mrudula Vastra",
    alternateName: "MrudulaVastra",
    url: "https://mrudulavastra.in",
    description:
      "Shop premium handpicked sarees, dress materials & kids wear from Machilipatnam. Authentic Indian ethnic wear delivered nationwide.",
    publisher: {
      "@id": "https://mrudulavastra.in/#organization",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://mrudulavastra.in/collections?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-IN",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteSchema),
        }}
      />
    </>
  );
}
