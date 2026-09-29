import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      // Add your Render backend domain once deployed, e.g.:
      // 'medpulse-backend.onrender.com'
    ]
  },
  async rewrites() {
    // In production, NEXT_PUBLIC_API_URL is set to your Render backend URL.
    // The rewrite below is only used in local development (localhost:5000).
    const backendUrl = process.env.NEXT_PUBLIC_API_URL
      ? undefined
      : 'http://localhost:5000';

    if (!backendUrl) return [];

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`
      }
    ];
  }
};

export default nextConfig;
