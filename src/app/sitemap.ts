import fs from 'node:fs';
import path from 'node:path';
import type { MetadataRoute } from 'next';
import { contentTypes, getContent } from '@/lib/content';
import { siteConfig } from '@/lib/site';

function latestDate(items: Array<{ date: string; updatedAt?: string }>): string | null {
  let latest: string | null = null;

  for (const item of items) {
    const candidate = item.updatedAt ?? item.date;
    if (!latest || candidate > latest) latest = candidate;
  }

  return latest;
}

function toDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function readSignalDate(): string | null {
  try {
    const filePath = path.join(process.cwd(), 'signal', 'current.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as {
      date?: unknown;
    };
    return typeof data.date === 'string' && !Number.isNaN(new Date(data.date).getTime())
      ? data.date
      : null;
  } catch {
    return null;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, '');

  // One validated read per collection; getContent is memoized in production.
  const allContent = contentTypes.flatMap((type) => getContent(type));

  const latestByType = new Map(
    contentTypes.map((type) => [type, latestDate(getContent(type))] as const),
  );

  const siteLatest = latestDate(allContent) ?? new Date().toISOString().split('T')[0];
  const signalDate = readSignalDate() ?? siteLatest;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}`,
      lastModified: toDate(siteLatest),
      changeFrequency: 'daily',
      priority: 1.0,
      images: [`${base}/images/og/og-default.jpg`],
    },
    {
      url: `${base}/projects`,
      lastModified: toDate(latestByType.get('projects') ?? siteLatest),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${base}/writeups`,
      lastModified: toDate(latestByType.get('writeups') ?? siteLatest),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${base}/signal`,
      lastModified: toDate(signalDate),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${base}/resume`,
      lastModified: toDate(siteLatest),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/about`,
      lastModified: toDate(siteLatest),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/journal`,
      lastModified: toDate(latestByType.get('journal') ?? siteLatest),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${base}/blog`,
      lastModified: toDate(latestByType.get('blog') ?? siteLatest),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${base}/signal/archive`,
      lastModified: toDate(signalDate),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${base}/art`,
      lastModified: toDate(latestByType.get('art') ?? siteLatest),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const contentRoutes: MetadataRoute.Sitemap = allContent.map((item) => {
    const itemDate = new Date(item.updatedAt ?? item.date);
    const itemImages =
      item.type === 'art' && 'media' in item && Array.isArray(item.media)
        ? item.media.map((m) => `${base}${m.src}`)
        : undefined;

    const priority =
      item.type === 'projects' || item.type === 'writeups' ? 0.85 : 0.75;

    return {
      url: `${base}/${item.type}/${item.slug}`,
      lastModified: Number.isNaN(itemDate.getTime()) ? toDate(siteLatest) : itemDate,
      changeFrequency: 'monthly' as const,
      priority,
      ...(itemImages && itemImages.length > 0 ? { images: itemImages } : {}),
    };
  });

  return [...staticRoutes, ...contentRoutes];
}
