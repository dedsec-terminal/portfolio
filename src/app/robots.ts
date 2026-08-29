import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    // A blanket allow includes search engines and AI search crawlers; the
    // named rules make that intent clear to crawler operators and reviewers.
    rules: [
      { userAgent: '*', allow: '/' },
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'Google-Extended',
          'OAI-SearchBot',
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-SearchBot',
          'PerplexityBot',
          'Applebot-Extended',
          'CCBot',
        ],
        allow: '/',
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
