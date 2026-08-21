import Link from 'next/link';
import Image from 'next/image';

const navLinks = [
  { href: '/projects', label: 'Projects' },
  { href: '/signal', label: 'Signal' },
  { href: '/about', label: 'About' },
];

export default function TopNav() {
  return (
    <>
      {/* Skip to content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:px-3 focus-visible:py-1.5 focus-visible:bg-surface focus-visible:text-foreground focus-visible:text-sm focus-visible:rounded focus-visible:border focus-visible:border-border"
      >
        Skip to content
      </a>

      <header
        className="fixed top-0 inset-x-0 z-40 h-12 flex items-center border-b border-border/40"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--background) 85%, transparent)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Site mark */}
          <Link
            href="/"
            aria-label="DedSec — home"
            className="flex items-center gap-2.5 text-foreground/80 hover:text-foreground transition-colors duration-200 group"
          >
            <Image 
              src="/favicon.ico" 
              alt="" 
              width={18} 
              height={18} 
              className="opacity-90 grayscale group-hover:grayscale-0 transition-all duration-300"
              aria-hidden="true"
            />
            <span className="font-mono text-sm tracking-widest font-medium">DedSec</span>
          </Link>

          {/* Primary navigation */}
          <nav aria-label="Primary navigation">
            <ul className="flex items-center gap-7 list-none m-0 p-0">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted hover:text-foreground transition-colors duration-200 tracking-wide"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* Spacer to push content below the fixed nav */}
      <div aria-hidden="true" className="h-12 shrink-0" />
    </>
  );
}
