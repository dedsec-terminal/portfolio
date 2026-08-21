import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, Geist_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Swaraj Singh',
    default: 'Swaraj Singh | Personal Website',
  },
  description:
    'Personal website, portfolio, and curated signal of Swaraj Singh.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="w-full max-w-3xl mx-auto px-6 py-8 flex justify-between items-center border-b border-surface/50">
          <nav className="flex space-x-6 text-sm font-medium">
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <Link href="/projects" className="hover:text-accent transition-colors">
              Projects
            </Link>
            <Link href="/writeups" className="hover:text-accent transition-colors">
              Writeups
            </Link>
            <Link href="/signal" className="hover:text-accent transition-colors">
              Signal
            </Link>
          </nav>
        </header>
        <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
          {children}
        </main>
        <footer className="w-full max-w-3xl mx-auto px-6 py-8 border-t border-surface/50 text-muted text-sm text-center">
          <p>© {new Date().getFullYear()} Swaraj Singh. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
