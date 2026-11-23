export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="glass-surface mt-2 rounded-t-xl border-x-0 border-b-0 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:mt-4 md:rounded-t-2xl md:py-2"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <p className="font-mono text-[11px] leading-4 text-subtle md:text-xs md:tracking-wider">
          Dedsec Terminal · © {year} Swaraj Singh
        </p>
      </div>
    </footer>
  );
}
