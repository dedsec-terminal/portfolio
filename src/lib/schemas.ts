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

export const resumeSchema = z.object({
  basics: z.object({
    name: z.string(),
    label: z.string(),
    email: z.string().email(),
    url: z.string().url(),
    summary: z.string(),
    profiles: z.array(
      z.object({
        network: z.string(),
        username: z.string(),
        url: z.string().url(),
      })
    ),
  }),
  work: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      highlights: z.array(z.string()),
    })
  ),
  education: z.array(z.any()),
  skills: z.array(z.any()),
});

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
