import {SuperMigration} from './super-migration';

export class StorageChecklist extends SuperMigration{
    constructor() {
        super();

        this._migrations = {
            '0.4.0': migrateTo0_5_0,
        };
    }

    migrate(store) {
        if (false === store.hasOwnProperty('version')) {
            store.version = '0.4.0';
        }

        if (store.version !== this.currentVersion) {
            Object.keys(this._migrations).forEach((version) => {
                if (store.version === version) {
                    this._migrations[version](store);
                    this.migrated = true;
                }
            });
        }

        return store;
    }
}

const migrateTo0_5_0 = (store) => {
    // todo migrate checklists (stored issues to new format)
}
