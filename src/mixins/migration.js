import semver from 'semver'

export default class Migration {
    constructor () {
        this._version = '0.10.0'
    }

    migrate = async () => {
        chrome.storage.local.get(null, async data => {
            let version = data.version || data.options.version

            if (undefined === version || semver.lt(version, '0.9.1')) {
                throw Error('Unsupported version')
            }

            if ('0.9.1' === version) {
                await chrome.storage.local.set({version: '0.10.0'})
                await chrome.storage.local.set({optionsChat: data.options.chat})
                await chrome.storage.local.set({optionsCheatSheet: data.options.cheatSheet})
                await chrome.storage.local.set({optionsMain: {
                    modules: data.options.general.modules,
                    theme: data.theme,
                    defaultPopupItemsPerPage: -1,
                }})
                await chrome.storage.local.set({optionsGitLab: data.options.gitLab})
                await chrome.storage.local.set({optionsJira: data.options.jira})
                await chrome.storage.local.set({optionsJenkins: data.options.jenkins})

                await chrome.storage.local.remove('options')
                await chrome.storage.local.remove('theme')
            }
        })
    }

    get version () {
        return this._version
    }
}
