import { singleton } from 'tsyringe';
import electronUpdater, { type AppUpdater, type Logger } from 'electron-updater';
import { app, Notification } from 'electron';
import type { UpdateInfo, UpdateState } from '@app/shared';

// Internal state representation without currentVersion (which is constant for
// the lifetime of the service). getState() folds the version back in.
type InternalState =
  | { kind: 'checking' }
  | { kind: 'not-available' }
  | { kind: 'available'; info: UpdateInfo }
  | { kind: 'downloading'; info: UpdateInfo }
  | { kind: 'downloaded'; info: UpdateInfo }
  | { kind: 'error'; message: string }
  | { kind: 'unsupported'; reason: string };

@singleton()
export class UpdateService {
  readonly #logger: Logger = {
    info: (msg) => console.log('[autoUpdater]', msg),
    warn: (msg) => console.warn('[autoUpdater]', msg),
    error: (msg) => console.error('[autoUpdater]', msg),
    debug: (msg) => console.debug('[autoUpdater]', msg),
  };

  readonly #updater: AppUpdater;
  readonly #currentVersion: string = app.getVersion();
  #state: InternalState;

  constructor() {
    // Destructure to work around the CJS/ESM interop quirk in electron-updater.
    // See https://github.com/electron-userland/electron-builder/issues/7976.
    const { autoUpdater } = electronUpdater;
    this.#updater = autoUpdater;
    this.#updater.logger = this.#logger;

    this.#state = isUpdaterActive()
      ? { kind: 'checking' }
      : {
          kind: 'unsupported',
          reason: 'Auto-updates run only in installed release builds.',
        };

    this.#attachUpdaterListeners();

    if (this.#state.kind === 'checking') {
      // Bypass checkNow()'s "already checking" guard which would reject the
      // initial call we just primed state for. The 'error' event handler owns
      // the transition if the check itself fails.
      void this.#updater.checkForUpdates().catch(() => {});
    }
  }

  getState(): UpdateState {
    return { ...this.#state, currentVersion: this.#currentVersion };
  }

  async checkNow(): Promise<void> {
    if (
      this.#state.kind === 'unsupported' ||
      this.#state.kind === 'checking' ||
      this.#state.kind === 'downloading'
    ) {
      return;
    }
    this.#setState({ kind: 'checking' });
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

  #setState(next: InternalState): void {
    this.#state = next;
  }

  #attachUpdaterListeners(): void {
    this.#updater.on('checking-for-update', () => {
      this.#setState({ kind: 'checking' });
    });
    this.#updater.on('update-available', (info) => {
      this.#setState({ kind: 'available', info: mapInfo(info) });
    });
    this.#updater.on('update-not-available', () => {
      this.#setState({ kind: 'not-available' });
    });
    this.#updater.on('download-progress', () => {
      // Transition once on the first progress event; we don't expose progress data.
      if (this.#state.kind === 'available') {
        this.#setState({ kind: 'downloading', info: this.#state.info });
      }
    });
    this.#updater.on('update-downloaded', (info) => {
      const mapped = mapInfo(info);
      this.#setState({ kind: 'downloaded', info: mapped });
      this.#notifyDownloaded(mapped);
    });
    this.#updater.on('error', (error) => {
      this.#setState({ kind: 'error', message: error?.message ?? 'Unknown error' });
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
