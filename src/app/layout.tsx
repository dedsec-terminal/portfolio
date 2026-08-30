import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { siteConfig } from '@/lib/site';
import './globals.css';

/*
  Font pairing decision:
  - Inter: clean, neutral, extremely legible for professional body text.
    Used for UI, body, navigation.
  - JetBrains Mono: technically credible without being cliché hacker-font.
    Better character rendering for code/metadata than Geist Mono.
    Used for metadata, tags, dates, monospace accents.
*/
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  applicationName: siteConfig.brandName,
  title: {
    template: `%s | ${siteConfig.name} · ${siteConfig.brandName}`,
    default: siteConfig.title,
  },
  description: siteConfig.description,
  keywords: [
    'Dedsec Terminal',
    'dedsec-terminal',
    'Swaraj Singh',
    'cybersecurity portfolio',
    'SOC',
    'GRC',
    'security research',
  ],
  category: 'technology',
  metadataBase: siteConfig.url ? new URL(siteConfig.url) : undefined,
  alternates: siteConfig.url ? { canonical: '/' } : undefined,
  authors: [{ name: siteConfig.name, url: siteConfig.links.github }],
  creator: siteConfig.name,
  publisher: siteConfig.brandName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.brandName,
    type: 'website',
    url: siteConfig.url,
    images: [
      {
        url: `${siteConfig.url}/images/avatar/pfp.jpg`,
        width: 1200,
        height: 800,
        type: 'image/jpeg',
        alt: `${siteConfig.name}, creator of ${siteConfig.brandName}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/images/avatar/pfp.jpg`],
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteConfig.url}/#website`,
      name: siteConfig.brandName,
      alternateName: ['Dedsec Terminal', 'dedsec-terminal'],
      url: siteConfig.url,
      description: siteConfig.description,
      publisher: { '@id': `${siteConfig.url}/#person` },
      inLanguage: 'en',
    },
    {
      '@type': 'Person',
      '@id': `${siteConfig.url}/#person`,
      name: siteConfig.name,
      alternateName: siteConfig.brandName,
      url: siteConfig.url,
      image: `${siteConfig.url}/images/avatar/pfp.jpg`,
      jobTitle: 'Cybersecurity practitioner',
      sameAs: [siteConfig.links.github, siteConfig.links.linkedin, siteConfig.links.x],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
