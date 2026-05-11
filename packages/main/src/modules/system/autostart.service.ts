import { singleton, inject } from 'tsyringe';
import { TYPES } from '../../types.js';
import type { AutoStartState } from '@app/shared';

@singleton()
export class AutoStartService {
  readonly #unsupportedReason: string | null;

  constructor(@inject(TYPES.ElectronApp) private readonly app: Electron.App) {
    if (!app.isPackaged) {
      this.#unsupportedReason = 'Open at login is only available in installed release builds.';
    } else if (process.platform === 'linux') {
      this.#unsupportedReason = 'Open at login is not supported on Linux.';
    } else {
      this.#unsupportedReason = null;
    }
  }

  getState(): AutoStartState {
    if (this.#unsupportedReason !== null) {
      return { kind: 'unsupported', reason: this.#unsupportedReason };
    }
    return this.app.getLoginItemSettings().openAtLogin ? { kind: 'enabled' } : { kind: 'disabled' };
  }

  enable(): void {
    if (this.#unsupportedReason !== null) return;
    // process.execPath is stable across updates here: electron-builder's NSIS
    // installer (perMachine: false) replaces the binary in place rather than
    // versioning the directory, so a stored login-item path remains valid.
    this.app.setLoginItemSettings({
      openAtLogin: true,
      name: this.app.getName(),
      path: process.execPath,
    });
  }

  disable(): void {
    if (this.#unsupportedReason !== null) return;
    this.app.setLoginItemSettings({ openAtLogin: false });
  }
}
