/**
 * JSON-LD Structured Data — Organization, LocalBusiness & WebSite schema
 * Injected into the homepage layout to establish brand entity with Google.
 * 
 * The `alternateName` arrays are critical for search discoverability — they tell Google
 * that all these name variations refer to the same business entity.
 */
export default function JsonLd() {
  /* ── All brand name variations & common misspellings ── */
  const brandNames = [
    "MrudulaVastra",
    "Mrudula Vastra Boutique",
    "Mrudula Vastra Sarees",
    "Mrudula Vastram",
    "Mrudula Vastra Online",
    "Mrudula Vastra India",
    "Mrudula Vastra Machilipatnam",
    // Common misspellings & typos
    "Mrudulavasthram",
    "Mrudula Vasthram",
    "Mrudula Vasthra",
    "MrudulaVasthra",
    "Mrudhula Vastra",
    "Mrudhula Vasthram",
    "Mrudula Vashtram",
    "Mrudulavastra.in",
    "mrudulavastra",
    "mrudula vastra",
    // Telugu variations
    "మృదుల వస్త్ర",
    // Partial searches people might do
    "Mrudula sarees",
    "Mrudula ethnic wear",
    "Mrudula online sarees",
  ];

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://mrudulavastra.in/#organization",
    name: "Mrudula Vastra",
    alternateName: brandNames,
    url: "https://mrudulavastra.in",
    logo: {
      "@type": "ImageObject",
      url: "https://mrudulavastra.in/images/hero-saree.webp",
      width: 1200,
      height: 630,
    },
    description:
      "Mrudula Vastra (MrudulaVastra) is a premium Indian ethnic wear boutique based in Machilipatnam, Andhra Pradesh. Shop handpicked sarees, designer dress materials, kurtas, and kids wear sourced from India's finest weavers. Free shipping across India.",
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
    alternateName: brandNames,
    image: "https://mrudulavastra.in/images/hero-saree.webp",
    url: "https://mrudulavastra.in",
    telephone: "+91-7208903117",
    email: "mrudulavastra@gmail.com",
    description:
      "MrudulaVastra — Premium Indian ethnic wear boutique in Machilipatnam specializing in handloom sarees, silk sarees, Kanjivaram sarees, Banarasi sarees, Pochampally sarees, designer dress materials, kurtas, and traditional kids wear. Nationwide delivery with free shipping on orders above ₹999.",
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
    paymentAccepted: "Cash, UPI, Credit Card, Debit Card, Net Banking, Razorpay",
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
            "Handloom, Kanjivaram, Banarasi, Pochampally, Chanderi, Tussar, Linen, Cotton silk sarees",
        },
        {
          "@type": "OfferCatalog",
          name: "Kurtas",
          description: "Designer kurta sets, ethnic kurtas for women",
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
    alternateName: ["MrudulaVastra", "mrudulavastra", "Mrudula Vastra Online Store", "mrudulavastra.in"],
    url: "https://mrudulavastra.in",
    description:
      "Shop premium handpicked sarees, kurtas, dress materials & kids wear from Machilipatnam at MrudulaVastra. Authentic Indian ethnic wear delivered nationwide with free shipping.",
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
