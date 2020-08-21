export class SuperMigration {
    constructor() {
        this._currentVersion = '0.5.0';
        this._migrated = false;
    }

    get currentVersion() {
        return this._currentVersion;
    }

    get migrated() {
        return this._migrated;
    }

    set migrated(migrated) {
        this._migrated = migrated;
    }
}
