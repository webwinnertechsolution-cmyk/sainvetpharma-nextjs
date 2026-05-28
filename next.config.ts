import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['127.0.0.1', 'api.sainivetpharma.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'https://api.sainivetpharma.com/api/:path*',
        },
        {
          source: '/uploads/:path*',
          destination: 'https://api.sainivetpharma.com/uploads/:path*',
        },
      ],
    };
  },
};
export default nextConfig;
