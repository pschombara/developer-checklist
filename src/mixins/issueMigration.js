import {V0_6_0} from '@/mixins/issues/v0.6.0'
import semver from 'semver'

export default class IssueMigration {
    constructor() {
        this._version = '0.6.2'
        this.migrations = [
            new V0_6_0(),
        ]
    }

    migrate = (identifier, issue)  => {
        if (undefined === issue.version || semver.lt(issue.version, '0.5.0')) {
            chrome.storage.local.remove(identifier)

            return false
        }

        for (let migration of this.migrations) {
            if (migration.supports(issue.version)) {
                migration.migrate(issue)
            }
        }

        issue.version = this._version

        let obj = {}

        obj[identifier] = issue

        chrome.storage.local.set(obj)

        return true
    }

    get version () {
        return this._version
    }
}
