import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000, // 30 days
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      '@radix-ui/react-popover',
      '@radix-ui/react-slider',
    ],
  },
  redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.dedsec-terminal.in',
          },
        ],
        destination: 'https://dedsec-terminal.in/:path*',
        permanent: true,
      },
      {
        source: '/:path((?!googleb26de6b6cf083888\\.html$).*)',
        has: [
          {
            type: 'host',
            value: 'dedsec-terminal.vercel.app',
          },
        ],
        destination: 'https://dedsec-terminal.in/:path',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/content/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
