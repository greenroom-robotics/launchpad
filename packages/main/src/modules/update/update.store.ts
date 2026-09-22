import { singleton } from 'tsyringe';
import Store from 'electron-store';
import type { UpdatePreferences } from '@app/shared';

const defaultPreferences: UpdatePreferences = {
  autoCheck: false,
};

// Kept separate from ConfigStore: that store is cleared wholesale by
// "Reset to default", which must not touch update preferences.
@singleton()
export class UpdateStore {
  private store: Store<UpdatePreferences>;

  constructor() {
    this.store = new Store<UpdatePreferences>({
      name: 'launchpad-update',
      defaults: defaultPreferences,
      schema: {
        autoCheck: { type: 'boolean' },
      },
    });
  }

  getAutoCheck(): boolean {
    return this.store.get('autoCheck', defaultPreferences.autoCheck);
  }

  setAutoCheck(enabled: boolean): void {
    this.store.set('autoCheck', enabled);
  }
}
