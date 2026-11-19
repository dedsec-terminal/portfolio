import FeaturedProjects from '@/components/features/FeaturedProjects';
import type { Metadata } from 'next';
import Hero from '@/components/features/Hero';
import WriteupRow from '@/components/features/WriteupRow';
import JournalTeaser from '@/components/features/JournalTeaser';
import ArtPreview from '@/components/features/ArtPreview';

export const metadata: Metadata = {
  title: {
    absolute: 'Swaraj Singh · Dedsec Terminal',
  },
  alternates: { canonical: '/' },
};

/*
  Page composition order (intentional):

  1. Hero         — identity, full viewport, the opening statement
  2. Projects     — engineering case studies
  3. Writeups     — security work
  4. Journal      — personal writing and observations
  5. Art & Media  — visual work
*/

export default function HomePage() {
  return (
    <>
      <div className="relative z-10">
        <Hero />

        <FeaturedProjects />

        <WriteupRow />

        <JournalTeaser />

        <ArtPreview />

        {/* Bottom padding for mobile nav */}
        <div className="h-16 md:hidden" aria-hidden="true" />
      </div>
    </>
  );
}
