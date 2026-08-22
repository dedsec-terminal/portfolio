import type { Metadata } from 'next';
import ContentIndex from '@/components/content/ContentIndex';
import { getContent } from '@/lib/content';

export const metadata: Metadata = { title: 'Blog', description: 'Technical notes on security, systems, and learning.' };
export default function BlogPage() { return <ContentIndex type="blog" items={getContent('blog')} />; }
