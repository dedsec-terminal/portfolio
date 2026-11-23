import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { siteConfig } from '../src/lib/site';
import sitemap from '../src/app/sitemap';

// Inspect the generated pages rather than a second, manually maintained copy
// of their metadata. Run after npm run build.
const appDir = path.join(process.cwd(), '.next/server/app');
if (!fs.existsSync(appDir)) throw new Error('Run npm run build before verify:seo.');
let checked = 0;
const failures: string[] = [];
const descriptions = new Map<string, string>();
const entries = sitemap();
const urls = new Set(entries.map(({ url }) => url));
if (urls.size !== entries.length) failures.push('Sitemap contains duplicate URLs');
const robots = fs.readFileSync(path.join(appDir, 'robots.txt.body'), 'utf8');
if (!robots.split(/\r?\n/).includes(`Sitemap: ${siteConfig.url}/sitemap.xml`)) {
  failures.push('robots.txt does not advertise the canonical sitemap');
}
const sitemapXml = fs.readFileSync(path.join(appDir, 'sitemap.xml.body'), 'utf8');
const builtUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
if (builtUrls.length !== urls.size || new Set(builtUrls).size !== urls.size ||
    builtUrls.some((url) => !urls.has(url))) {
  failures.push('Built sitemap URLs differ from the published route inventory');
}
const collections = new Set(['/projects', '/writeups', '/journal', '/art']);
const sizes: Array<{ route: string; gzipBytes: number }> = [];

for (const entry of entries) {
  const route = new URL(entry.url).pathname;
  const file = path.join(appDir, route === '/' ? 'index.html' : `${route.slice(1)}.html`);
  if (!fs.existsSync(file)) { failures.push(`${route}: built HTML missing`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const meta = (key: string) => {
    const tag = [...html.matchAll(/<meta\s[^>]*>/g)].map(([value]) => value)
      .find((value) => value.includes(`name="${key}"`) || value.includes(`property="${key}"`));
    return tag?.match(/content="([^"]*)"/)?.[1] ?? '';
  };
  const description = meta('description');
  if (!description.trim()) failures.push(`${route}: description missing`);
  if (description && descriptions.has(description)) failures.push(`${route}: duplicate description with ${descriptions.get(description)}`);
  descriptions.set(description, route);
  if (meta('og:description') !== description) failures.push(`${route}: Open Graph description differs`);
  if (meta('twitter:description') !== description) failures.push(`${route}: Twitter description differs`);
  if (!/<title>[^<]+<\/title>/.test(html)) failures.push(`${route}: title missing`);
  if (!html.includes(`rel="canonical" href="${entry.url}"`)) failures.push(`${route}: canonical missing or incorrect`);
  if (/noindex/i.test(meta('robots'))) failures.push(`${route}: sitemap page is noindex`);
  if (meta('og:url') !== entry.url) failures.push(`${route}: Open Graph URL differs`);

  const scripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  const nodes = scripts.flatMap(([, json]) => {
    try {
      const data = JSON.parse(json);
      return data['@graph'] ?? [data];
    } catch {
      failures.push(`${route}: invalid JSON-LD`);
      return [];
    }
  });
  if (collections.has(route)) {
    const collection = nodes.find((node) => node['@type'] === 'CollectionPage');
    const items = collection?.mainEntity?.itemListElement;
    const expected = [...urls].filter((url) => url.startsWith(`${entry.url}/`));
    if (collection?.url !== entry.url || collection?.mainEntity?.['@type'] !== 'ItemList' ||
        !Array.isArray(items) || new Set(items.map((item) => item.url)).size !== expected.length ||
        items.length !== expected.length || items.some((item, i) =>
          !expected.includes(item.url) || item.position !== i + 1 || !item.name ||
          !html.includes(`href="${new URL(item.url).pathname}"`))) {
      failures.push(`${route}: collection markup differs from published content`);
    }
  }

  const [, section, slug] = route.split('/');
  if (slug && (collections.has(`/${section}`) || section === 'blog')) {
    const list = nodes.find((node) => node['@type'] === 'BreadcrumbList')?.itemListElement;
    if (!Array.isArray(list) || list.length < 2 || list.at(-1)?.item !== entry.url ||
        list.some((item, i) => item.position !== i + 1 || !item.name || !urls.has(item.item))) {
      failures.push(`${route}: invalid breadcrumb trail`);
    }
  }

  for (const image of entry.images ?? []) {
    const imagePath = new URL(image).pathname;
    if (!fs.existsSync(path.join('public', imagePath.slice(1)))) {
      failures.push(`${route}: missing sitemap image ${imagePath}`);
    }
  }

  const seoMarkup = scripts.map(([script]) => script).join('');
  sizes.push({ route, gzipBytes: gzipSync(seoMarkup).length });
  checked++;
}
if (failures.length) throw new Error(failures.join('\n'));
console.log(`Verified sitemap, robots.txt, metadata, collections, breadcrumbs and image files across ${checked} built pages.`);
const largest = sizes.reduce((max, page) => page.gzipBytes > max.gzipBytes ? page : max);
console.log(`Largest JSON-LD payload: ${largest.gzipBytes} gzip bytes (${largest.route}).`);
