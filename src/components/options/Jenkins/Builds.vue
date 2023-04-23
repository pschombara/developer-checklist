<template>
    <v-card flat class="ml-5">
        <v-card-title>{{ text.builds }}</v-card-title>
        <v-card-text>
            <v-data-table
                :headers="buildHeaders"
                :items="builds"
                :search="searchBuild"
                :sort-by="['name']"
                multi-sort
                show-group-by
                :group-by="[{key: 'type'}]"
            >
                <template #top>
                    <v-toolbar flat>
                        <v-toolbar-title>
                            <v-text-field
                                v-model="searchBuild"
                                prepend-icon="fas fa-search"
                                clear-icon="fas fa-times"
                                :label="text.search"
                                single-line
                                hide-details
                                clearable>
                            </v-text-field>
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn
                            variant="plain"
                            prepend-icon="fas fa-plus"
                            color="primary"
                            @click="openNewBuild">{{text.add}}</v-btn>
                        <v-dialog v-model="dialogBuild.open" max-width="450">
                            <v-form
                                validate-on="submit"
                                @submit.prevent="saveBuild"
                            >
                                <v-card>
                                    <v-card-title>{{ dialogBuild.title }}</v-card-title>
                                    <v-card-text>
                                            <v-autocomplete
                                                v-model="dialogBuild.item.type"
                                                :items="categories"
                                                :rules="buildTypeRules"
                                                :label="text.category"
                                                item-title="name"
                                                item-value="name"
                                            ></v-autocomplete>
                                            <v-text-field
                                                v-model="dialogBuild.item.name"
                                                :rules="buildNameRules"
                                                :label="text.name"
                                            ></v-text-field>
                                            <v-text-field
                                                v-model="dialogBuild.item.label"
                                                :label="text.label"
                                            ></v-text-field>
                                            <v-text-field
                                                v-model="dialogBuild.item.job"
                                                :rules="buildJobRules"
                                                :label="text.job"
                                            ></v-text-field>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="secondary" variant="plain" @click="closeDialogBuild">{{ text.cancel }}</v-btn>
                                        <v-btn
                                            type="submit"
                                            color="primary"
                                            variant="plain">{{ dialogBuild.saveButton }}
                                        </v-btn>
                                        <v-spacer></v-spacer>
                                    </v-card-actions>
                                </v-card>
                            </v-form>
                        </v-dialog>
                        <v-dialog v-model="dialogDeleteBuild" max-width="450">
                            <v-card>
                                <v-card-title class="headline">{{
                                        i18n.getMessage('TitleDelete', deleteBuild.name)
                                    }}
                                </v-card-title>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="secondary" plain @click="closeDialogDeleteBuild()">
                                        {{ text.cancel }}
                                    </v-btn>
                                    <v-btn color="tertiary" plain @click="removeBuild(deleteBuild)">
                                        {{ text.delete }}
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-toolbar>
                </template>
                <template #item.actions="{item}">
                    <v-btn
                        variant="plain"
                        icon="fas fa-edit"
                        size="small"
                        @click="openBuild(item)">
                        <v-icon icon="fas fa-edit" small />
                    </v-btn>
                    <v-btn
                        variant="plain"
                        icon="fas fa-trash"
                        size="small"
                        color="tertiary"
                        @click="openDialogDeleteBuild(item)"></v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>
<script>

export default {
    name: 'JenkinsBuilds',
    data() {
        return {
            buildNameRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
                value => false === this.checkBuildDuplicated(value) || chrome.i18n.getMessage('errDuplicated'),
            ],
            buildJobRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
            ],
            buildTypeRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
            ],
            i18n: chrome.i18n,
            text: {
                category: chrome.i18n.getMessage('Category'),
                newCategory: chrome.i18n.getMessage('NewCategory'),
                newBuild: chrome.i18n.getMessage('NewBuild'),
                search: chrome.i18n.getMessage('Search'),
                add: chrome.i18n.getMessage('Add'),
                save: chrome.i18n.getMessage('Save'),
                cancel: chrome.i18n.getMessage('Cancel'),
                delete: chrome.i18n.getMessage('Delete'),
                label: chrome.i18n.getMessage('Label'),
                name: chrome.i18n.getMessage('Name'),
                build: chrome.i18n.getMessage('Build'),
                builds: chrome.i18n.getMessage('Builds'),
                job: chrome.i18n.getMessage('Job'),
            },
            searchBuild: '',
            dialogDeleteBuild: false,
            dialogBuild: {
                open: false,
                title: '',
                current: null,
                item: {
                    uuid: null,
                    type: null,
                    job: null,
                    label: '',
                    name: '',
                },
                saveButton: '',
            },
            defaultBuild: {
                uuid: null,
                type: null,
                job: null,
                label: '',
                name: '',
            },
            deleteBuild: {},
        }
    },
    computed: {
        builds() {
            return this.$store.getters['jenkins/getBuilds']
        },
        buildHeaders() {
            return [
                {title: this.text.name, key: 'name', groupable: false},
                {title: this.text.label, key: 'label', groupable: false},
                {title: this.text.job, key: 'job', groupable: false},
                {title: '', key: 'actions', sortable: false, align: 'end', groupable: false},
            ]
        },
        categories() {
            return this.$store.getters['jenkins/getCategories']
        },
    },
    methods: {
        openBuild: function (build) {
            this.dialogBuild = {
                open: true,
                title: this.i18n.getMessage('TitleUpdate', build.raw.name),
                valid: true,
                current: build.raw,
                item: Object.assign({}, build.raw),
                saveButton: this.text.save,
            }
        },
        openNewBuild: function () {
            this.dialogBuild = {
                open: true,
                title: this.text.newBuild,
                valid: false,
                current: null,
                item: Object.assign({}, this.defaultBuild),
                saveButton: this.text.add,
            }
        },
        openDialogDeleteBuild: function (build) {
            this.dialogDeleteBuild = true
            this.deleteBuild = Object.assign({}, build.raw)
        },
        closeDialogBuild: function () {
            this.dialogBuild.open = false
            this.dialogBuild.current = null
        },
        async saveBuild (event) {
            const result = await event

            if (false === result.valid) {
                return
            }

            if (null === this.dialogBuild.item.uuid) {
                this.$store.dispatch('jenkins/addBuild', this.dialogBuild.item)
            } else {
                this.$store.dispatch(
                    'jenkins/updateBuild',
                    {
                        previous: this.dialogBuild.current,
                        build: this.dialogBuild.item,
                    },
                )
            }

            this.closeDialogBuild()
        },
        removeBuild: function (build) {
            this.$store.dispatch('jenkins/removeBuild', build)
            this.closeDialogDeleteBuild()
        },
        closeDialogDeleteBuild: function () {
            this.dialogDeleteBuild = false
            this.deleteBuild = {}
        },
        checkBuildDuplicated: function (value) {
            if (null === value) {
                return false
            }

            let item = this.dialogBuild.item
            let builds = this.$store.getters['jenkins/getBuilds']

            let searchResult = builds.find(build => build.type === item.type && build.name.toLowerCase() === item.name.toLowerCase())

            if (undefined === searchResult) {
                return false
            }

            if (null === this.dialogBuild.current) {
                return true
            }

            return searchResult.uuid !== item.uuid || this.dialogBuild.current.uuid !== item.uuid
        },
    },
}
</script>
