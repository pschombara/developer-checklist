<script setup>
import {computed, ref} from 'vue'
import Theme from '../mixins/theme'
import {useMainStorage} from '../stores/mainStorage'
import OptionGeneral from '../components/options/OptionGeneral.vue'

const loading = ref(true)

const text = {
    title: chrome.i18n.getMessage('extOptionsTitle'),
    save: chrome.i18n.getMessage('Save'),
    export: chrome.i18n.getMessage('Export'),
    import: chrome.i18n.getMessage('Import'),
    restore: chrome.i18n.getMessage('Restore'),
    reset: chrome.i18n.getMessage('Reset'),
    cancel: chrome.i18n.getMessage('Cancel'),
    close: chrome.i18n.getMessage('Close'),
    importWrongType: chrome.i18n.getMessage('importWrongType'),
    settingsSaved: chrome.i18n.getMessage('settingsSaved'),
}

const exportModules = ref([])
const importModules = ref([])
const importAvailableModules = ref([])
const importOptions = ref({})

const dialog = ref({
    restore: false,
    export: false,
    import: false,
    error: {
        empty: false,
        type: false,
    },
})

const alert = ref({
    import: {
        type: false,
    },
    saved: false,
})

const mainStorage = useMainStorage()

const theme = new Theme()
theme.registerThemeChanged(mainStorage.getThemeSchema, mainStorage.getThemeColor)

const modules = computed(() => {
    return mainStorage.getModules
})

const tab = computed( {
    get() {
        return mainStorage.getOpenTab
    },
    set(value) {
        mainStorage.changeOpenTab(value)
    },
})

const tabs = computed(() => {
    return mainStorage.getOptionTabs
})

const showTab = (tab) => {
    return modules.value[tab.id] ?? true
}

const themeSchemaChanged = () => {
    theme.changeColor(mainStorage.getThemeSchema)
}

const themeColorChanged = () => {
    theme.changeColor(mainStorage.getThemeColor)
}

mainStorage.load()
loading.value = false

</script>

<template>
    <v-app>
        <v-main>
            <v-container fluid>
                <v-overlay v-model="loading" opacity=".75" class="align-center justify-center">
                    <v-progress-circular size="256" width="10" color="orange" indeterminate=""></v-progress-circular>
                </v-overlay>
                <v-alert v-model="alert.saved" type="success" dismissible>
                    {{text.settingsSaved}}
                </v-alert>
                <v-alert v-model="alert.import.type" type="error" dismissible>
                    {{text.importWrongType}}
                </v-alert>
                <v-toolbar flat>
                    <v-img src="icons/48.png" max-height="24" max-width="24" class="ml-4"></v-img>
                    <v-toolbar-title>{{ text.title }}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-tooltip location="bottom">
                        <template #activator="{ props }">
                            <v-btn class="mr-2" color="success" fab icon="fas fa-save" v-bind="props" @click="save"></v-btn>
                        </template>
                        <span>{{text.save}}</span>
                    </v-tooltip>
                    <v-tooltip location="bottom">
                        <template #activator="{ props }">
                            <v-btn class="mr-2" fab icon="fas fa-download" v-bind="props" @click="saveExportStart"></v-btn>
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
                                        <v-btn color="grey" plain @click="cancelExport">{{text.cancel}}</v-btn>
                                        <v-btn color="success" plain @click="saveExport">{{text.export}}</v-btn>
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
                                                v-model="exportModules"
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
                                        <v-btn color="success" plain :disabled="0 === importModules.length" @click="storeImportedOptions">{{text.import}}</v-btn>
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
                                <v-window-item value="general">
                                    <OptionGeneral @theme-color-changed="themeColorChanged" @theme-schema-changed="themeSchemaChanged"></OptionGeneral>
                                </v-window-item>
<!--                                <v-window-item value="jira">-->
<!--                                    <jira></jira>-->
<!--                                </v-window-item>-->
<!--                                <v-window-item value="jenkins">-->
<!--                                    <jenkins></jenkins>-->
<!--                                </v-window-item>-->
<!--                                <v-window-item value="gitLab">-->
<!--                                    <git-lab></git-lab>-->
<!--                                </v-window-item>-->
<!--                                <v-window-item value="chat">-->
<!--                                    <chat></chat>-->
<!--                                </v-window-item>-->
<!--                                <v-window-item value="cheatSheet">-->
<!--                                    <cheat-sheet></cheat-sheet>-->
<!--                                </v-window-item>-->
<!--                                <v-window-item value="about">-->
<!--                                    <about></about>-->
<!--                                </v-window-item>-->
                            </v-window>
                        </v-card-text>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>
<!--<script>-->

<!--import Jira from '../components/options/Jira.vue'-->
<!--import Jenkins from '../components/options/Jenkins.vue'-->
<!--import GitLab from '../components/options/GitLab.vue'-->
<!--import Chat from '../components/options/Chat.vue'-->
<!--import CheatSheet from '../components/options/CheatSheet.vue'-->
<!--import About from '../components/options/About.vue'-->
<!--import Theme from '../mixins/theme'-->
<!--/* import Chrome from '../components/options/Chrome.vue' */-->
<!--import semver from 'semver'-->
<!--import Migration from '../mixins/migration'-->

