import PlaybackControl from '@/components/features/music/PlaybackControl';
import TopNav from '@/components/layout/TopNav';
import MobileNav from '@/components/layout/MobileNav';
import SiteFooter from '@/components/layout/SiteFooter';
import { MusicProvider } from '@/components/features/music/MusicProvider';
import SiteShaderBackground from '@/components/features/SiteShaderBackground';

export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MusicProvider>
      <div className="relative isolate flex min-h-screen flex-1 flex-col overflow-x-clip">
        <SiteShaderBackground />
        <div className="relative z-10 flex min-h-screen flex-1 flex-col pb-[var(--mobile-dock-space)] [--mobile-dock-offset:calc(env(safe-area-inset-bottom)+0.5rem)] [--mobile-dock-space:calc(var(--mobile-dock-offset)+3.375rem)] md:pb-0">
          <TopNav />
          {/* main has no horizontal constraint — pages control their own layout */}
          <main id="main-content" tabIndex={-1} className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <MobileNav />
          <PlaybackControl />
        </div>
      </div>
    </MusicProvider>
  );
}
