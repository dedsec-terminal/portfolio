import type { Metadata } from 'next';
import ContentIndex from '@/components/content/ContentIndex';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Writeups',
  description:
    'Technical security writeups and CTF walkthroughs by Swaraj Singh, covering cryptographic flaws, sandbox escapes, incident response timelines, and CVE analyses.',
  alternates: { canonical: '/writeups' },
};

export default function WriteupsPage() {
  return <ContentIndex type="writeups" items={getContent('writeups')} />;
}