<!--export default {-->
<!--    name: 'App',-->
<!--    components: {General, Jira, Jenkins, GitLab, Chat, CheatSheet, /*Chrome,*/ About },-->
<!--    computed: {-->
<!--        modules()  {-->
<!--            return this.$store.getters['modules']-->
<!--        },-->
<!--        tab: {-->
<!--            get() {-->
<!--                return this.$store.getters['openTab']-->
<!--            },-->
<!--            set(value) {-->
<!--                this.$store.dispatch('openTab', value)-->
<!--            },-->
<!--        },-->
<!--        tabs() {-->
<!--            return this.$store.getters['optionTabs']-->
<!--        },-->
<!--        settings() {-->
<!--            return this.$store.getters['optionTabs'].filter(tab => tab.settings)-->
<!--        },-->
<!--    },-->
<!--    created() {-->
<!--        this.load()-->

<!--        this.theme = new Theme()-->
<!--        this.theme.registerThemeChanged(this, this.$store.getters['themeSchema'], this.$store.getters['themeColor'])-->
<!--    },-->
<!--    methods: {-->
<!--        load: function () {-->
<!--            this.$store.dispatch('load').then(() => {-->
<!--                this.loading = false-->

<!--                this.exportModules.push('general')-->
<!--                this.exportModules.push('jira')-->

<!--                for (let [module, active] of Object.entries(this.modules)) {-->
<!--                    if (active) {-->
<!--                        this.exportModules.push(module)-->
<!--                    }-->
<!--                }-->
<!--            })-->
<!--        },-->
<!--        showTab: function (tab) {-->
<!--            if (Object.prototype.hasOwnProperty.call(this.modules, tab.id)) {-->
<!--                return this.modules[tab.id]-->
<!--            } else {-->
<!--                return true-->
<!--            }-->
<!--        },-->
<!--        themeSchemaChanged: function (schema) {-->
<!--            this.theme.changeSchema(schema)-->
<!--        },-->
<!--        themeColorChanged: function (color) {-->
<!--            this.theme.changeColor(color)-->
<!--        },-->
<!--        openRestore: function () {-->
<!--            this.dialog.restore = true-->
<!--        },-->
<!--        closeRestore: function () {-->
<!--            this.dialog.restore = false-->
<!--        },-->
<!--        restore: function () {-->
<!--            this.loading = true-->
<!--            this.closeRestore()-->

<!--            this.$store.dispatch('restore').then(() => {-->
<!--                this.load()-->
<!--            })-->
<!--        },-->
<!--        save: function () {-->
<!--            this.closeAlerts()-->
<!--            this.loading = true-->

<!--            this.$store.dispatch('saveOptions').then(() => {-->
<!--                this.loading = false-->
<!--                this.alert.saved = true-->
<!--            })-->
<!--        },-->
<!--        saveExportStart: function () {-->
<!--            this.closeAlerts()-->
<!--            this.dialog.export = true-->
<!--        },-->
<!--        cancelExport: function () {-->
<!--            this.dialog.export = false-->
<!--        },-->
<!--        cancelImport: function () {-->
<!--            this.dialog.import = false-->
<!--            this.$refs.importConfig.reset()-->
<!--            this.importOptions = {}-->
<!--        },-->
<!--        saveExport: function () {-->
<!--            this.loading = true-->

<!--            this.$store.dispatch('saveExportOptions', this.exportModules).then(data => {-->
<!--                const temp = document.createElement('a')-->
<!--                temp.setAttribute(-->
<!--                    'href',-->
<!--                    'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)),-->
<!--                )-->

<!--                temp.setAttribute('download', 'developer-checklist-options')-->
<!--                temp.classList.add('d-none')-->

<!--                document.body.appendChild(temp)-->
<!--                temp.click()-->
<!--                document.body.removeChild(temp)-->

<!--                this.loading = false-->
<!--                this.alert.saved = true-->
<!--                this.dialog.export = false-->
<!--            })-->
<!--        },-->
<!--        openFileInput: function () {-->
<!--            this.closeAlerts()-->
<!--            this.$refs.importConfig.click()-->
<!--        },-->
<!--        fileSelected: function (file) {-->
<!--            if (file.size <= 0) {-->
<!--                this.dialog.error.empty = true-->

<!--                return-->
<!--            }-->

<!--            if ('application/json' !== file.type) {-->
<!--                this.dialog.error.type = true-->

<!--                return-->
<!--            }-->

<!--            const fileReader = new FileReader()-->

<!--            fileReader.addEventListener('load', e => {-->
<!--                try {-->
<!--                    let data = JSON.parse(e.target.result.toString())-->
<!--                    const migration = new Migration()-->

<!--                    if (this.validateImportFile(data)) {-->
<!--                        data = migration.migrate(data.options, data.exported, false)-->
<!--                        this.importAvailableModules = data.exported-->
<!--                        this.importModules = data.exported-->
<!--                        this.importOptions = data.options-->
<!--                        this.dialog.import = true-->
<!--                    }-->
<!--                } catch (e) {-->
<!--                    // eslint-disable-next-line no-console-->
<!--                    console.error(e)-->
<!--                }-->
<!--            })-->

<!--            fileReader.readAsText(file, 'utf-8')-->
<!--        },-->
<!--        validateImportFile: function (data) {-->
<!--            const manifest = chrome.runtime.getManifest()-->

<!--            return typeof data === 'object'-->
<!--                && Object.prototype.hasOwnProperty.call(data, 'exported')-->
<!--                && Object.prototype.hasOwnProperty.call(data, 'options')-->
<!--                && semver.lte('0.6.0', manifest.version, 1)-->
<!--        },-->
<!--        closeAlerts: function () {-->
<!--            this.alert.import.type = false-->
<!--            this.alert.saved = false-->
<!--        },-->
<!--        storeImportedOptions: function () {-->
<!--            this.dialog.import = false-->
<!--            this.loading = true-->

<!--            this.$store.dispatch('import', {-->
<!--                options: this.importOptions,-->
<!--                importSettings: this.importModules,-->
<!--            }).then(() => {-->
<!--                this.loading = false-->
<!--            })-->
<!--        },-->
<!--    },-->
<!--}-->
<!--</script>-->
