import Hero from '@/components/features/Hero';
import WriteupRow from '@/components/features/WriteupRow';
import JournalTeaser from '@/components/features/JournalTeaser';
import ArtPreview from '@/components/features/ArtPreview';

/*
  Page composition order (intentional):

  1. Hero         — identity, full viewport, the opening statement
  2. Writeups     — security work
  3. Journal      — personal writing and observations
  4. Art & Media  — visual work
*/

export default function HomePage() {
  return (
    <>
      <div className="relative z-10">
        <Hero />

        <WriteupRow />

        <JournalTeaser />

        <ArtPreview />

        {/* Bottom padding for mobile nav */}
        <div className="h-16 md:hidden" aria-hidden="true" />
      </div>
    </>
  );
}
