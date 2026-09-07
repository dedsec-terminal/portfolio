import type { Metadata } from 'next';
import ContentIndex from '@/components/content/ContentIndex';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Personal writing and observations.',
  alternates: { canonical: '/journal' },
};
export default function JournalPage() { return <ContentIndex type="journal" items={getContent('journal')} />; }
