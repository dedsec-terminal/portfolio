import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
};

export default nextConfig;
