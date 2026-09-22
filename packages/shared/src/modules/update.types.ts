import { z } from 'zod';

export const UpdateInfoSchema = z.object({
  version: z.string(),
});

export const UpdateStateSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('idle'), currentVersion: z.string() }),
  z.object({ kind: z.literal('checking'), currentVersion: z.string() }),
  z.object({ kind: z.literal('not-available'), currentVersion: z.string() }),
  z.object({ kind: z.literal('available'), currentVersion: z.string(), info: UpdateInfoSchema }),
  z.object({
    kind: z.literal('downloading'),
    currentVersion: z.string(),
    info: UpdateInfoSchema,
    percent: z.number(),
  }),
  z.object({ kind: z.literal('downloaded'), currentVersion: z.string(), info: UpdateInfoSchema }),
  z.object({ kind: z.literal('error'), currentVersion: z.string(), message: z.string() }),
  z.object({ kind: z.literal('unsupported'), currentVersion: z.string(), reason: z.string() }),
]);

export const UpdatePreferencesSchema = z.object({
  /** Check for updates automatically when the app launches. Off by default. */
  autoCheck: z.boolean(),
});

export type UpdateInfo = z.infer<typeof UpdateInfoSchema>;
export type UpdateState = z.infer<typeof UpdateStateSchema>;
export type UpdatePreferences = z.infer<typeof UpdatePreferencesSchema>;
