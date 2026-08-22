import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Swaraj Singh',
    short_name: 'Swaraj Singh',
    description: 'Cybersecurity portfolio and personal digital space.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [{ src: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  };
}
