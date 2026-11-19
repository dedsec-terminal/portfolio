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
      className="fixed inset-x-3 z-40 mx-auto max-w-md overflow-hidden rounded-3xl border border-foreground/10 shadow-[0_12px_36px_rgb(0_0_0_/_28%)] ring-1 ring-inset ring-foreground/[0.04] md:hidden"
      style={{
        bottom:
          'max(0.75rem, calc(env(safe-area-inset-bottom) + 0.75rem))',
        backgroundColor:
          'color-mix(in srgb, var(--background) 92%, transparent)',
        backdropFilter: 'blur(24px) saturate(125%)',
        WebkitBackdropFilter: 'blur(24px) saturate(125%)',
      }}
    >
      <ul className="m-0 flex list-none items-stretch gap-1 p-1">
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
                  'flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] tracking-wide transition-colors duration-300',
                  isActive
                    ? 'bg-accent/[0.08] text-accent'
                    : 'text-muted hover:bg-foreground/[0.04] hover:text-foreground',
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
