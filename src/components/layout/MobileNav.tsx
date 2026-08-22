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
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/40"
      style={{
        backgroundColor:
          'color-mix(in srgb, var(--background) 92%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <ul className="flex items-stretch list-none m-0 p-0">
        {primaryNavigation.map(({ href, label }) => {
          const Icon = icons[href];
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex flex-col items-center justify-center gap-1 py-3 w-full text-[10px] tracking-wide transition-colors duration-200',
                  isActive ? 'text-accent' : 'text-muted hover:text-foreground',
                ].join(' ')}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2 : 1.5}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
