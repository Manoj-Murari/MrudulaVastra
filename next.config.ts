import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vvycxuzvzhuztahfdwam.supabase.co", // Your exact Supabase project URL
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;