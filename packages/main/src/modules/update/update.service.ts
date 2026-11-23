import { singleton, inject } from 'tsyringe';
import electronUpdater, {
  type AppUpdater,
  type CancellationToken,
  type Logger,
} from 'electron-updater';
import { app, net, Notification } from 'electron';
import type { UpdateInfo, UpdateState } from '@app/shared';
import { UpdateStore } from './update.store.js';

// Internal state representation without currentVersion (which is constant for
// the lifetime of the service). getState() folds the version back in.
type InternalState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'not-available' }
  | { kind: 'available'; info: UpdateInfo }
  | { kind: 'downloading'; info: UpdateInfo; percent: number }
  | { kind: 'downloaded'; info: UpdateInfo }
  | { kind: 'error'; message: string }
  | { kind: 'unsupported'; reason: string };

const OFFLINE_MESSAGE = 'No internet connection. Connect to a network and try again.';
const UNREACHABLE_MESSAGE =
  'Could not reach the update server. Check your network connection and try again.';
const SERVER_ERROR_MESSAGE = 'The update server returned an error. Try again later.';
const METADATA_MISSING_MESSAGE =
  'The latest release is missing its update metadata, so it cannot be installed from here. Download it from the releases page.';
const CHECKSUM_MESSAGE = 'The downloaded update was corrupted. Download it again.';
const INSTALL_CANCELLED_MESSAGE = 'Installation was cancelled before it started.';
const UNSIGNED_MESSAGE =
  'This update cannot be installed because the build is not code-signed. Download the installer from the releases page.';
const GENERIC_ERROR_MESSAGE = 'The update failed. See the application log for details.';

