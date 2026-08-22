import type { Metadata } from 'next';
import type { ContentItem } from '@/lib/content';

export function contentMetadata(item: ContentItem): Metadata {
  const path = `/${item.type}/${item.slug}`;
  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: path },
    openGraph: {
      title: item.title,
      description: item.description,
      type: 'article',
      url: path,
      publishedTime: `${item.date}T00:00:00.000Z`,
      modifiedTime: item.updatedAt ? `${item.updatedAt}T00:00:00.000Z` : undefined,
      tags: item.tags,
    },
  };
}
