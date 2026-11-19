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

  // Projects
  'projects/agentic-iac-vulnerability-detection':
    'Automated DevSecOps workflow by Swaraj Singh for detecting and remediating Infrastructure as Code security misconfigurations using AI agents and policy rules.',
  'projects/apex-capital-grc':
    'An illustrative GRC design case study mapping business risks to NIST and ISO controls, with proposed incident tabletop exercises and evidence requirements.',
  'projects/faultplane':
    'Faultplane aggregates security advisories, enriches them with NVD and CISA KEV context, and publishes scheduled vulnerability summaries using GitHub Actions.',
  'projects/ghostwire':
    'Ghostwire is a local-first security CLI and browser utility by Swaraj Singh for rapid cryptographic hashing, base encoding, and classical cipher cryptanalysis.',
  'projects/greyfield':
    'Greyfield is an open-source defensive cloud honeypot and privacy-governed threat intelligence observatory built by Swaraj Singh to capture live reconnaissance.',
  'projects/kubesentinel':
    'A local Kubernetes security lab by Swaraj Singh demonstrating pod hardening, Falco runtime threat detection, network policies, and audit telemetry pipelines.',
  'projects/ledgercast':
    'LedgerCast is an automated ITGC and SOX compliance assessment toolkit created by Swaraj Singh to evaluate financial systems, access controls, and audit trails.',
  'projects/policyforge':
    'PolicyForge is an illustrative fintech GRC portfolio by Swaraj Singh demonstrating practical policy frameworks, ISO 27001 mappings, and risk governance models.',
  'projects/traceir':
    'TraceIR is a digital forensics and incident investigation toolkit by Swaraj Singh that transforms raw endpoint telemetry into chronological evidence timelines.',
  'projects/vendor-assurance-desk':
    'A third-party supplier risk dashboard by Swaraj Singh simulating complete vendor lifecycle management from due diligence assessment to remediation tracking.',
  'projects/youtube-window-theater':
    'A lightweight Chrome and Firefox browser extension by Swaraj Singh that maximizes YouTube video playback to browser window dimensions with seamless controls.',
};

export function getSeoDescription(item: ContentItem): string {
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
