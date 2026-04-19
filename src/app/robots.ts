import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/auth/",
          "/login/",
          "/profile/",
          "/api/",
          "/_next/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/auth/", "/login/", "/profile/"],
      },
    ],
    sitemap: "https://mrudulavastra.in/sitemap.xml",
    host: "https://mrudulavastra.in",
  };
}
