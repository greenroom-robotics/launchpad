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
      // A malformed or schema-violating file would otherwise throw here and
      // abort app initialisation. The contents are trivially recreatable.
      clearInvalidConfig: true,
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
