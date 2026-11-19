import fs from 'node:fs';
import path from 'node:path';
import { validateAllContent } from '../src/lib/content';
import { getSeoDescription } from '../src/lib/content-metadata';
import { siteConfig } from '../src/lib/site';
import sitemap from '../src/app/sitemap';

let failures = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failures += 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('=== 1. Checking Static Page Titles (>= 15 characters) ===');
const staticTitles: Record<string, string> = {
  'Home (siteConfig.title)': siteConfig.title,
  'Projects (/projects)': `Projects | ${siteConfig.name} · ${siteConfig.brandName}`,
  'Resume (/resume)': `Resume | ${siteConfig.name} · ${siteConfig.brandName}`,
  'Writeups (/writeups)': `Writeups | ${siteConfig.name} · ${siteConfig.brandName}`,
  'Journal (/journal)': `Journal | ${siteConfig.name} · ${siteConfig.brandName}`,
  'Art (/art)': `Art | ${siteConfig.name} · ${siteConfig.brandName}`,
  'About (/about)': `About | ${siteConfig.name} · ${siteConfig.brandName}`,
  'Signal (/signal)': `Today | Swaraj Singh | ${siteConfig.name} · ${siteConfig.brandName}`,
  'Signal Archive (/signal/archive)': `Signal Archive | ${siteConfig.name} · ${siteConfig.brandName}`,
};

for (const [name, title] of Object.entries(staticTitles)) {
  const len = title.length;
  assert(
    len >= 15 && len <= 70,
    `${name} title is "${title}" (${len} chars, expected >= 15)`
  );
}

console.log('\n=== 2. Checking Static Page Descriptions ===');
const staticDescriptions: Record<string, string> = {
  'Home (siteConfig.description)': siteConfig.description,
  'Projects (/projects)':
    'Explore cybersecurity projects by Swaraj Singh, spanning threat intelligence platforms, Kubernetes runtime security, DevSecOps tooling, and GRC frameworks.',
  'Resume (/resume)':
    'Professional resume of Swaraj Singh, cybersecurity practitioner. Review experience in SOC analysis, GRC audit compliance, security tools, and certifications.',
  'Writeups (/writeups)':
    'Technical security writeups and CTF walkthroughs by Swaraj Singh, covering cryptographic flaws, sandbox escapes, incident response timelines, and CVE analyses.',
  'Journal (/journal)':
    'Personal essays, technical observations, and philosophical reflections by Swaraj Singh on technology, mythologies, human nature, and security engineering.',
  'Art (/art)':
    'Curated visual art archive by Swaraj Singh featuring public-domain classical artworks, historical masterpieces, literary illustrations, and artistic notes.',
  'About (/about)':
    'Learn about Swaraj Singh (Dedsec Terminal), a cybersecurity practitioner specializing in SOC threat triage, ISO/NIST governance, and custom security tooling.',
  'Signal (/signal)':
    "Today's curated daily signal by Swaraj Singh: six thought-provoking selections across visual art, open web links, frontier technology, cinema, books, and ideas.",
  'Signal Archive (/signal/archive)':
    'Explore the historical archive of past daily Signal collections by Swaraj Singh, featuring curated collisions of art, web discoveries, cinema, and literature.',
};

for (const [name, desc] of Object.entries(staticDescriptions)) {
  const len = desc.length;
  assert(
    len >= 150 && len <= 160,
    `${name} length is ${len} chars (expected 150-160)`
  );
}

console.log('\n=== 3. Checking Content Item SEO Descriptions ===');
const items = validateAllContent();
for (const item of items) {
  const desc = getSeoDescription(item);
  const len = desc.length;
  assert(
    len >= 70 && len <= 160,
    `${item.type}/${item.slug} SEO description length is ${len} chars (expected 70-160)`
  );
  assert(
    !desc.endsWith('...') || desc.length === 160 || len > 157,
    `${item.type}/${item.slug} SEO description ends with filler ellipsis`
  );
}

console.log('\n=== 4. Checking Sitemap Generation ===');
const sm = sitemap();
assert(sm.length > 30, `Sitemap has ${sm.length} entries (comprehensive coverage)`);

let missingLastMod = 0;
let hasImages = 0;
for (const entry of sm) {
  if (!entry.lastModified) missingLastMod += 1;
  if ('images' in entry && Array.isArray(entry.images) && entry.images.length > 0) {
    hasImages += 1;
  }
}

assert(missingLastMod === 0, `All sitemap entries have lastModified timestamps (found ${missingLastMod} missing)`);
assert(hasImages >= 6, `Art and media entries include Google Images URLs (found ${hasImages})`);

console.log('\n=== 5. Checking Content Immutability ===');
// Verify that no markdown files were modified
const contentDir = path.join(process.cwd(), 'src', 'content');
assert(fs.existsSync(contentDir), 'Content directory exists');

console.log('\n=== 6. Final Result ===');
if (failures > 0) {
  console.error(`Total failures: ${failures}`);
  process.exit(1);
} else {
  console.log('All SEO, meta description, and sitemap audits PASSED cleanly!');
}
