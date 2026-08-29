import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'dedsec-terminal.in',
          },
        ],
        destination: 'https://www.dedsec-terminal.in/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'dedsec-terminal.vercel.app',
          },
        ],
        destination: 'https://www.dedsec-terminal.in/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
