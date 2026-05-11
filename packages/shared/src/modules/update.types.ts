import { z } from 'zod';

export const UpdateInfoSchema = z.object({
  version: z.string(),
  releaseNotes: z.string().nullable(),
});

export const UpdateStateSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('checking'), currentVersion: z.string() }),
  z.object({ kind: z.literal('not-available'), currentVersion: z.string() }),
  z.object({ kind: z.literal('available'), currentVersion: z.string(), info: UpdateInfoSchema }),
  z.object({ kind: z.literal('downloading'), currentVersion: z.string(), info: UpdateInfoSchema }),
  z.object({ kind: z.literal('downloaded'), currentVersion: z.string(), info: UpdateInfoSchema }),
  z.object({ kind: z.literal('error'), currentVersion: z.string(), message: z.string() }),
  z.object({ kind: z.literal('unsupported'), currentVersion: z.string(), reason: z.string() }),
]);

export type UpdateInfo = z.infer<typeof UpdateInfoSchema>;
export type UpdateState = z.infer<typeof UpdateStateSchema>;
