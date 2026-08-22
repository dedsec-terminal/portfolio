import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

const routes = [
  { path: '/', changeFrequency: 'monthly', priority: 1 },
  { path: '/resume', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/signal', changeFrequency: 'daily', priority: 0.7 },
  { path: '/signal/archive', changeFrequency: 'weekly', priority: 0.5 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteConfig.url) return [];
  return routes.map((route) => ({
    ...route,
    url: new URL(route.path, `${siteConfig.url}/`).toString(),
  }));
}
