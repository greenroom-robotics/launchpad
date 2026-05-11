import { singleton } from 'tsyringe';
import electronUpdater, { type AppUpdater, type Logger } from 'electron-updater';
import { app, Notification } from 'electron';
import type { UpdateInfo, UpdateState } from '@app/shared';

@singleton()
export class UpdateService {
  readonly #logger: Logger = {
    info: (msg) => console.log('[autoUpdater]', msg),
    warn: (msg) => console.warn('[autoUpdater]', msg),
    error: (msg) => console.error('[autoUpdater]', msg),
    debug: (msg) => console.debug('[autoUpdater]', msg),
  };

  readonly #updater: AppUpdater;
  #state: UpdateState;

  constructor() {
    // Destructure to work around the CJS/ESM interop quirk in electron-updater.
    // See https://github.com/electron-userland/electron-builder/issues/7976.
    const { autoUpdater } = electronUpdater;
    this.#updater = autoUpdater;
    this.#updater.logger = this.#logger;

    const currentVersion = app.getVersion();
    // Initialize directly into the terminal-for-context state so the UI never
    // observes a half-truthful intermediate (e.g. "you're on the latest" before
    // the first check has even run).
    this.#state = isUpdaterActive()
      ? { kind: 'checking', currentVersion }
      : {
          kind: 'unsupported',
          currentVersion,
          reason: 'Auto-updates run only in installed release builds.',
        };

    this.#attachUpdaterListeners();

    if (this.#state.kind === 'checking') {
      void this.checkNow();
    }
  }

  getState(): UpdateState {
    return this.#state;
  }

  async checkNow(): Promise<void> {
    if (
      this.#state.kind === 'unsupported' ||
      this.#state.kind === 'checking' ||
      this.#state.kind === 'downloading'
    ) {
      return;
    }
    this.#setState({ kind: 'checking', currentVersion: this.#state.currentVersion });
    try {
      await this.#updater.checkForUpdates();
    } catch {
      // electron-updater also emits an 'error' event; the listener owns the transition.
    }
  }

  installNow(): void {
    if (this.#state.kind !== 'downloaded') return;
    // isForceRunAfter=true so the app deterministically relaunches after
    // install across all platforms (the default skips relaunch on macOS/Linux).
    this.#updater.quitAndInstall(false, true);
  }

  #setState(next: UpdateState): void {
    this.#state = next;
  }

  #attachUpdaterListeners(): void {
    this.#updater.on('checking-for-update', () => {
      this.#setState({ kind: 'checking', currentVersion: this.#state.currentVersion });
    });
    this.#updater.on('update-available', (info) => {
      this.#setState({
        kind: 'available',
        currentVersion: this.#state.currentVersion,
        info: mapInfo(info),
      });
    });
    this.#updater.on('update-not-available', () => {
      this.#setState({ kind: 'not-available', currentVersion: this.#state.currentVersion });
    });
    this.#updater.on('download-progress', () => {
      // Transition once on the first progress event; we don't expose progress data.
      if (this.#state.kind === 'available') {
        this.#setState({
          kind: 'downloading',
          currentVersion: this.#state.currentVersion,
          info: this.#state.info,
        });
      }
    });
    this.#updater.on('update-downloaded', (info) => {
      const mapped = mapInfo(info);
      this.#setState({
        kind: 'downloaded',
        currentVersion: this.#state.currentVersion,
        info: mapped,
      });
      this.#notifyDownloaded(mapped);
    });
    this.#updater.on('error', (error) => {
      this.#setState({
        kind: 'error',
        currentVersion: this.#state.currentVersion,
        message: error?.message ?? 'Unknown error',
      });
    });
  }

  #notifyDownloaded(info: UpdateInfo): void {
    if (!Notification.isSupported()) return;
    const notification = new Notification({
      title: 'Update ready to install',
      body: `Version ${info.version} will be applied next time you restart. Click to restart now.`,
    });
    notification.on('click', () => this.installNow());
    notification.show();
  }
}

function isUpdaterActive(): boolean {
  if (!app.isPackaged) return false;
  const channel = import.meta.env.VITE_DISTRIBUTION_CHANNEL;
  return !channel || channel === 'release';
}

function mapInfo(info: {
  version: string;
  releaseNotes?: string | Array<{ version: string; note: string | null }> | null;
}): UpdateInfo {
  let releaseNotes: string | null = null;
  if (typeof info.releaseNotes === 'string') {
    releaseNotes = info.releaseNotes;
  } else if (Array.isArray(info.releaseNotes)) {
    const joined = info.releaseNotes
      .map((n) => n.note)
      .filter((n): n is string => !!n)
      .join('\n\n');
    releaseNotes = joined || null;
  }
  return { version: info.version, releaseNotes };
}
