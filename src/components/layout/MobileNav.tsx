'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-3 bottom-[var(--mobile-dock-offset)] z-40 mx-auto max-w-xs rounded-2xl border border-border bg-background/95 p-1 shadow-lg md:hidden"
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
