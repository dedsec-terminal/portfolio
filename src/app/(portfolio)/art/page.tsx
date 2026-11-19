import type { Metadata } from 'next';
import ContentIndex from '@/components/content/ContentIndex';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Art',
  description:
    'Curated visual art archive by Swaraj Singh featuring public-domain classical artworks, historical masterpieces, literary illustrations, and artistic notes.',
  alternates: { canonical: '/art' },
};
export default function ArtPage() { return <ContentIndex type="art" items={getContent('art')} />; }
