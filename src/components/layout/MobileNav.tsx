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
      className="fixed inset-x-3 z-40 mx-auto max-w-md overflow-hidden rounded-2xl border border-border/50 shadow-[0_18px_48px_rgb(0_0_0_/_42%)] md:hidden"
      style={{
        bottom:
          'max(0.75rem, calc(env(safe-area-inset-bottom) + 0.75rem))',
        backgroundColor:
          'color-mix(in srgb, var(--background) 68%, transparent)',
        backdropFilter: 'blur(18px) saturate(115%)',
        WebkitBackdropFilter: 'blur(18px) saturate(115%)',
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
                  'flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] tracking-wide transition-colors duration-200',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:bg-foreground/5 hover:text-foreground',
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