// Destructure to work around the CJS/ESM interop quirk in electron-updater.
// See https://github.com/electron-userland/electron-builder/issues/7976.
const { autoUpdater, CancellationToken: CancellationTokenCtor } = electronUpdater;

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
  #lastCheckedAt: number | null = null;
  #downloadToken: CancellationToken | null = null;

  constructor(@inject(UpdateStore) private readonly store: UpdateStore) {
    this.#updater = autoUpdater;
    this.#updater.logger = this.#logger;

    // Nothing is downloaded or installed without an explicit user action.
    // autoInstallOnAppQuit in particular would, on Linux deb installs, spawn a
    // pkexec password prompt when the app exits.
    this.#updater.autoDownload = false;
    this.#updater.autoInstallOnAppQuit = false;

    if (!isUpdaterActive()) {
      this.#state = {
        kind: 'unsupported',
        reason: 'Auto-updates run only in installed release builds.',
      };
    } else if (this.store.getAutoCheck()) {
      this.#state = { kind: 'checking' };
    } else {
      this.#state = { kind: 'idle' };
    }

    this.#attachUpdaterListeners();

    if (this.#state.kind === 'checking') {
      // Bypass checkNow()'s "already checking" guard which would reject the
      // initial call we just primed state for.
      void this.#runCheck();
    }
  }

  getState(): UpdateState {
    return {
      ...this.#state,
      currentVersion: this.#currentVersion,
      lastCheckedAt: this.#lastCheckedAt,
    };
  }

  getAutoCheck(): boolean {
    return this.store.getAutoCheck();
  }

  setAutoCheck(enabled: boolean): void {
    this.store.setAutoCheck(enabled);
    // Opting in should have a visible effect now, not only on the next launch.
    if (enabled && this.#canStartCheck()) {
      void this.checkNow();
    }
  }

  async checkNow(): Promise<void> {
    if (!this.#canStartCheck()) return;
    if (!net.isOnline()) {
      this.#setState({ kind: 'error', message: OFFLINE_MESSAGE });
      return;
    }
    this.#setState({ kind: 'checking' });
    await this.#runCheck();
  }

  async downloadNow(): Promise<void> {
    if (this.#state.kind !== 'available') return;
    if (!net.isOnline()) {
      this.#setState({ kind: 'error', message: OFFLINE_MESSAGE });
      return;
    }
    const { info } = this.#state;
    const token = new CancellationTokenCtor();
    this.#downloadToken = token;
    this.#setState({ kind: 'downloading', info, percent: 0 });
    try {
      await this.#updater.downloadUpdate(token);
    } catch {
      // A cancelled download rejects without emitting 'error'; return to the
      // offer. Any other failure is handled by the 'error' listener.
      if (token.cancelled && this.#is('downloading')) {
        this.#setState({ kind: 'available', info });
      }
    } finally {
      if (this.#downloadToken === token) this.#downloadToken = null;
    }
  }

  cancelDownload(): void {
    if (this.#state.kind !== 'downloading') return;
    this.#downloadToken?.cancel();
  }

  installNow(): void {
    if (this.#state.kind !== 'downloaded') return;
    // Not silent, so electron-updater relaunches the app after install
    // (autoRunAppAfterInstall defaults to true).
    this.#updater.quitAndInstall(false, true);
  }

  #canStartCheck(): boolean {
    return (
      this.#state.kind === 'idle' ||
      this.#state.kind === 'not-available' ||
      this.#state.kind === 'available' ||
      this.#state.kind === 'error'
    );
  }

  #setState(next: InternalState): void {
    this.#state = next;
  }

  // Method form defeats TypeScript's narrowing of #state across awaits, where
  // listeners may have moved it on.
  #is(kind: InternalState['kind']): boolean {
    return this.#state.kind === kind;
  }

  async #runCheck(): Promise<void> {
    try {
      const result = await this.#updater.checkForUpdates();
      // electron-updater resolves null without emitting any event when the
      // platform-specific updater declines to run (e.g. a Linux build that is
      // neither an AppImage nor a deb/rpm install). Don't leave the UI spinning.
      if (result === null) {
        if (this.#is('checking')) {
          this.#setState({
            kind: 'unsupported',
            reason: 'Update checks are not supported for this installation type.',
          });
        }
        return;
      }
      this.#lastCheckedAt = Date.now();
    } catch {
      // electron-updater also emits an 'error' event; the listener owns the
      // transition. A failed attempt still counts as a check for the UI.
      this.#lastCheckedAt = Date.now();
    }
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
    this.#updater.on('download-progress', (progress) => {
      if (this.#state.kind === 'downloading') {
        this.#setState({ ...this.#state, percent: Math.round(progress.percent) });
      }
    });
    this.#updater.on('update-downloaded', (info) => {
      const mapped = mapInfo(info);
      this.#setState({ kind: 'downloaded', info: mapped });
      this.#notifyDownloaded(mapped);
    });
    this.#updater.on('error', (error) => {
      this.#logger.error(error?.stack ?? String(error));
      this.#setState({ kind: 'error', message: describeError(error) });
    });
  }

  #notifyDownloaded(info: UpdateInfo): void {
    if (!Notification.isSupported()) return;
    const notification = new Notification({
      title: 'Update ready to install',
      body: `Version ${info.version} is downloaded. Click to restart and install.`,
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

function mapInfo(info: { version: string }): UpdateInfo {
  return { version: info.version };
}

// electron-updater tags its own failures with a code and surfaces Chromium,
// Node and installer errors verbatim in the message. Classify by code first,
// then by message. The raw error is logged by the caller.
function describeError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null ? (error as { code?: unknown }).code : undefined;
  const message = error instanceof Error ? error.message : String(error);

  switch (code) {
    case 'ERR_UPDATER_CHANNEL_FILE_NOT_FOUND':
    case 'ERR_UPDATER_LATEST_VERSION_NOT_FOUND':
      return METADATA_MISSING_MESSAGE;
    case 'ERR_CHECKSUM_MISMATCH':
      return CHECKSUM_MESSAGE;
  }

  if (/net::ERR_INTERNET_DISCONNECTED/i.test(message)) return OFFLINE_MESSAGE;
  if (
    /net::ERR_|ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket hang up/i.test(message)
  ) {
    return UNREACHABLE_MESSAGE;
  }
  // Squirrel.Mac rejects payloads whose signature does not match the running app.
  if (/code signature|not signed|signature .*(invalid|did not pass)/i.test(message))
    return UNSIGNED_MESSAGE;
  // pkexec/gksudo exit 126 when the user dismisses the prompt, 127 on auth failure.
  if (/exited with code 12[67]\b/.test(message)) return INSTALL_CANCELLED_MESSAGE;
  if ((error instanceof Error && 'statusCode' in error) || /HttpError|status code/i.test(message)) {
    return SERVER_ERROR_MESSAGE;
  }
  return GENERIC_ERROR_MESSAGE;
}
