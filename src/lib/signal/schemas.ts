import { z } from 'zod';
import { SIGNAL_SLOTS } from './types';

export const signalTierSchema = z.enum(['Personal', 'Curated', 'Discovery'] as const);
export const signalSlotSchema = z.enum(SIGNAL_SLOTS);

export const signalItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string().url().optional(),
  source: z.string(),
  category: z.string(),
  // v1 archives predate the fixed editorial rhythm. v2 artifacts require it below.
  slot: signalSlotSchema.optional(),
  tier: signalTierSchema,
  image: z.string().url().optional(),
  curiosity: z.string().min(1).max(180).optional(),
  topicKey: z.string().min(1).max(160).optional(),
  timestamp: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const signalNodeSchema = signalItemSchema.extend({
  x: z.number(),
  y: z.number(),
  r: z.number(),
});

export const signalDaySchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    seed: z.string(),
    generatorVersion: z.string(),
    nodes: z.array(signalNodeSchema),
  })
  .superRefine((day, context) => {
    if (!day.generatorVersion.startsWith('v2.')) return;

    for (const slot of SIGNAL_SLOTS) {
      const count = day.nodes.filter((node) => node.slot === slot).length;
      if (count !== 1) {
        context.addIssue({
          code: 'custom',
          path: ['nodes'],
          message: `Signal v2 requires exactly one ${slot} item; received ${count}.`,
        });
      }
    }

    if (day.nodes.length !== SIGNAL_SLOTS.length) {
      context.addIssue({
        code: 'custom',
        path: ['nodes'],
        message: `Signal v2 requires ${SIGNAL_SLOTS.length} items.`,
      });
    }
  });

export type SignalDayType = z.infer<typeof signalDaySchema>;
