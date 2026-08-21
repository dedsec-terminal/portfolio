import ShaderBackground from '@/components/background/ShaderBackground';
import Hero from '@/components/features/Hero';
import SignalShell from '@/components/features/SignalShell';
import ProjectsGrid from '@/components/features/ProjectsGrid';
import BlogTeaser from '@/components/features/BlogTeaser';
import WriteupRow from '@/components/features/WriteupRow';
import ArtPreview from '@/components/features/ArtPreview';

/*
  Page composition order (intentional):

  1. Background   — R3F WebGL procedural atmosphere
  2. Hero         — identity, full viewport, the opening statement
  3. Signal       — signature element, placed high to establish identity
                    before the professional content inventory
  4. Projects     — professional work, prioritized over writeups
  5. Writing      — blog posts, separate from writeups
  6. Writeups     — compact; not the centerpiece
  7. Personal     — music + art; ambient, personal layer
*/

export default function HomePage() {
  return (
    <>
      <ShaderBackground />

      <div className="relative z-10">
        <Hero />

        <SignalShell />

        <ProjectsGrid />

        <BlogTeaser />

        <WriteupRow />

        {/* Personal layer — ambient, compact, grouped at the end */}
        <section
          aria-label="Personal"
          className="py-16 md:py-20 border-t border-border/30"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
            {/* Art / media */}
            <ArtPreview />
          </div>
        </section>

        {/* Bottom padding for mobile nav */}
        <div className="h-16 md:hidden" aria-hidden="true" />
      </div>
    </>
  );
}

