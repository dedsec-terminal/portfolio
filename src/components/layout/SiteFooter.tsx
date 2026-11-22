import Link from 'next/link';
import { footerNavigation } from '@/lib/navigation';
import { siteConfig } from '@/lib/site';

const navigationData = {
  '@context': 'https://schema.org',
  '@graph': footerNavigation.filter(({ href }) => href !== '/').map(({ href, label }) => ({
    '@type': 'SiteNavigationElement',
    '@id': `${siteConfig.url}/#nav${href.replace('/', '-')}`,
    name: label,
    url: `${siteConfig.url}${href}`,
  })),
};

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="glass-surface mt-2 rounded-t-xl border-x-0 border-b-0 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:mt-4 md:rounded-t-2xl md:py-5"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left */}
        <p className="font-mono text-[11px] leading-4 text-subtle md:text-xs md:tracking-wider">
          Dedsec Terminal · © {year} Swaraj Singh
        </p>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(navigationData).replace(/</g, '\\u003c'),
          }}
        />
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 list-none m-0 p-0">
            {footerNavigation.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  prefetch={false}
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
