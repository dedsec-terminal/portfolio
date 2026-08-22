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
  title: {
    template: '%s | Swaraj Singh',
    default: 'Swaraj Singh',
  },
  description: siteConfig.description,
  metadataBase: siteConfig.url ? new URL(siteConfig.url) : undefined,
  authors: [{ name: siteConfig.name, url: siteConfig.links.github }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    type: 'website',
    url: siteConfig.url,
    images: [
      {
        url: '/images/avatar/pfp.jpg',
        width: 1200,
        height: 800,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: ['/images/avatar/pfp.jpg'],
  },
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
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
