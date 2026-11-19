import type { Metadata } from 'next';
import type { ContentItem } from '@/lib/content';
import { getPublicImageDimensions } from '@/lib/image-dimensions';
import { siteConfig } from '@/lib/site';

const itemSeoDescriptions: Record<string, string> = {
  // Writeups
  'writeups/breaking-python-jail-mro':
    'A conceptual study of Python object traversal, restricted eval, and the evidence needed to establish a sandbox bypass against a specific input filter.',
  'writeups/caesars-drift':
    'An offline cryptography CTF challenge by Swaraj Singh where a known flag prefix reveals a fixed alphabet shift, demonstrating classical ciphertext analysis.',
  'writeups/fools-mate-revenge':
    'A conceptual walkthrough of unsafe object merging in a settings API, showing how prototype pollution can cross a security trust boundary.',
  'writeups/from-alert-to-timeline':
    'A tabletop investigation that reconstructs a sign-in timeline across time zones, tests a competing session match, and records what the evidence supports.',
  'writeups/n8n-cve-2026-119408':
    'Technical advisory on n8n CVE-2026-119408: security upgrade impact, auditing saved workflows for legacy code nodes, and responding to credential exposure.',
  'writeups/padding-boundary-oracle':
    'A cryptographic security walkthrough of exploiting a CBC-mode padding oracle vulnerability to decrypt sensitive ciphertext byte by byte without the key.',
  'writeups/the-unpadded-wire':
    'An offline cryptography CTF puzzle by Swaraj Singh analyzing bitstream framing and character boundary reconstruction from raw unpadded binary transmissions.',

  // Journal
  'journal/dont-look-back-myths':
    'Personal reflection by Swaraj Singh on mythological warnings against looking back, ancient folklore patterns, and what etiological narratives preserve.',
  'journal/reverend-insanity-human-nature':
    'Why an unforgiving story about incentives, freedom, and perseverance becomes a compelling study of human nature rather than a simple celebration of cruelty.',

  // Art
  'art/island-of-the-dead':
    'Arnold Böcklin stages a quiet crossing toward sheer rock portals and tall cypresses, treating grief as a quiet transition rather than an abrupt ending.',
  'art/orpheus-and-eurydice':
    'Analysis of Edward John Poynter\'s 1862 painting staging Orpheus leading Eurydice from the underworld into an uncertain light, exploring memory and devotion.',
  'art/the-sleep-of-reason':
    'Critical study of Francisco Goya\'s etching The Sleep of Reason Produces Monsters, examining nighttime nightmares and reason abandoned to unchecked fantasy.',
  'art/the-strangling':
    'A compressed black-and-white crowd study where fear, force, and spectatorship collapse into an intense human knot, exploring themes of anxiety and power.',
  'art/turner-whalers':
    'An examination of J. M. W. Turner\'s maritime masterpiece Whalers, analyzing atmospheric sea mist, marine hunting danger, and dissolving impressionistic forms.',
  'art/wanderer-above-the-sea-of-fog':
    'Caspar David Friedrich\'s solitary romantic wanderer stands above an Alpine sea of fog, contemplating sublime nature, conquest, uncertainty, and selfhood.',
};

export function getSeoDescription(item: ContentItem): string {
  // Project summaries are shared by tiles, page introductions, and previews.
  if (item.type === 'projects' && item.description) return item.description;

  const key = `${item.type}/${item.slug}`;
  if (itemSeoDescriptions[key]) {
    return itemSeoDescriptions[key];
  }

  const raw = (item.description ?? item.title ?? siteConfig.description).trim();
  if (!raw) return siteConfig.description;

  // Never pad with filler characters to hit a length target. A shorter,
  // clean description reads better in a search result than dotted padding.
  const suffix = ' — Written by Swaraj Singh for Dedsec Terminal.';
  if (raw.length < 120 && `${raw}${suffix}`.length <= 160) {
    return `${raw}${suffix}`;
  }

  return raw.length <= 160 ? raw : `${raw.slice(0, 157)}...`;
}

export function contentMetadata(item: ContentItem): Metadata {
  const path = `/${item.type}/${item.slug}`;
  const seoDescription = getSeoDescription(item);
  const mediaItem = item.type === 'art' && item.media?.[0] ? item.media[0] : null;
  const mediaDimensions = mediaItem ? getPublicImageDimensions(mediaItem.src) : null;
  const ogImage = mediaItem
    ? {
        url: `${siteConfig.url}${mediaItem.src}`,
        alt: mediaItem.alt || item.title,
        ...(mediaDimensions ?? {}),
      }
    : {
        url: `${siteConfig.url}/images/og/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} · ${siteConfig.brandName}`,
      };

  return {
    title: item.title,
    description: seoDescription,
    alternates: { canonical: path },
    openGraph: {
      title: item.title,
      description: seoDescription,
      type: 'article',
      url: path,
      publishedTime: `${item.date}T00:00:00.000Z`,
      modifiedTime: item.updatedAt ? `${item.updatedAt}T00:00:00.000Z` : undefined,
      tags: item.tags,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: seoDescription,
      images: [ogImage.url],
    },
  };
}
