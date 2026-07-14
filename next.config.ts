import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      {
        source: '/fsense-api/:path*',
        destination: 'https://api.fsense.com/v3.0/:path*',
      },
    ];
  },
};

export default nextConfig;