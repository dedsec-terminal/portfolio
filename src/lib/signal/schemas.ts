import { z } from 'zod';

export const signalTierSchema = z.enum(['Personal', 'Curated', 'Discovery'] as const);

export const signalItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string().url().optional(),
  source: z.string(),
  category: z.string(),
  tier: signalTierSchema,
  image: z.string().url().optional(),
  timestamp: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const signalNodeSchema = signalItemSchema.extend({
  x: z.number(),
  y: z.number(),
  r: z.number(),
});

export const signalDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  seed: z.string(),
  generatorVersion: z.string(),
  nodes: z.array(signalNodeSchema),
});

export type SignalDayType = z.infer<typeof signalDaySchema>;
