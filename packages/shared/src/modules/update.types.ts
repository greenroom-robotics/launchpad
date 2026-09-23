import { z } from 'zod';

export const UpdateInfoSchema = z.object({
  version: z.string(),
});

// Fields present on every state. lastCheckedAt is the epoch-ms time of the
// most recent completed check attempt, or null if none has run this session.
const common = {
  currentVersion: z.string(),
  lastCheckedAt: z.number().nullable(),
};

export const UpdateStateSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('idle'), ...common }),
  z.object({ kind: z.literal('checking'), ...common }),
  z.object({ kind: z.literal('not-available'), ...common }),
  z.object({ kind: z.literal('available'), ...common, info: UpdateInfoSchema }),
  z.object({
    kind: z.literal('downloading'),
    ...common,
    info: UpdateInfoSchema,
    percent: z.number(),
  }),
  z.object({ kind: z.literal('downloaded'), ...common, info: UpdateInfoSchema }),
  z.object({ kind: z.literal('error'), ...common, message: z.string() }),
  z.object({ kind: z.literal('unsupported'), ...common, reason: z.string() }),
]);

export const UpdatePreferencesSchema = z.object({
  /** Check for updates automatically when the app launches. Off by default. */
  autoCheck: z.boolean(),
});

export type UpdateInfo = z.infer<typeof UpdateInfoSchema>;
export type UpdateState = z.infer<typeof UpdateStateSchema>;
export type UpdatePreferences = z.infer<typeof UpdatePreferencesSchema>;
