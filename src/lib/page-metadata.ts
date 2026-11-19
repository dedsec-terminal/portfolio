import type { Metadata } from 'next';
import { siteConfig } from './site';

/** Keep search and share descriptions consistent for authored static pages. */
export function pageMetadata(metadata: Metadata): Metadata {
  const title = typeof metadata.title === 'string' ? metadata.title : siteConfig.title;
  const description = metadata.description ?? siteConfig.description;
  const canonical = metadata.alternates?.canonical;
  const url = canonical && typeof canonical === 'object' && !(canonical instanceof URL)
    ? canonical.url : canonical ?? '/';
  const image = `${siteConfig.url}/images/og/og-default.jpg`;
  return {
    ...metadata,
    openGraph: {
      type: 'website', title, description, url,
      images: [{ url: image, width: 1200, height: 630, alt: siteConfig.title }],
      ...metadata.openGraph,
    },
    twitter: { card: 'summary_large_image', title, description, images: [image], ...metadata.twitter },
  };
}
