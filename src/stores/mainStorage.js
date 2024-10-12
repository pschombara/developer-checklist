import {defineStore} from 'pinia'
import Migration from '../mixins/migration.js'

const migration = new Migration()

export const useMainStorage = defineStore('mainStorage', {
    state: () => ({
        modules: {
            chat: false,
            cheatSheet: false,
            gitLab: false,
            jenkins: false,
            openTab: null,
        },
        version: migration.version,
        configTabs: {
            main: 'general',
        },
        themeSchema: 'system',
        themeColor: 'blue',
        defaultPopupItemsPerPage: -1,
        optionTabs: [
            { id: 'general', name: chrome.i18n.getMessage('general'), icon: 'fas fa-cogs', settings: true },
            { id: 'jira', name: 'Jira', icon: 'fab fa-jira', settings: true },
            { id: 'jenkins', name: 'Jenkins', icon: 'fab fa-jenkins', settings: true },
            { id: 'gitLab', name: 'GitLab', icon: 'fab fa-gitlab', settings: true },
            { id: 'chat', name: 'Chat', icon: 'fas fa-comment', settings: true },
            { id: 'cheatSheet', name: 'Cheat Sheet', icon: 'fas fa-terminal', settings: true },
        ],
    }),
    getters: {
        getModules: (state) => state.modules,
        getOpenTab: (state) => state.openTab,
        getOptionTabs: (state) => state.optionTabs,
        getThemeSchema: (state) => state.themeSchema,
        getThemeColor: (state) => state.themeColor,
        getVersion: (state) => state.version,
        getDefaultPopupItemsPerPage: (state) => state.defaultPopupItemsPerPage,
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

            await migration.migrate()

            chrome.storage.local.get('optionsMain', result => {
                this.modules = result.optionsMain.modules
                this.themeSchema = result.optionsMain.theme.schema
                this.themeColor = result.optionsMain.theme.color
                this.defaultPopupItemsPerPage = result.optionsMain.defaultPopupItemsPerPage
                window.dispatchEvent(new CustomEvent('themeChanged', {detail: {schema: this.themeSchema, color: this.themeColor}}))
            })
        },
        async autoChangeOpenTab () {
            for (const tab of this.optionTabs) {
                if (tab.id === this.configTabs.main) {
                    this.changeOpenTab(tab.id)
                    chrome.storage.local.set({'optionsTab': ''})

                    break
                }
            }
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
                defaultPopupItemsPerPage: this.defaultPopupItemsPerPage,
            }})
        },
        changeOpenTab (tab) {
            this.openTab = tab
        },
        async changeMainTab (tab) {
            this.configTabs.main = tab
            await chrome.storage.local.set({'optionsTab': tab})
        },
        changeDefaultPopupItemsPerPage(items) {
            this.defaultPopupItemsPerPage = items
            this.updateInStorage()
        },
        async restore(){
            const configRequest = await fetch(chrome.runtime.getURL('config.json'))
            const config = await configRequest.json()

            await chrome.storage.local.clear()
            await chrome.storage.local.set(config)
        },
    },
})
