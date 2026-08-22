import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import {
  artSchema,
  blogSchema,
  contentSlug,
  journalSchema,
  projectSchema,
  writeupSchema,
} from '@/lib/schemas';

export const contentTypes = ['writeups', 'blog', 'journal', 'art', 'projects'] as const;
export type ContentType = (typeof contentTypes)[number];

type ContentBase<T extends ContentType> = {
  slug: string;
  content: string;
  filePath: string;
  type: T;
};

export type WriteupContent = z.infer<typeof writeupSchema> & ContentBase<'writeups'>;
export type BlogContent = z.infer<typeof blogSchema> & ContentBase<'blog'>;
export type JournalContent = z.infer<typeof journalSchema> & ContentBase<'journal'>;
export type ArtContent = z.infer<typeof artSchema> & ContentBase<'art'>;
export type ProjectContent = z.infer<typeof projectSchema> & ContentBase<'projects'>;
type AnyContent = WriteupContent | BlogContent | JournalContent | ArtContent | ProjectContent;
export type ContentItem<T extends ContentType = ContentType> = Extract<AnyContent, { type: T }>;

const schemas = {
  writeups: writeupSchema,
  blog: blogSchema,
  journal: journalSchema,
  art: artSchema,
  projects: projectSchema,
};

const contentRoot = path.join(process.cwd(), 'src', 'content');
const publicRoot = path.join(process.cwd(), 'public');

export function getContentDirectory(type: ContentType) {
  return path.join(contentRoot, type);
}

function formatIssues(filePath: string, error: z.ZodError) {
  return error.issues
    .map((issue) => `${filePath}: ${issue.path.join('.') || 'frontmatter'} — ${issue.message}`)
    .join('\n');
}

function readCollectionFiles(type: ContentType, root = contentRoot) {
  const directory = path.join(root, type);
  if (!fs.existsSync(directory)) return [];

  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && ['.md', '.mdx'].includes(path.extname(entry.name)))
    .map((entry) => path.join(directory, entry.name));
}

function fallbackSlug(filePath: string) {
  return path.basename(filePath, path.extname(filePath));
}

function validateMediaPath(filePath: string, publicUrl: string) {
  const localPath = path.join(publicRoot, publicUrl.replace(/^\//, ''));
  if (!fs.existsSync(localPath)) {
    throw new Error(`${filePath}: media file not found for ${publicUrl}`);
  }
}

function parseFile<T extends ContentType>(type: T, filePath: string): ContentItem<T> {
  const { data, content } = matter(fs.readFileSync(filePath, 'utf8'));
  const parsed = schemas[type].safeParse(data);
  if (!parsed.success) throw new Error(formatIssues(filePath, parsed.error));

  const slug = parsed.data.slug ?? fallbackSlug(filePath);
  const slugResult = contentSlug.safeParse(slug);
  if (!slugResult.success) throw new Error(formatIssues(filePath, slugResult.error));

  if (type === 'art') (parsed.data as z.infer<typeof artSchema>).media.forEach((media) => validateMediaPath(filePath, media.src));
  if ('coverImage' in parsed.data && parsed.data.coverImage) validateMediaPath(filePath, parsed.data.coverImage);

  return { ...parsed.data, slug, content, filePath, type } as ContentItem<T>;
}

export function validateAllContent(root = contentRoot) {
  const collection = contentTypes.flatMap((type) =>
    readCollectionFiles(type, root).map((filePath) => parseFile(type, filePath)),
  );

  for (const type of contentTypes) {
    const seen = new Set<string>();
    for (const item of collection.filter((candidate) => candidate.type === type)) {
      if (seen.has(item.slug)) throw new Error(`${item.filePath}: duplicate ${type} slug "${item.slug}"`);
      seen.add(item.slug);
    }
  }

  return collection;
}

export function getContent<T extends ContentType>(type: T, options: { includeDrafts?: boolean; root?: string } = {}) {
  const content = validateAllContent(options.root).filter((item) => item.type === type) as ContentItem<T>[];
  const includeDrafts = options.includeDrafts ?? process.env.NODE_ENV !== 'production';
  return content
    .filter((item) => includeDrafts || item.published)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getContentBySlug<T extends ContentType>(type: T, slug: string) {
  return getContent(type).find((item) => item.slug === slug);
}

export function getRelatedContent(item: ContentItem, limit = 3, collection = getContent(item.type)) {
  if (item.type === 'journal') return [];

  return collection
    .filter((candidate) => candidate.slug !== item.slug)
    .map((candidate) => {
      const sharedTags = candidate.tags.filter((tag) => item.tags.includes(tag)).length;
      let score = sharedTags;
      if (item.type === 'writeups' && candidate.type === 'writeups') {
        if (item.category && item.category === candidate.category) score += 1;
        if (item.platform && item.platform === candidate.platform) score += 1;
      }
      return { candidate, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.candidate.date.localeCompare(a.candidate.date))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
