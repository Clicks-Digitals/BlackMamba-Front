import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,

  compress: true,
  poweredByHeader: false,

  images: {
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "clicksorderingsystem.nyc3.digitaloceanspaces.com"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  experimental:{
    serverActions:{
      bodySizeLimit: "100mb"
    }
  }
};

export default withNextIntl(nextConfig);
