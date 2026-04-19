/**
 * Product JSON-LD Structured Data
 * Generates rich product schema for Google Shopping & rich snippets.
 */

interface ProductJsonLdProps {
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  productId: string;
  material?: string | null;
  color?: string | null;
  galleryImages?: string[] | null;
}

export default function ProductJsonLd({
  name,
  image,
  price,
  originalPrice,
  category,
  rating,
  reviewCount,
  inStock,
  productId,
  material,
  color,
  galleryImages,
}: ProductJsonLdProps) {
  const allImages = [image, ...(galleryImages || [])].filter(Boolean);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://mrudulavastra.in/product/${productId}#product`,
    name,
    image: allImages,
    description: `Shop ${name} online at Mrudula Vastra. Premium ${category.toLowerCase()} handpicked from India's finest weavers. ${material ? `Made from luxurious ${material}.` : ""} ${color ? `Available in ${color}.` : ""} Free shipping on orders over ₹2000.`,
    brand: {
      "@type": "Brand",
      name: "Mrudula Vastra",
    },
    ...(category && {
      category: category,
    }),
    ...(material && {
      material: material,
    }),
    ...(color && {
      color: color,
    }),
    offers: {
      "@type": "Offer",
      url: `https://mrudulavastra.in/product/${productId}`,
      priceCurrency: "INR",
      price: price.toFixed(2),
      ...(originalPrice > price && {
        priceValidUntil: new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000
        ).toISOString().split("T")[0],
      }),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Mrudula Vastra",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "INR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 3,
            maxValue: 7,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
      },
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating.toFixed(1),
        bestRating: "5",
        worstRating: "1",
        reviewCount: reviewCount,
      },
    }),
  };

  // BreadcrumbList schema for product pages
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://mrudulavastra.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Collections",
        item: "https://mrudulavastra.in/collections",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category,
        item: `https://mrudulavastra.in/collections/${category.toLowerCase().replace(/\s+/g, "-")}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: name,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
    </>
  );
}
