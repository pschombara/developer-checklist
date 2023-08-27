import semver from 'semver'

export class V0_8_0 {
    constructor() {
    }

    supports = version => {
        return semver.lt(version, '0.8.0')
    }

    migrate = options => {
        for (let chat of Object.keys(options.chat)) {
            options.chat[chat].name = ''
        }

        options.version = '0.8.0'
    }
}
