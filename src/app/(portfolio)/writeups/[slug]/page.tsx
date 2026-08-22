import { notFound } from 'next/navigation';
import ContentArticle from '@/components/content/ContentArticle';
import { getContent, getContentBySlug, getRelatedContent } from '@/lib/content';
import { contentMetadata } from '@/lib/content-metadata';

export const dynamicParams = false;
export function generateStaticParams() { return getContent('writeups').map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const item = getContentBySlug('writeups', (await params).slug);
  if (!item) notFound();
  return contentMetadata(item);
}
export default async function WriteupPage({ params }: { params: Promise<{ slug: string }> }) {
  const item = getContentBySlug('writeups', (await params).slug);
  if (!item) notFound();
  return <ContentArticle item={item} related={getRelatedContent(item)} />;
}
