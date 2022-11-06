<template>
    <v-app>
        <v-main>
            <v-container fluid>
                <div v-if="loading">
                    <v-overlay opacity=".75">
                        <v-progress-circular size="256" width="10" color="orange" indeterminate=""></v-progress-circular>
                    </v-overlay>
                </div>
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
                        <template v-slot:activator="{ props }">
                            <v-btn class="mr-2" color="success" fab icon="" v-bind="props" @click="save"><v-icon>fas fa-save</v-icon></v-btn>
                        </template>
                        <span>{{text.save}}</span>
                    </v-tooltip>
                    <v-tooltip location="bottom">
                        <template v-slot:activator="{ props }">
                            <v-btn class="mr-2" fab icon="" v-bind="props" @click="saveExportStart"><v-icon>fas fa-download</v-icon></v-btn>
                            <v-dialog v-model="dialog.export" max-width="800">
                                <v-card>
                                    <v-card-title>{{text.export}}</v-card-title>
                                    <v-card-text>
                                        <v-list flat>
                                            <v-list-subheader>Select settings to export</v-list-subheader>

                                            <v-list-group
                                                v-model="exportModules"
                                                multiple
                                            >
                                                <template v-for="setting in settings" :key="setting.id">
                                                    <v-list-item
                                                        :value="setting.id"
                                                    >
                                                        <template v-slot:default="{ active }">
                                                            <v-list-item-action>
                                                                <v-checkbox :input-value="active" color="primary"></v-checkbox>
                                                            </v-list-item-action>
                                                            <v-list-item-header>
                                                                <v-list-item-title>{{setting.name}}</v-list-item-title>
                                                            </v-list-item-header>
                                                        </template>
                                                    </v-list-item>
                                                </template>
                                            </v-list-group>
                                        </v-list>
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
                        <template v-slot:activator="{ props }">
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
                                        <v-list flat>
                                            <v-list-subheader>Select settings to import</v-list-subheader>

                                            <v-list-group
                                                v-model="importModules"
                                                multiple
                                            >
                                                <template v-for="setting in settings" :key="setting.id">
                                                    <v-list-item
                                                        :value="setting.id"
                                                        :disabled="!importAvailableModules.includes(setting.id)"
                                                    >
                                                        <template v-slot:default="{ active }">
                                                            <v-list-item-avatar>
                                                                <v-checkbox :modal-value="active" color="primary" hide-details></v-checkbox>
                                                            </v-list-item-avatar>
                                                            <v-list-item-header>
                                                                <v-list-item-title>{{setting.name}}</v-list-item-title>
                                                            </v-list-item-header>
                                                        </template>
                                                    </v-list-item>
                                                </template>
                                            </v-list-group>
                                        </v-list>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="grey" plain @click="cancelImport">{{text.cancel}}</v-btn>
                                        <v-btn color="success" plain @click="storeImportedOptions" :disabled="0 === importModules.length">{{text.import}}</v-btn>
                                        <v-spacer></v-spacer>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                            <v-file-input
                                ref="importConfig"
                                hide-input
                                class="d-none"
                                accept="application/json"
                                @update:modelValue="fileSelected"
                            ></v-file-input>
                        </template>
                        <span>{{text.import}}</span>
                    </v-tooltip>
                    <v-tooltip location="bottom">
                        <template v-slot:activator="{ props }">
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
                                show-arrows
                                stacked
                                v-model="tab"
                            >
                                <v-tab v-for="item in tabs" :key="item.id" v-show="showTab(item)" :value="item.id">
                                    <v-icon class="mb-2">{{ item.icon }}</v-icon>
                                    {{ item.name }}
                                </v-tab>
                            </v-tabs>
                        </v-card>
                        <v-card-text>
                            <v-window v-model="tab">
                                <v-window-item value="general">
                                    <general></general>
                                </v-window-item>
                                <v-window-item value="jira">
                                    <jira></jira>
                                </v-window-item>
                                <v-window-item value="jenkins">
                                    <jenkins></jenkins>
                                </v-window-item>
                                <v-window-item value="gitLab">
                                    <git-lab></git-lab>
                                </v-window-item>
                                <v-window-item value="chat">
                                    <chat></chat>
                                </v-window-item>
                                <v-window-item value="cheatSheet">
                                    <cheat-sheet></cheat-sheet>
                                </v-window-item>
                                <v-window-item value="about">
                                    <about></about>
                                </v-window-item>
                            </v-window>
                        </v-card-text>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>
<script>

