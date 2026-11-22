'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Home, Briefcase, Radio, User } from 'lucide-react';
import { primaryNavigation } from '@/lib/navigation';

const icons = {
  '/': Home,
  '/projects': Briefcase,
  '/signal': Radio,
  '/about': User,
} as const;

export default function MobileNav() {
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(true);
  const hideTimer = useRef<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const wasAtPageEnd = useRef(false);

  useEffect(() => {
    let frameId: number | null = null;

    const updateVisibility = () => {
      const isAtPageEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 24;

      if (isAtPageEnd && !wasAtPageEnd.current) {
        setIsHidden(false);

        if (hideTimer.current !== null) {
          window.clearTimeout(hideTimer.current);
        }

        hideTimer.current = window.setTimeout(() => {
          if (!navRef.current?.contains(document.activeElement)) {
            setIsHidden(true);
          }
        }, 1400);
      } else if (!isAtPageEnd) {
        if (hideTimer.current !== null) {
          window.clearTimeout(hideTimer.current);
        }
        setIsHidden(true);
      }

      wasAtPageEnd.current = isAtPageEnd;
      frameId = null;
    };

    const handleScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateVisibility);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (hideTimer.current !== null) {
        window.clearTimeout(hideTimer.current);
      }
    };
  }, []);


  return (
    <nav
      ref={navRef}
      aria-label="Mobile navigation"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsHidden(true);
        }
      }}
      className={`fixed inset-x-3 bottom-[var(--mobile-dock-offset)] z-40 mx-auto max-w-xs rounded-2xl border border-border bg-background/95 p-1 shadow-lg transition-[transform,opacity] duration-200 ease-out has-[:focus-visible]:translate-y-0 has-[:focus-visible]:opacity-100 motion-reduce:transition-none md:hidden ${
        isHidden ? 'pointer-events-none translate-y-[calc(100%+2rem)] opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <ul className="m-0 grid list-none grid-cols-4 gap-0.5 p-0">
        {primaryNavigation.map(({ href, label }) => {
          const Icon = icons[href];
          const isCurrentPage = pathname === href;
          const isActive = isCurrentPage || (href !== '/' && pathname.startsWith(`${href}/`));

          return (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                onClick={() => setIsHidden(true)}
                aria-current={isCurrentPage ? 'page' : isActive ? 'location' : undefined}
                className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent motion-reduce:transition-none ${
                  isActive
                    ? 'bg-foreground/[0.08] font-medium text-foreground'
                    : 'text-muted hover:bg-foreground/[0.04] hover:text-foreground'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2 : 1.5} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
