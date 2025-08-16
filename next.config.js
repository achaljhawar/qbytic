/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import withBundleAnalyzer from "@next/bundle-analyzer";

/** @type {import("next").NextConfig} */
const config = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ["lucide-react", "@rainbow-me/rainbowkit"],
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Bundle splitting for better caching
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          rainbow: {
            name: 'rainbow',
            test: /[\\/]node_modules[\\/]@rainbow-me[\\/]/,
            priority: 30,
            chunks: 'all',
          },
          wagmi: {
            name: 'wagmi',
            test: /[\\/]node_modules[\\/](wagmi|viem)[\\/]/,
            priority: 25,
            chunks: 'all',
          },
          ui: {
            name: 'ui',
            test: /[\\/]node_modules[\\/](lucide-react|@radix-ui)[\\/]/,
            priority: 20,
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
  
  // Compression
  compress: true,
  
  // Headers for caching
  async headers() {
    return [
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzer(config);
