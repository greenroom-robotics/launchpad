import { z } from 'zod';

// Core application configuration schemas
export const ApplicationInstanceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['gama', 'lookout', 'marops', 'missim']),
  url: z.string(),
  description: z.string().optional(),
  enabled: z.boolean(),
  vesselName: z.string().optional(),
});

export const LaunchpadConfigSchema = z.object({
  applications: z.array(ApplicationInstanceSchema),
});

export type ApplicationInstance = z.infer<typeof ApplicationInstanceSchema>;
export type LaunchpadConfig = z.infer<typeof LaunchpadConfigSchema>;

export const defaultConfig: LaunchpadConfig = {
  applications: [
    {
      id: 'local-gama',
      name: 'Local - GAMA',
      type: 'gama',
      url: 'http://localhost:3000',
      enabled: true,
      vesselName: 'Development',
    },
    {
      id: 'local-lookout',
      name: 'Local - Lookout+',
      type: 'lookout',
      url: 'http://localhost:4000',
      enabled: true,
      vesselName: 'Development',
    },
    {
      id: 'local-marops',
      name: 'Local - MarOps',
      type: 'marops',
      url: 'http://localhost:7000',
      enabled: true,
      vesselName: 'Development',
    },
    {
      id: 'local-missim',
      name: 'Local - MIS-SIM',
      type: 'missim',
      url: 'http://localhost:5000',
      enabled: true,
      vesselName: 'Development',
    },
  ],
};

// Connectivity check schemas
export const ConnectivityCheckRequestSchema = z.string();

export const ConnectivityCheckResponseSchema = z.object({
  connected: z.boolean(),
  error: z.string().optional(),
});

// Reset response schema
export const ResetToDefaultResponseSchema = z.object({
  applications: z.array(ApplicationInstanceSchema),
});

// Import/export schemas
export const ImportApplicationsResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('success'), applications: z.array(ApplicationInstanceSchema) }),
  z.object({ status: z.literal('cancelled') }),
  z.object({ status: z.literal('error'), errors: z.array(z.string()) }),
]);

export const ExportApplicationsResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('success'), path: z.string() }),
  z.object({ status: z.literal('cancelled') }),
]);

// Type exports
export type ConnectivityCheckRequest = z.infer<typeof ConnectivityCheckRequestSchema>;
export type ConnectivityCheckResponse = z.infer<typeof ConnectivityCheckResponseSchema>;
export type ResetToDefaultResponse = z.infer<typeof ResetToDefaultResponseSchema>;
export type ImportApplicationsResult = z.infer<typeof ImportApplicationsResultSchema>;
export type ExportApplicationsResult = z.infer<typeof ExportApplicationsResultSchema>;
