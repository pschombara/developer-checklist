import {defineStore} from 'pinia'
import Migration from '../mixins/migration.js'
import {th} from 'vuetify/locale'

const migration = new Migration()

export const useMainStorage = defineStore('mainStorage', {
    state: () => ({
        modules: {
            chat: false,
            cheatSheet: false,
            gitLab: false,
            jenkins: false,
            // chrome: false,
        },
        version: migration.version,
        configTabs: {
            main: 'general',
        },
        optionsValid: false,
        currentIssue: null,
        currentUrl: '',
        switchTab: null,
        openTab: null,
        themeSchema: 'system',
        themeColor: 'blue',
        optionTabs: [
            { id: 'general', name: chrome.i18n.getMessage('general'), icon: 'fas fa-cogs', settings: true },
            { id: 'jira', name: 'Jira', icon: 'fab fa-jira', settings: true },
            { id: 'jenkins', name: 'Jenkins', icon: 'fab fa-jenkins', settings: true },
            { id: 'gitLab', name: 'GitLab', icon: 'fab fa-gitlab', settings: true },
            { id: 'chat', name: 'Chat', icon: 'fas fa-comment', settings: true },
            { id: 'cheatSheet', name: 'Cheat Sheet', icon: 'fas fa-terminal', settings: true },
            // { id: 'chrome', name: 'Chrome', icon: 'fab fa-chrome', settings: true },
            { id: 'about', name: 'About', icon: 'fas fa-info-circle', settings: false },
        ],
    }),
    getters: {
        getModules: (state) => state.modules,
        getOpenTab: (state) => state.openTab,
        getOptionTabs: (state) => state.optionTabs,
        getThemeSchema: (state) => state.themeSchema,
        getThemeColor: (state) => state.themeColor,
        getVersion: (state) => state.version,
    },
    actions: {
        async load () {
            chrome.storage.onChanged.addListener((changes, area) => {
                if ('local' !== area) {
                    return
                }

                if (changes.optionsTab?.newValue) {
                    this.configTabs.main = changes.optionsTab.newValue

                    if ('' === changes.optionsTab.newValue) {
                        return this.autoChangeOpenTab()
                    }
                } else if (changes.optionsMain?.newValue.theme.color !== changes.optionsMain?.oldValue.theme.color
                    || changes.optionsMain?.newValue.theme.schema !== changes.optionsMain?.oldValue.theme.schema
                ) {
                    window.dispatchEvent(new CustomEvent('themeChanged', {detail: changes.optionsMain?.newValue.theme}))
                }
            })

            migration.migrate()

            chrome.storage.local.get('optionsMain', result => {
                this.modules = result.optionsMain.modules
                this.themeSchema = result.optionsMain.theme.schema
                this.themeColor = result.optionsMain.theme.color
                window.dispatchEvent(new CustomEvent('themeChanged', {detail: {schema: this.themeSchema, color: this.themeColor}}))
            })
        },
        async autoChangeOpenTab () {
            for (const tab of this.optionTabs) {
                if (tab.id === this.configTabs.main) {
                    this.openTab = tab.id
                    chrome.storage.local.set({'optionsTab': ''})

                    break
                }
            }
        },
        changeOpenTab (tab) {
            this.openTab = tab
        },
        switchModule (module, checked) {
            if (undefined === this.modules[module]) {
                return
            }

            this.modules[module] = checked
            this.updateInStorage()
        },
        setThemeSchema(schema) {
            this.themeSchema = schema
            this.updateInStorage()
        },
        setThemeColor(color) {
            this.themeColor = color
            this.updateInStorage()
        },
        updateInStorage() {
            chrome.storage.local.set({'optionsMain': {
                modules: this.modules,
                theme: {
                    schema: this.themeSchema,
                    color: this.themeColor,
                },
            }})
        },
    },
})
