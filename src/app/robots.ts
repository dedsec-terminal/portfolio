import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    // A blanket allow includes search engines and AI search crawlers; the
    // named rules make that intent clear to crawler operators and reviewers.
    rules: [
      { userAgent: '*', allow: '/' },
      {
        userAgent: ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'GPTBot', 'ChatGPT-User'],
        allow: '/',
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
