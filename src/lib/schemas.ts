import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  description: z.string(),
  tags: z.array(z.string()),
  url: z.string().url().optional(),
  github: z.string().url().optional(),
});

export const writeupSchema = z.object({
  title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  description: z.string(),
  tags: z.array(z.string()),
  event: z.string().optional(),
});

export const blogSchema = z.object({
  title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  description: z.string(),
  tags: z.array(z.string()),
});

export const journalSchema = z.object({
  title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  mood: z.string().optional(),
});

export const artSchema = z.object({
  title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  description: z.string(),
  image: z.string(),
});

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
