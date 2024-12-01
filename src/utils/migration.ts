import semver from 'semver'

export default class Migration {
    private readonly _minimumVersion: string;
    private readonly _version: string;

    constructor () {
        this._version = '0.11.0'
        this._minimumVersion = '0.10.0'
    }

    migrate = async () : Promise<void> => {
        browser.storage.local.get(null, async data => {
            if (0 === Object.keys(data).length) {
                return
            }

            let version = data.version || data.options.version

            if (undefined === version || semver.lt(version, '0.9.1')) {
                throw Error('Unsupported version')
            }

            if ('0.9.1' === version) {
                await browser.storage.local.set({version: '0.10.1'})
                await browser.storage.local.set({optionsChat: data.options.chat})
                await browser.storage.local.set({optionsCheatSheet: data.options.cheatSheet})
                await browser.storage.local.set({optionsMain: {
                    modules: data.options.general.modules,
                    theme: data.theme,
                    defaultPopupItemsPerPage: -1,
                }})
                await browser.storage.local.set({optionsGitLab: data.options.gitLab})
                await browser.storage.local.set({optionsJira: data.options.jira})
                await browser.storage.local.set({optionsJenkins: data.options.jenkins})

                await browser.storage.local.remove('options')
                await browser.storage.local.remove('theme')
            }

            await browser.storage.local.set({version: '0.10.1'})
        })
    }

    get version (): string {
        return this._version
    }

    isSupported(version: string): boolean {
        return semver.gte(version, this._minimumVersion)
            && semver.lte(version, this._version)
    }
}
