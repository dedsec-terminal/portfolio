import Link from 'next/link';
import Image from 'next/image';
import DiscordPresence from '@/components/features/DiscordPresence';
import { primaryNavigation } from '@/lib/navigation';

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
          backgroundColor:
            'color-mix(in srgb, var(--background) 85%, transparent)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Site mark */}
            <Link
              href="/"
              aria-label="Dedsec Terminal — home"
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
              <span className="font-mono text-sm tracking-widest font-medium">
                DedSec
              </span>
            </Link>
            <span className="hidden sm:inline-flex">
              <DiscordPresence />
            </span>
          </div>

          {/* Primary navigation */}
          <nav aria-label="Primary navigation">
            <ul className="m-0 flex list-none items-center gap-3 p-0 sm:gap-5 md:gap-7">
              {primaryNavigation.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[11px] tracking-wide text-muted transition-colors duration-200 hover:text-foreground sm:text-xs md:text-sm"
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
