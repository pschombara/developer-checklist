import {SuperMigration} from './super-migration';
import {Storage} from '../storage';

export class StorageChecklist extends SuperMigration{
    constructor() {
        super();

        this._migrations = {
            '0.4.2': migrateTo0_5_0,
        };

        this._storage = new Storage();
    }

    migrate() {
        this.loadIdentifiers().then((identifiers) => {
            for (let identifier of identifiers) {
                if (undefined === identifier.item.version) {
                    identifier.item.version = '0.4.2';
                }

                if (identifier.item.version !== this.currentVersion) {
                    Object.keys(this._migrations).forEach((version) => {
                        if ('function' === typeof this._migrations[version]) {
                            this._migrations[version](identifier.item);
                        } else if ('string' === typeof this._migrations['version']) {
                            identifier.item.version = this._migrations[version];
                        }
                    })
                }

                this._storage.write(identifier.key, identifier.item);
            }
        });
    }

    loadIdentifiers() {
        let regexIssue = new RegExp('\\w+-\\d+');

        return new Promise(resolve => {
            chrome.storage.local.get(null, (items) => {
                let identifiers = [];

                Object.keys(items).forEach((key) => {
                    if (regexIssue.test(key)) {
                        identifiers.push({
                            key: key,
                            item: items[key],
                        });
                    }
                });

                resolve(identifiers);
            });
        });
    }
}

const migrateTo0_5_0 = (identifier) => {
    identifier.version = '0.5.0';

    let checklist = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: []
    }

    for (let category of identifier.developer) {
        for (item of category.items) {
            if (item.checked) {
                checklist[0].push(item.id);
            }
        }
    }

    for (let category of identifier.tester) {
        for (item of category.items) {
            if (item.checked) {
                checklist[1].push(item.id);
            }
        }
    }

    for (let category of identifier.reviewer) {
        for (item of category.items) {
            if (item.checked) {
                checklist[2].push(item.id);
            }
        }
    }

    for (let category of identifier.help) {
        for (item of category.items) {
            if (item.checked) {
                checklist[3].push(item.id);
            }
        }
    }

    delete identifier.developer;
    delete identifier.tester;
    delete identifier.reviewer;
    delete identifier.help;

    identifier.checklist = checklist;
}
