import type { Metadata } from 'next';
import ContentIndex from '@/components/content/ContentIndex';
import { getContent } from '@/lib/content';

export const metadata: Metadata = { title: 'Art', description: 'A visual archive of media and personal references.' };
export default function ArtPage() { return <ContentIndex type="art" items={getContent('art')} />; }
