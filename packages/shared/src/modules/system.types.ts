import { z } from 'zod';

export const AutoStartStateSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('enabled') }),
  z.object({ kind: z.literal('disabled') }),
  z.object({ kind: z.literal('unsupported'), reason: z.string() }),
]);

export type AutoStartState = z.infer<typeof AutoStartStateSchema>;
