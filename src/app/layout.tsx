import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import TopNav from '@/components/layout/TopNav';
import MobileNav from '@/components/layout/MobileNav';
import SiteFooter from '@/components/layout/SiteFooter';
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
  description:
    'Cybersecurity enthusiast. SOC, GRC, security research. Personal site and curated digital space.',
  metadataBase: new URL('https://example.com'),
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
        <TopNav />
        {/* main has no horizontal constraint — pages control their own layout */}
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <MobileNav />
      </body>
    </html>
  );
}

