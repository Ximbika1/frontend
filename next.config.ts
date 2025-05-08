import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['exemplo.com', 'images.unsplash.com'], // Domínios permitidos
  },
};

module.exports = nextConfig;
export default nextConfig;
