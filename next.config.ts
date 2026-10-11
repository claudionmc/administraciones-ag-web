import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  logging: false,
  images: {
    qualities: [75, 90],
  },
};

export default nextConfig;

