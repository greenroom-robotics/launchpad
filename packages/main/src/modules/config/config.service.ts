import { singleton, inject } from 'tsyringe';
import { net, dialog } from 'electron';
import fs from 'node:fs';
import * as YAML from 'yaml';
import ajvPkg from 'ajv';
import type { ErrorObject } from 'ajv';

// `ajv`'s CJS default export doesn't resolve to a construct signature under
// this project's NodeNext + esModuleInterop combination — cast through the
// real runtime shape (verified: `import('ajv')` yields `{ default: Ajv }`).
const Ajv = ajvPkg as unknown as typeof import('ajv').default;
import { z } from 'zod';
import { SecureHttpClient } from '../../lib/httpClient.js';
import { ConfigStore } from './config.store.js';
import { LaunchpadConfigSchema } from '@app/shared';
import type {
  ApplicationInstance,
  LaunchpadConfig,
  ConnectivityCheckResponse,
  ImportApplicationsResult,
  ExportApplicationsResult,
} from '@app/shared';

// Ajv's default meta-schema is draft-07; ask zod to target that instead of
// its draft-2020-12 default so `Ajv.compile` doesn't reject the $schema.
const applicationsJsonSchema = z.toJSONSchema(LaunchpadConfigSchema, { target: 'draft-07' });
const validateLaunchpadConfig = new Ajv().compile(applicationsJsonSchema);

@singleton()
export class ConfigService {
  private httpClient: SecureHttpClient;

  constructor(@inject(ConfigStore) private store: ConfigStore) {
    this.httpClient = new SecureHttpClient();
  }

  getApplications(): ApplicationInstance[] {
    return this.store.getApplications();
  }

  setApplications(applications: ApplicationInstance[]): void {
    this.store.setApplications(applications);
  }

  getConfig(): LaunchpadConfig {
    return this.store.getConfig();
  }

  setConfig(config: LaunchpadConfig): void {
    this.store.setConfig(config);
  }

  resetToDefault(): LaunchpadConfig {
    return this.store.resetToDefault();
  }

  async checkConnectivity(url: string): Promise<ConnectivityCheckResponse> {
    try {
      // First check if we have basic network connectivity
      if (!net.isOnline()) {
        console.log(`[ConfigService] No network connection detected`);
        return { connected: false, error: 'No network connection' };
      }

      // Use axios with SSL bypass for connectivity check
      const result = await this.httpClient.checkConnectivity(url);

      return {
        connected: result.connected,
        error: result.error,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        connected: false,
        error: errorMessage,
      };
    }
  }

  // Additional business logic methods
  getApplication(id: string): ApplicationInstance | undefined {
    return this.store.getApplication(id);
  }

  updateApplication(id: string, updates: Partial<ApplicationInstance>): boolean {
    return this.store.updateApplication(id, updates);
  }

  addApplication(application: ApplicationInstance): void {
    this.store.addApplication(application);
  }

  removeApplication(id: string): boolean {
    return this.store.removeApplication(id);
  }

  getEnabledApplications(): ApplicationInstance[] {
    return this.store.getEnabledApplications();
  }

  getApplicationsByType(type: ApplicationInstance['type']): ApplicationInstance[] {
    return this.store.getApplicationsByType(type);
  }

  toggleApplicationEnabled(id: string): boolean {
    const application = this.getApplication(id);
    if (!application) {
      return false;
    }

    return this.updateApplication(id, { enabled: !application.enabled });
  }

  async validateApplicationUrl(url: string): Promise<{ valid: boolean; error?: string }> {
    try {
      new URL(url); // Basic URL validation
      const connectivity = await this.checkConnectivity(url);
      return {
        valid: connectivity.connected,
        error: connectivity.error,
      };
    } catch {
      return {
        valid: false,
        error: 'Invalid URL format',
      };
    }
  }

  async batchConnectivityCheck(): Promise<Record<string, ConnectivityCheckResponse>> {
    const applications = this.getEnabledApplications();
    const results: Record<string, ConnectivityCheckResponse> = {};

    await Promise.allSettled(
      applications.map(async (app) => {
        results[app.id] = await this.checkConnectivity(app.url);
      })
    );

    return results;
  }

  async exportApplications(): Promise<ExportApplicationsResult> {
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath: 'launchpad-applications.yaml',
      filters: [{ name: 'YAML', extensions: ['yaml', 'yml'] }],
    });

    if (canceled || !filePath) {
      return { status: 'cancelled' };
    }

    const content = YAML.stringify({ applications: this.store.getApplications() });
    fs.writeFileSync(filePath, content);

    return { status: 'success', path: filePath };
  }

  async importApplications(): Promise<ImportApplicationsResult> {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'YAML', extensions: ['yaml', 'yml'] }],
    });

    if (canceled || filePaths.length === 0) {
      return { status: 'cancelled' };
    }

    let parsed: unknown;
    try {
      parsed = YAML.parse(fs.readFileSync(filePaths[0], 'utf-8'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown YAML parse error';
      return { status: 'error', errors: [message] };
    }

    if (!validateLaunchpadConfig(parsed)) {
      const errors = (validateLaunchpadConfig.errors ?? []).map(
        (err: ErrorObject) => `${err.instancePath || 'applications'} ${err.message}`
      );
      return { status: 'error', errors };
    }

    const imported = (parsed as LaunchpadConfig).applications;
    const existing = this.store.getApplications();
    const merged = [...existing];

    for (const app of imported) {
      const index = merged.findIndex((existingApp) => existingApp.id === app.id);
      if (index === -1) {
        merged.push(app);
      } else {
        merged[index] = app;
      }
    }

    this.store.setApplications(merged);

    return { status: 'success', applications: merged };
  }
}
