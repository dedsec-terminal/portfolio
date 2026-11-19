import Link from 'next/link';
import { primaryNavigation } from '@/lib/navigation';

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="glass-surface mt-4 rounded-t-2xl border-x-0 border-b-0 pt-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] md:py-5"
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left */}
        <p className="text-xs text-subtle font-mono tracking-wider">
          Dedsec Terminal · © {year} Swaraj Singh
        </p>

        {/* Right — sparse links */}
        <nav aria-label="Footer navigation" className="hidden sm:block">
          <ul className="flex items-center gap-5 list-none m-0 p-0">
            {primaryNavigation.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-xs text-subtle hover:text-muted transition-colors duration-200"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
