import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dedsec Terminal | Cybersecurity Portfolio of Swaraj Singh',
    short_name: 'Dedsec Terminal',
    description:
      'Dedsec Terminal is the cybersecurity portfolio of Swaraj Singh, covering SOC, GRC, security research, and projects.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [{ src: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  };
}
