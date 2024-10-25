import {defineStore} from 'pinia'
import Migration from '../utils/migration.ts'

const migration = new Migration()

export const useMainStorage = defineStore('mainStorage', {
    state: () => ({
        modules: {
            chat: false,
            cheatSheet: false,
            gitLab: false,
            jenkins: false,
        },
        version: migration.version,
        themeSchema: 'system',
        themeColor: 'blue',
        defaultPopupItemsPerPage: -1,
        openTab: '',
        optionTabs: [
            { id: 'main', name: browser.i18n.getMessage('general'), icon: 'fas fa-cogs', settings: true },
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
            browser.storage.onChanged.addListener((changes, area) => {
                if ('local' !== area) {
                    return
                }

                if ('main' !== (changes.optionsTab?.newValue ?? 'main')) {
                    this.openTab = changes.optionsTab.newValue
                } else if (changes.optionsMain?.newValue.theme.color !== changes.optionsMain?.oldValue?.theme.color
                    || changes.optionsMain?.newValue.theme.schema !== changes.optionsMain?.oldValue?.theme.schema
                ) {
                    window.dispatchEvent(new CustomEvent('themeChanged', {detail: changes.optionsMain?.newValue.theme}))
                }
            })

            await migration.migrate()

            let result = await browser.storage.local.get('optionsMain')

            if (undefined === result.optionsMain) {
                result = await this.restore()
            }

            this.modules = result.optionsMain.modules
            this.themeSchema = result.optionsMain.theme.schema
            this.themeColor = result.optionsMain.theme.color
            this.defaultPopupItemsPerPage = result.optionsMain.defaultPopupItemsPerPage
            window.dispatchEvent(new CustomEvent('themeChanged', {detail: {schema: this.themeSchema, color: this.themeColor}}))

            const openTab = await browser.storage.local.get('optionsTab')
            this.openTab = openTab.optionsTab ?? 'main'
            await browser.storage.local.set({optionsTab: 'main'})
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
            browser.storage.local.set({'optionsMain': {
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
            await browser.storage.local.set({optionsTab: tab})
        },
        changeDefaultPopupItemsPerPage(items) {
            this.defaultPopupItemsPerPage = items
            this.updateInStorage()
        },
        async restore(){
            const configRequest = await fetch(browser.runtime.getURL('config.json'))
            const config = await configRequest.json()

            await browser.storage.local.clear()
            await browser.storage.local.set(config)

            return config
        },
        async exportOptions(exportModules) {
            const exportConfig = {
                version: migration.version,
            }

            for (const module of exportModules) {
                const name = `options${module[0].toUpperCase()}${module.slice(1)}`
                const config = await browser.storage.local.get(name)

                exportConfig[name] = config[name]
            }

            return exportConfig
        },
        async importOptions(importData, importModules) {
            const storeOptions = {}

            for (const module of importModules) {
                const name = `options${module[0].toUpperCase()}${module.slice(1)}`

                storeOptions[name] = importData[name]
            }

            await browser.storage.local.set(storeOptions)
        },
    },
})
