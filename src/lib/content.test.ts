import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { getContent, getRelatedContent, validateAllContent, type WriteupContent } from '@/lib/content';
import { artSchema, blogSchema, journalSchema, projectSchema, writeupSchema } from '@/lib/schemas';

const fixtureRoot = path.join(process.cwd(), 'src', 'test-fixtures', 'content');
const temporaryRoots: string[] = [];

afterEach(() => temporaryRoots.splice(0).forEach((root) => fs.rmSync(root, { recursive: true, force: true })));

function temporaryFixtureRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-content-'));
  temporaryRoots.push(root);
  for (const type of ['writeups', 'blog', 'journal', 'art', 'projects']) {
    fs.mkdirSync(path.join(root, type), { recursive: true });
  }
  return root;
}

describe('content schemas', () => {
  const base = { title: 'Post', slug: 'valid-post', date: '2026-08-22', description: 'Description', tags: ['security'], published: true };

  test('validates each content type', () => {
    expect(writeupSchema.safeParse({ ...base, category: 'web' }).success).toBe(true);
    expect(blogSchema.safeParse(base).success).toBe(true);
    expect(journalSchema.safeParse(base).success).toBe(true);
    expect(projectSchema.safeParse({ ...base, technologies: ['typescript'] }).success).toBe(true);
    expect(artSchema.safeParse({ ...base, media: [{ src: '/content/art/valid-post/image.svg', alt: 'Image' }] }).success).toBe(true);
  });

  test('rejects invalid writeup slugs and impossible dates', () => {
    expect(writeupSchema.safeParse({ ...base, slug: 'Not Valid' }).success).toBe(false);
    expect(writeupSchema.safeParse({ ...base, date: '2026-02-30' }).success).toBe(false);
  });

  test('requires art media and public art paths', () => {
    expect(artSchema.safeParse({ ...base, media: [] }).success).toBe(false);
    expect(artSchema.safeParse({ ...base, media: [{ src: '/images/nope.png', alt: 'Image' }] }).success).toBe(false);
  });
});

describe('content loading', () => {
  test('validates dedicated fixtures without exposing them to production collections', () => {
    expect(validateAllContent(fixtureRoot)).toHaveLength(5);
    expect(validateAllContent()).toHaveLength(4);
  });

  test('rejects duplicate slugs', () => {
    const root = temporaryFixtureRoot();
    const source = fs.readFileSync(path.join(fixtureRoot, 'blog', 'valid-blog.md'), 'utf8');
    fs.writeFileSync(path.join(root, 'blog', 'one.md'), source);
    fs.writeFileSync(path.join(root, 'blog', 'two.md'), source);
    expect(() => validateAllContent(root)).toThrow('duplicate blog slug');
  });

  test('excludes drafts when asked for production-visible content', () => {
    const root = temporaryFixtureRoot();
    const source = fs.readFileSync(path.join(fixtureRoot, 'blog', 'valid-blog.md'), 'utf8').replace('published: true', 'published: false');
    fs.writeFileSync(path.join(root, 'blog', 'draft.md'), source);
    expect(getContent('blog', { root, includeDrafts: false })).toHaveLength(0);
    expect(getContent('blog', { root, includeDrafts: true })).toHaveLength(1);
  });

  test('related blog content excludes the current item and never crosses into journal', () => {
    const current = { type: 'blog' as const, slug: 'current', date: '2026-08-22', tags: ['security'], title: 'Current', description: 'Current', published: true, content: '', filePath: '' };
    const related = getRelatedContent(current);
    expect(related.find((item) => item.slug === current.slug)).toBeUndefined();
    expect(related.every((item) => item.type === 'blog')).toBe(true);
  });

  test('related writeups score shared platform and category deterministically', () => {
    const current: WriteupContent = { type: 'writeups', slug: 'current', date: '2026-08-22', tags: ['web'], title: 'Current', description: 'Current', published: true, content: '', filePath: '', platform: 'htb', category: 'web' };
    const platformMatch: WriteupContent = { ...current, slug: 'platform-match', date: '2026-08-21', tags: [], title: 'Platform', category: 'crypto' };
    const tagMatch: WriteupContent = { ...current, slug: 'tag-match', date: '2026-08-20', title: 'Tag', platform: 'other', category: 'misc' };
    expect(getRelatedContent(current, 3, [tagMatch, platformMatch, current]).map((item) => item.slug)).toEqual(['platform-match', 'tag-match']);
  });
});
