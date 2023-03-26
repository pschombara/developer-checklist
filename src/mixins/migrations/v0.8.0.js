import semver from 'semver'

export class V0_8_0 {
    constructor() {
    }

    supports = version => {
        return semver.lt(version, '0.8.0')
    }

    migrate = options => {
        const colors = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan']

        options.chrome = {
            tabGroups: {},
        }

        options.modules.chrome = true

        for (let color of colors) {
            options.chrome.tabGroups[color] = {
                title: '',
                active: false,
                urls: [],
            }
        }

        options.version = '0.8.0'
    }
}
