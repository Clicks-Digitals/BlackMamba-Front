import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,

  compress: true,
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    // Originals are 1200-1600px; cards render them at ~240-330px.
    deviceSizes: [360, 480, 640, 828, 1080, 1200, 1920],
    imageSizes: [32, 48, 64, 96, 128, 200, 256, 384],
    // Optimised variants are cached at the edge for 30 days, so a shopper in
    // Amman is served from the nearest POP instead of the NYC3 origin.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "clicksorderingsystem.nyc3.digitaloceanspaces.com"
      },
      {
        // Same bucket via the Spaces CDN. Switch the backend to emit this host
        // and origin fetches leave NYC3 as well.
        protocol: "https",
        hostname: "clicksorderingsystem.nyc3.cdn.digitaloceanspaces.com"
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
