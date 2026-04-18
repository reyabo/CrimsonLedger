import { z } from 'zod';

const damageTrackSchema = z.object({
  max: z.number().int().min(1).max(20),
  superficial: z.number().int().min(0).max(20),
  aggravated: z.number().int().min(0).max(20),
});

const conditionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(64),
  note: z.string().max(280).optional(),
});

const customTrackerSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(64),
  currentValue: z.number().int().min(-999).max(999),
  maxValue: z.number().int().min(0).max(999).optional(),
  displayType: z.enum(['counter', 'pips', 'checklist']),
  items: z.array(z.string().max(64)).optional(),
});

export const profileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(64),
  chronicle: z.string().max(64).optional(),
  thirst: z.number().int().min(0).max(5),
  morality: z.number().int().min(0).max(10),
  marks: z.number().int().min(0).max(10),
  health: damageTrackSchema,
  willpower: damageTrackSchema,
  conditions: z.array(conditionSchema).max(64),
  customTrackers: z.array(customTrackerSchema).max(32),
  shortNotes: z.string().max(4000),
  archived: z.boolean(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export const exportEnvelopeSchema = z.object({
  version: z.literal(1),
  exportedAt: z.number().int(),
  profiles: z.array(profileSchema).max(512),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ExportEnvelopeInput = z.infer<typeof exportEnvelopeSchema>;
