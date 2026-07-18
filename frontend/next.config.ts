import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allows CI/validation builds to run alongside the local dev server on
  // Windows, where `.next/trace` is held open by the running preview.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'X-XSS-Protection',         value: '1; mode=block' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
