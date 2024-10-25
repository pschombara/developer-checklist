<script setup>
import {computed, ref, toRaw, watch} from 'vue'
import Theme from '../mixins/theme'
import {useMainStorage} from '../stores/mainStorage'
import OptionGeneral from '../components/options/OptionGeneral.vue'
import ChatOptionsView from '../components/options/ChatOptionsView.vue'
import CheatSheet from '../components/options/CheatSheet.vue'
import GitLab from '../components/options/GitLab.vue'
import JenkinsOptionsView from '../components/options/JenkinsOptionsView.vue'
import JiraOptionsView from '../components/options/JiraOptionsView.vue'
import semver from 'semver'
import Migration from '../mixins/migration.js'

const loading = ref(true)

const i18n = chrome.i18n

const text = {
    title: i18n.getMessage('extOptionsTitle'),
    save: i18n.getMessage('Save'),
    export: i18n.getMessage('Export'),
    import: i18n.getMessage('Import'),
    restore: i18n.getMessage('Restore'),
    reset: i18n.getMessage('Reset'),
    cancel: i18n.getMessage('Cancel'),
    close: i18n.getMessage('Close'),
    importWrongType: i18n.getMessage('importWrongType'),
    importEmptyFile: i18n.getMessage('importEmptyFile'),
    importNotSupported: i18n.getMessage('importNotSupported'),
    settingsSaved: i18n.getMessage('settingsSaved'),
}

const exportModules = ref([])
const importModules = ref([])
const importAvailableModules = ref([])
const exportLink = ref()
const importConfig = ref()
const importOptions = ref({})

const dialog = ref({
    restore: false,
    export: false,
    import: false,
    error: {
        empty: false,
        type: false,
        notSupported: false,
    },
})

const mainStorage = useMainStorage()

const theme = new Theme()
theme.registerThemeChanged(mainStorage.getThemeSchema, mainStorage.getThemeColor)

const modules = computed(() => mainStorage.getModules)

const tab = computed( {
    get() {
        return mainStorage.getOpenTab
    },
    set(value) {
        mainStorage.changeOpenTab(value)
    },
})

const tabs = computed(() => mainStorage.getOptionTabs)
const settings = computed(() => tabs.value.filter(tab => tab.settings))

watch(modules, () => {
    for (const [module, active] of Object.entries(modules.value)) {
        const index = exportModules.value.findIndex(entry => entry === module)

        if (false === active && -1 !== index) {
            exportModules.value.splice(index, 1)
        }

        if (active && -1 === index) {
            exportModules.value.push(module)
        }
    }
})

const showTab = (tab) => modules.value[tab.id] ?? true
const themeSchemaChanged = () => theme.changeSchema(mainStorage.getThemeSchema)
const themeColorChanged = () => theme.changeColor(mainStorage.getThemeColor)
const openRestore = () => dialog.value.restore = true
const closeRestore = () => dialog.value.restore = false

const restore = async () => {
    loading.value = true
    closeRestore()

    await mainStorage.restore()
    loading.value = false

    window.location.reload()
}

const openExport = () => dialog.value.export = true
const closeExport = () => dialog.value.export = false

