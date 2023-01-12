import semver from 'semver'

export default class Migration {
    constructor () {
        this._version = '0.6.3'
        this.migrations = [
        ]
    }

    migrate = (options, storeInStorage = true) => {
        if (undefined === options.version || semver.lt(options.version, '0.5.0', 1)) {
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

        if (storeInStorage) {
            chrome.storage.local.set(obj)
        }

        return options
    }

    get version () {
        return this._version
    }
}
