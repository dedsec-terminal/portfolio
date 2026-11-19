import type { NextConfig } from 'next';

const mutableAssetCache = 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85, 90],
    minimumCacheTTL: 2592000, // 30 days
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
        // Asset filenames are not content-hashed, so they must stay revalidatable.
        // Long CDN caching with stale-while-revalidate keeps repeat visits fast
        // without pinning a replaced image in browser caches for a year.
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: mutableAssetCache,
          },
        ],
      },
      {
        source: '/content/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: mutableAssetCache,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
