import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Disable overly strict type checking for client component props
    ignoreBuildErrors: false,
  },
  eslint: {
    // Don't fail builds on ESLint warnings
    ignoreDuringBuilds: false,
  },
  experimental: {
    // Disable strict client component prop validation
    typedRoutes: false,
  },
};

export default nextConfig;