const triggerExport = async () => {
    loading.value = true

    const exportConfig = await mainStorage.exportOptions(exportModules.value)
    exportLink.value.href = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportConfig))}`
    exportLink.value.click()

    closeExport()
    loading.value = false
}

const openFileInput = () => importConfig.value.click()

const fileSelected = async file => {
    closeAlerts()

    if (file.size <= 0) {
        dialog.value.error.empty = true

        return
    }

    if ('application/json' !== file.type) {
        dialog.value.error.type = true

        return
    }


    const fileReader = new FileReader()

    fileReader.addEventListener('load', e => {
        const importedOptions = JSON.parse(e.target.result.toString())
        const migration = new Migration()

        if (migration.isSupported(importedOptions.version ?? '0.0.0')) {
            dialog.value.error.notSupported = true

            return
        }

        importOptions.value = importedOptions
        importAvailableModules.value = []
        importModules.value = []

        for (const module in importedOptions) {
            if (false === module.startsWith('options')) {
                continue
            }

            let moduleName = module.replace('options', '')
            moduleName = moduleName[0].toLowerCase() + moduleName.slice(1)
            importModules.value.push(moduleName)
            importAvailableModules.value.push(moduleName)
        }

        dialog.value.import = true
    })

    fileReader.readAsText(file, 'utf-8')
}

const cancelImport = () => {
    dialog.value.import = false
    importConfig.value.reset()
    importOptions.value = {}
}

const startImport = async () => {
    loading.value = true

    await mainStorage.importOptions(toRaw(importOptions.value), importModules.value)

    loading.value = false
    window.location.reload()
}

const closeAlerts = () => {
    dialog.value.error.type = false
    dialog.value.error.empty = false
    dialog.value.error.notSupported = false
}

const load = async () => {
    await mainStorage.load()
    loading.value = false

    exportModules.value.push('main')
    exportModules.value.push('jira')
}

load()
</script>

<template>
    <v-app>
        <v-main>
            <v-container fluid>
                <v-overlay v-model="loading" opacity=".75" class="align-center justify-center">
                    <v-progress-circular size="256" width="10" color="primary" indeterminate=""></v-progress-circular>
                </v-overlay>
                <v-alert v-model="dialog.error.type" type="error" dismissible>
                    {{text.importWrongType}}
                </v-alert>
                <v-alert v-model="dialog.error.empty" type="error" dismissible>
                    {{text.importEmptyFile}}
                </v-alert>
                <v-alert v-model="dialog.error.notSupported" type="error" dismissible>
                    {{text.importNotSupported}}
                </v-alert>
                <v-toolbar flat>
                    <v-img src="icons/48.png" max-height="24" max-width="24" class="ml-4"></v-img>
                    <v-toolbar-title>{{ text.title }}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-tooltip location="bottom">
                        <template #activator="{ props }">
                            <v-btn class="mr-2" fab icon="fas fa-download" v-bind="props" @click="openExport"></v-btn>
                            <v-dialog v-model="dialog.export" max-width="800">
                                <v-card>
                                    <v-card-title>{{text.export}}</v-card-title>
                                    <v-card-text>
                                        <p>Select settings to export</p>
                                        <template v-for="setting in settings" :key="setting.id">
                                            <v-switch
                                                v-model="exportModules"
                                                color="primary"
                                                :label="setting.name"
                                                :value="setting.id"
                                                hide-details
                                            ></v-switch>
                                        </template>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="secondary" plain @click="closeExport">{{text.cancel}}</v-btn>
                                        <v-btn color="primary" plain :disabled="0 === exportModules.length" @click="triggerExport">{{text.export}}</v-btn>
                                        <v-spacer></v-spacer>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </template>
                        <span>{{text.export}}</span>
                    </v-tooltip>
                    <v-tooltip location="bottom">
                        <template #activator="{ props }">
                            <v-btn
                                class="mr-2"
                                fab
                                icon="fas fa-upload"
                                v-bind="props"
                                @click="openFileInput"
                            >
                            </v-btn>
                            <v-dialog v-model="dialog.import" max-width="800">
                                <v-card>
                                    <v-card-title>{{text.import}}</v-card-title>
                                    <v-card-text>
                                        <p>Select settings to import</p>
                                        <template v-for="setting in settings" :key="setting.id">
                                            <v-switch
                                                v-model="importModules"
                                                color="primary"
                                                :label="setting.name"
                                                :value="setting.id"
                                                :disabled="!importAvailableModules.includes(setting.id)"
                                                hide-details
                                            ></v-switch>
                                        </template>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="secondary" plain @click="cancelImport">{{text.cancel}}</v-btn>
                                        <v-btn color="primary" plain :disabled="0 === importModules.length" @click="startImport">{{text.import}}</v-btn>
                                        <v-spacer></v-spacer>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                            <v-file-input
                                ref="importConfig"
                                hide-input
                                class="d-none"
                                accept="application/json"
                                @update:model-value="fileSelected"
                            ></v-file-input>
                        </template>
                        <span>{{text.import}}</span>
                    </v-tooltip>
                    <v-tooltip location="bottom">
                        <template #activator="{ props }">
                            <v-btn class="mr-2" fab icon="fas fa-eraser" v-bind="props" @click="openRestore"></v-btn>
                            <v-dialog v-model="dialog.restore" max-width="600">
                                <v-card>
                                    <v-card-title>{{text.reset}}?</v-card-title>
                                    <v-card-text>{{text.restore}}</v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="grey" plain @click="closeRestore">
                                            {{ text.cancel }}
                                        </v-btn>
                                        <v-btn color="error" plain @click="restore">
                                            {{text.reset}}
                                        </v-btn>
                                        <v-spacer></v-spacer>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </template>
                        <span>{{text.restore}}</span>
                    </v-tooltip>
                </v-toolbar>
                <v-row v-if="modules">
                    <v-col>
                        <v-card>
                            <a v-show="false" ref="exportLink" download="developer-checklist-options"></a>
                            <v-tabs
                                v-model="tab"
                                show-arrows
                                stacked
                            >
                                <v-tab v-for="item in tabs" v-show="showTab(item)" :key="item.id" :value="item.id">
                                    <v-icon class="mb-2">{{ item.icon }}</v-icon>
                                    {{ item.name }}
                                </v-tab>
                            </v-tabs>
                        </v-card>
                        <v-card-text>
                            <v-window v-model="tab">
                                <v-window-item value="main">
                                    <option-general @theme-color-changed="themeColorChanged" @theme-schema-changed="themeSchemaChanged" />
                                </v-window-item>
                                <v-window-item value="jira">
                                    <JiraOptionsView />
                                </v-window-item>
                                <v-window-item value="jenkins">
                                    <JenkinsOptionsView />
                                </v-window-item>
                                <v-window-item value="gitLab">
                                    <git-lab />
                                </v-window-item>
                                <v-window-item value="chat">
                                    <chat-options-view />
                                </v-window-item>
                                <v-window-item value="cheatSheet">
                                    <cheat-sheet />
                                </v-window-item>
                            </v-window>
                        </v-card-text>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
        <v-footer class="justify-end mvh-5">
            <div>v{{mainStorage.getVersion}}</div>
        </v-footer>
    </v-app>
</template>

<style>
.mvh-5 {
    max-height: 5vh;
}
</style>