import Jira from '@/components/options/Jira'
import Jenkins from '@/components/options/Jenkins'
import GitLab from '@/components/options/GitLab'
import Chat from '@/components/options/Chat'
import CheatSheet from '@/components/options/CheatSheet'
import About from '@/components/options/About'
import Theme from '@/mixins/theme'
/* import Chrome from '@/components/options/Chrome' */
import semver from 'semver'
import General from '@/components/options/General'

export default {
    name: 'App',
    components: {General, Jira, Jenkins, GitLab, Chat, CheatSheet, /*Chrome,*/ About },
    computed: {
        modules()  {
            return this.$store.getters['modules']
        },
        tab: {
            get() {
                return this.$store.getters['openTab']
            },
            set(value) {
                this.$store.dispatch('openTab', value)
            },
        },
        tabs() {
            return this.$store.getters['optionTabs']
        },
        settings() {
            return this.$store.getters['optionTabs'].filter(tab => tab.settings)
        },
    },
    methods: {
        load: function () {
            this.$store.dispatch('load').then(() => {
                this.loading = false

                this.exportModules.push('modules')
                this.exportModules.push('jira')

                for (let [module, active] of Object.entries(this.modules)) {
                    if (active) {
                        this.exportModules.push(module)
                    }
                }
            })
        },
        showTab: function (tab) {
            if (Object.prototype.hasOwnProperty.call(this.modules, tab.id)) {
                return this.modules[tab.id]
            } else {
                return true
            }
        },
        openRestore: function () {
            this.dialog.restore = true
        },
        closeRestore: function () {
            this.dialog.restore = false
        },
        restore: function () {
            this.loading = true
            this.closeRestore()

            this.$store.dispatch('restore').then(() => {
                this.load()
            })
        },
        save: function () {
            this.closeAlerts()
            this.loading = true

            this.$store.dispatch('saveOptions').then(() => {
                this.loading = false
                this.alert.saved = true
            })
        },
        saveExportStart: function () {
            this.closeAlerts()
            this.dialog.export = true
        },
        cancelExport: function () {
            this.dialog.export = false
        },
        cancelImport: function () {
            this.dialog.import = false
            this.$refs.importConfig.reset()
            this.importOptions = {}
        },
        saveExport: function () {
            this.loading = true

            this.$store.dispatch('saveExportOptions', this.exportModules).then(data => {
                const temp = document.createElement('a')
                temp.setAttribute(
                    'href',
                    'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)),
                )

                temp.setAttribute('download', 'developer-checklist-options')
                temp.classList.add('d-none')

                document.body.appendChild(temp)
                temp.click()
                document.body.removeChild(temp)

                this.loading = false
                this.alert.saved = true
                this.dialog.export = false
            })
        },
        openFileInput: function () {
            this.closeAlerts()
            this.$refs.importConfig.click()
        },
        fileSelected: function (files) {
            if (null === files) {
                return
            }

            const file = files[0]

            if (file.size <= 0) {
                this.dialog.error.empty = true

                return
            }

            if ('application/json' !== file.type) {
                this.dialog.error.type = true

                return
            }

            const fileReader = new FileReader()

            fileReader.addEventListener('load', e => {
                try {
                    const data = JSON.parse(e.target.result.toString())

                    if (this.validateImportFile(data)) {
                        this.importAvailableModules = data.exported
                        this.importModules = data.exported
                        this.importOptions = data.options
                        this.dialog.import = true
                    }
                } catch (e) {
                    console.error(e)
                }
            })

            fileReader.readAsText(file, 'utf-8')
        },
        validateImportFile: function (data) {
            const manifest = chrome.runtime.getManifest()

            return typeof data === 'object'
                && Object.prototype.hasOwnProperty.call(data, 'exported')
                && Object.prototype.hasOwnProperty.call(data, 'options')
                && semver.gte(data.options.version, manifest.version)
        },
        closeAlerts: function () {
            this.alert.import.type = false
            this.alert.saved = false
        },
        storeImportedOptions: function () {
            this.dialog.import = false
            this.loading = true

            this.$store.dispatch('import', {
                options: this.importOptions,
                importSettings: this.importModules,
            }).then(() => {
                this.loading = false
            })
        },
    },
    created() {
        this.load()

        const theme = new Theme()
        theme.registerThemeChanged(this)
    },
    data() {
        return {
            loading: true,
            text: {
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
            },
            exportModules: [],
            importModules: [],
            importAvailableModules: [],
            importOptions: {},
            dialog: {
                restore: false,
                export: false,
                import: false,
                error: {
                    empty: false,
                    type: false,
                },
            },
            alert: {
                import: {
                    type: false,
                },
                saved: false,
            },
        }
    },
}
</script>
