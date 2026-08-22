import type { Metadata } from 'next';
import ContentIndex from '@/components/content/ContentIndex';
import { getContent } from '@/lib/content';

export const metadata: Metadata = { title: 'Writeups', description: 'CTF and security challenge writeups.' };

export default function WriteupsPage() {
  return <ContentIndex type="writeups" items={getContent('writeups')} />;
}
