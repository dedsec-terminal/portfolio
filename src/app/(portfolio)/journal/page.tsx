import { pageMetadata } from '@/lib/page-metadata';
import type { Metadata } from 'next';
import ContentIndex from '@/components/content/ContentIndex';
import { getContent } from '@/lib/content';

export const metadata: Metadata = pageMetadata({
  title: 'Journal',
  description:
    'Personal essays, technical observations, and philosophical reflections by Swaraj Singh on technology, mythologies, human nature, and security engineering.',
  alternates: { canonical: '/journal' },
});
export default function JournalPage() { return <ContentIndex type="journal" items={getContent('journal')} />; }
