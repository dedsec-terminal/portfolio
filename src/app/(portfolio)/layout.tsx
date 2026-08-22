import TopNav from '@/components/layout/TopNav';
import MobileNav from '@/components/layout/MobileNav';
import SiteFooter from '@/components/layout/SiteFooter';
import { MusicProvider } from '@/components/features/music/MusicProvider';

export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MusicProvider>
      <TopNav />
      {/* main has no horizontal constraint — pages control their own layout */}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <MobileNav />
    </MusicProvider>
  );
}
