import type { MetadataRoute } from 'next';
import { contentTypes, getContent } from '@/lib/content';
import { siteConfig } from '@/lib/site';

const routes = [
  { path: '/', changeFrequency: 'monthly', priority: 1 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/projects', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/writeups', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/journal', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/art', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/resume', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/signal', changeFrequency: 'daily', priority: 0.7 },
  { path: '/signal/archive', changeFrequency: 'weekly', priority: 0.5 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = routes.map((route) => ({
    ...route,
    url: new URL(route.path, `${siteConfig.url}/`).toString(),
  }));

  const contentRoutes = contentTypes.filter((type) => type !== 'blog').flatMap((type) =>
    getContent(type).map((item) => ({
      url: new URL(`/${type}/${item.slug}`, `${siteConfig.url}/`).toString(),
      lastModified: item.updatedAt ?? item.date,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  );

  return [...staticRoutes, ...contentRoutes];
}
