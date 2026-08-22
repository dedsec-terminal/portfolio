import { z } from 'zod';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const contentDate = z
  .string()
  .regex(datePattern, 'Date must be YYYY-MM-DD')
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, 'Date must be a real calendar date');

export const contentSlug = z
  .string()
  .regex(slugPattern, 'Slug must be lowercase URL-safe kebab-case');

const contentTag = z
  .string()
  .trim()
  .toLowerCase()
  .regex(slugPattern, 'Tags must be lowercase kebab-case');

export const baseContentSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  slug: contentSlug.optional(),
  date: contentDate,
  description: z.string().trim().min(1, 'Description is required'),
  tags: z.array(contentTag).default([]),
  published: z.boolean().default(false),
  updatedAt: contentDate.optional(),
});

export const projectSchema = baseContentSchema.extend({
  technologies: z.array(contentTag).default([]),
  codeUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  featured: z.boolean().default(false),
  status: z.string().trim().min(1).optional(),
  coverImage: z.string().startsWith('/content/', 'Cover image must be a /content/ public URL').optional(),
});

export const writeupSchema = baseContentSchema.extend({
  platform: z.string().trim().min(1).optional(),
  challenge: z.string().trim().min(1).optional(),
  category: z.enum(['web', 'pwn', 'crypto', 'reverse', 'forensics', 'misc', 'network', 'cloud']).optional(),
  difficulty: z.string().trim().min(1).optional(),
});

export const blogSchema = baseContentSchema.extend({
  coverImage: z.string().startsWith('/content/', 'Cover image must be a /content/ public URL').optional(),
});

export const journalSchema = baseContentSchema.extend({
  mood: z.string().trim().min(1).optional(),
});

export const artMediaSchema = z.object({
  src: z.string().startsWith('/content/art/', 'Media source must be a /content/art/ public URL'),
  alt: z.string().trim().min(1, 'Media alt text is required'),
  caption: z.string().trim().min(1).optional(),
  type: z.literal('image').default('image'),
});

export const artSchema = baseContentSchema.extend({
  description: z.string().trim().optional(),
  media: z.array(artMediaSchema).min(1, 'At least one media item is required'),
  source: z.string().trim().min(1).optional(),
});

export type ProjectFrontmatter = z.infer<typeof projectSchema>;
export type WriteupFrontmatter = z.infer<typeof writeupSchema>;
export type BlogFrontmatter = z.infer<typeof blogSchema>;
export type JournalFrontmatter = z.infer<typeof journalSchema>;
export type ArtFrontmatter = z.infer<typeof artSchema>;

export const signalDiscoverySchema = z.object({
  tier: z.enum(['PERSONAL', 'CURATED', 'CHAOTIC']),
  title: z.string(),
  description: z.string(),
  url: z.string().url().optional(),
  category: z.string(),
});

export const signalSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  discoveries: z.array(signalDiscoverySchema),
});

const provenance = {
  source: z.string().optional().describe("Provenance; not rendered"),
  derivedFrom: z.string().optional().describe("Provenance; not rendered"),
};

const bullet = z
  .string()
  .describe("Supports `**bold**` runs; no other inline formatting");

const contact = z.object({
  email: z.string(),
  links: z
    .array(
      z.object({
        url: z.string(),
        label: z.string(),
      }),
    )
    .optional(),
});

const header = z.object({
  name: z.string(),
  subtitle: z
    .array(z.string())
    .describe("One logical line per item; the template joins with line breaks"),
  monomark: z.string().optional().describe("Short mark rendered as a logo"),
  contact,
});

const skillsSection = z.object({
  kind: z.literal("skills").describe("A labeled flat list of bullets"),
  label: z.string(),
  bullets: z.array(bullet),
  ...provenance,
});

const projectEntry = z.object({
  title: z.string(),
  dateRange: z.string().optional(),
  metadata: z.string().optional().describe("Compact inline technology context"),
  link: z.object({
    url: z.string().url(),
    label: z.string(),
  }).optional(),
  bullets: z.array(bullet),
  ...provenance,
});

const projectsSection = z.object({
  kind: z
    .literal("projects")
    .describe("Titled entries with optional date ranges"),
  label: z.string(),
  entries: z.array(projectEntry),
  ...provenance,
});

const experienceEntry = z.object({
  title: z.string(),
  organization: z
    .string()
    .optional()
    .describe(
      "When set, renders `{title} at {organization}`; when absent, title stands alone",
    ),
  dateRange: z.string().optional(),
  summary: z.string().optional(),
  bullets: z.array(bullet),
  ...provenance,
});

const experiencesSection = z.object({
  kind: z
    .literal("experiences")
    .describe("Roles with organization, summary, and bullets"),
  label: z.string(),
  entries: z.array(experienceEntry),
  ...provenance,
});

const educationEntry = z.object({
  title: z.string(),
  dateRange: z.string().optional(),
  summary: z.string().optional().describe("Compact secondary school or credential context"),
  bullets: z.array(bullet).optional(),
  ...provenance,
});

const educationSection = z.object({
  kind: z
    .literal("education")
    .describe("Like projects, but bullets are optional per entry"),
  label: z.string(),
  entries: z.array(educationEntry),
  ...provenance,
});

export const sectionSchema = z.discriminatedUnion("kind", [
  skillsSection,
  projectsSection,
  experiencesSection,
  educationSection,
]);

export const resumeSchema = z.object({
  header,
  sections: z.array(sectionSchema),
});

export type Resume = z.infer<typeof resumeSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type SkillsSection = z.infer<typeof skillsSection>;
export type ProjectsSection = z.infer<typeof projectsSection>;
export type ExperiencesSection = z.infer<typeof experiencesSection>;
export type EducationSection = z.infer<typeof educationSection>;

export const musicTrackSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  album: z.string().optional(),
  artwork: z.string().optional(),
  audioSource: z.string(),
});

export const musicCatalogueSchema = z.object({
  tracks: z.array(musicTrackSchema),
});
