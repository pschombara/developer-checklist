import {V0_6_0} from '@/mixins/migrations/v0.6.0'
import semver from 'semver'

export default class Migration {
    constructor () {
        this._version = '0.6.0'
        this.migrations = [
            new V0_6_0(),
        ]
    }

    migrate = (options) => {
        if (undefined === options.version || semver.lt(options.version, '0.5.0')) {
            throw Error('Unsupported version')
        }

        for (let migration of this.migrations) {
            if (migration.supports(options.version)) {
                migration.migrate(options)
            }
        }

        options.version = this._version

        let obj = {}

        obj.options = options

        chrome.storage.local.set(obj)

        return options
    }

    get version () {
        return this._version
    }
}
