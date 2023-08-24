import semver from 'semver'
import {V0_7_0} from './migrations/v0.7.0.js'
import {V0_8_0} from './migrations/v0.8.0.js'

export default class Migration {
    constructor () {
        this._version = '0.8.0'
        this.migrations = [
            new V0_7_0(),
            new V0_8_0(),
        ]
    }

    migrate = (options, exported, storeInStorage = true) => {

        if (undefined === options.version || semver.lt(options.version, '0.5.0', 1)) {
            throw Error('Unsupported version')
        }

        for (let migration of this.migrations) {
            if (migration.supports(options.version)) {
                migration.migrate(options, exported)
            }
        }

        options.version = this._version

        let obj = {}

        obj.options = options

        if (storeInStorage) {
            chrome.storage.local.set(obj)
        }

        return {
            options,
            exported,
        }
    }

    get version () {
        return this._version
    }
}
