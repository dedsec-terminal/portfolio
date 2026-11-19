import fs from 'node:fs';
import path from 'node:path';
import sitemap from '../src/app/sitemap';

// Inspect the generated pages rather than a second, manually maintained copy
// of their metadata. Run after npm run build.
const appDir = path.join(process.cwd(), '.next/server/app');
if (!fs.existsSync(appDir)) throw new Error('Run npm run build before verify:seo.');
let checked = 0;
const failures: string[] = [];
const descriptions = new Map<string, string>();
for (const entry of sitemap()) {
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
  checked++;
}
if (failures.length) throw new Error(failures.join('\n'));
console.log(`Verified title, unique description, share descriptions and canonical in ${checked} built pages.`);
