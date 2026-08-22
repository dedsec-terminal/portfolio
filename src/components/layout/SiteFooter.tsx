export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-border/40 py-8"
      /* Extra bottom padding on mobile to clear the fixed bottom nav */
      style={{ paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom) + 4rem))' }}
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left */}
        <p className="text-xs text-subtle font-mono tracking-wider">
          © {year} Swaraj Singh
        </p>

        {/* Right — sparse links */}
        <nav aria-label="Footer navigation">
          <ul className="flex items-center gap-5 list-none m-0 p-0">
            {[
              { href: '/projects', label: 'Projects' },
              { href: '/writeups', label: 'Writeups' },
              { href: '/journal', label: 'Journal' },
              { href: '/art', label: 'Art' },
              { href: '/signal', label: 'Signal' },
            ].map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-xs text-subtle hover:text-muted transition-colors duration-200"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
