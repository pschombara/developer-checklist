import semver from 'semver'
export class V0_7_0 {
    constructor() {
    }

    supports = version => {
        return semver.lt(version, '0.7.0')
    }

    migrate = (options, exported) => {
        options.general = {
            modules: options.modules,
        }

        if (exported.includes('modules')) {
            exported.push('general')
        }

        delete options.modules

        options.version = '0.7.0'
    }
}
