import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable image optimization for external images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // Allow unoptimized images for development
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Environment variables
  env: {
    JWT_COOKIE_NAME: process.env.JWT_COOKIE_NAME || 'rov_auth_token',
    JWT_COOKIE_MAX_AGE: process.env.JWT_COOKIE_MAX_AGE || '86400',
  },
};

export default nextConfig;
