import type { MetadataRoute } from 'next';
import { contentTypes, getContent } from '@/lib/content';
import { siteConfig } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, '');
  const now = new Date();

  // Find latest content date to accurately reflect collection freshness
  const allContent = contentTypes
    .filter((type) => type !== 'blog')
    .flatMap((type) => getContent(type));

  const latestProjectDate =
    getContent('projects')[0]?.updatedAt ??
    getContent('projects')[0]?.date ??
    now.toISOString().split('T')[0];

  const latestWriteupDate =
    getContent('writeups')[0]?.updatedAt ??
    getContent('writeups')[0]?.date ??
    now.toISOString().split('T')[0];

  const latestJournalDate =
    getContent('journal')[0]?.updatedAt ??
    getContent('journal')[0]?.date ??
    now.toISOString().split('T')[0];

  const latestArtDate =
    getContent('art')[0]?.updatedAt ??
    getContent('art')[0]?.date ??
    now.toISOString().split('T')[0];

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
      images: [`${base}/images/avatar/pfp.jpg`],
    },
    {
      url: `${base}/projects`,
      lastModified: new Date(latestProjectDate),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${base}/writeups`,
      lastModified: new Date(latestWriteupDate),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${base}/signal`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${base}/resume`,
      lastModified: new Date('2026-11-19'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/about`,
      lastModified: new Date('2026-11-19'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/journal`,
      lastModified: new Date(latestJournalDate),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${base}/signal/archive`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${base}/art`,
      lastModified: new Date(latestArtDate),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const contentRoutes: MetadataRoute.Sitemap = allContent.map((item) => {
    const rawDate = item.updatedAt ?? item.date;
    const itemDate = new Date(rawDate);
    const itemImages =
      item.type === 'art' && 'media' in item && Array.isArray(item.media)
        ? item.media.map((m) => `${base}${m.src}`)
        : undefined;

    const priority =
      item.type === 'projects' || item.type === 'writeups' ? 0.85 : 0.75;

    return {
      url: `${base}/${item.type}/${item.slug}`,
      lastModified: isNaN(itemDate.getTime()) ? now : itemDate,
      changeFrequency: 'monthly' as const,
      priority,
      ...(itemImages && itemImages.length > 0 ? { images: itemImages } : {}),
    };
  });

  return [...staticRoutes, ...contentRoutes];
}
