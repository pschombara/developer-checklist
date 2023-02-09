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
                :group-by="['type']"
            >
                <template v-slot:top>
                    <v-toolbar flat>
                        <v-text-field
                            v-model="searchBuild"
                            prepend-icon="fas fa-search"
                            clear-icon="fas fa-times"
                            :label="text.search"
                            single-line
                            hide-details
                            clearable
                        >
                        </v-text-field>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="openNewBuild">
                            <v-icon left x-small>fas fa-plus</v-icon>
                            {{ text.add }}
                        </v-btn>
                        <v-dialog v-model="dialogBuild.open" max-width="450">
                            <v-card>
                                <v-card-title>{{ dialogBuild.title }}</v-card-title>
                                <v-card-text>
                                    <v-form
                                        ref="buildForm"
                                        v-model="dialogBuild.valid"
                                    >
                                        <v-autocomplete
                                            v-model="dialogBuild.item.type"
                                            :items="categories"
                                            :rules="buildTypeRules"
                                            :label="text.category"
                                            item-title="name"
                                            item-value="name"
                                            required
                                            @change="$refs.buildForm.validate()"
                                        ></v-autocomplete>
                                        <v-text-field
                                            v-model="dialogBuild.item.name"
                                            :rules="buildNameRules"
                                            :label="text.name"
                                            required
                                        ></v-text-field>
                                        <v-text-field
                                            v-model="dialogBuild.item.label"
                                            :label="text.label"
                                        ></v-text-field>
                                        <v-text-field
                                            v-model="dialogBuild.item.job"
                                            :rules="buildJobRules"
                                            :label="text.job"
                                            required
                                        ></v-text-field>
                                    </v-form>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="grey" plain @click="closeDialogBuild">{{ text.cancel }}</v-btn>
                                    <v-btn color="primary" plain v-if="null === dialogBuild.item.uuid"
                                           :disabled="!dialogBuild.valid" @click="addBuild">{{ text.add }}
                                    </v-btn>
                                    <v-btn color="primary" plain v-else :disabled="!dialogBuild.valid"
                                           @click="saveBuild">{{ text.save }}
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                        <v-dialog v-model="dialogDeleteBuild" max-width="450">
                            <v-card>
                                <v-card-title class="headline">{{
                                        i18n.getMessage('TitleDelete', deleteBuild.name)
                                    }}
                                </v-card-title>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="grey" plain @click="closeDialogDeleteBuild()">
                                        {{ text.cancel }}
                                    </v-btn>
                                    <v-btn color="error" plain @click="removeBuild(deleteBuild)">
                                        {{ text.delete }}
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-toolbar>
                </template>
                <template v-slot:item.actions="{item}">
                    <v-btn icon @click="openBuild(item)" small>
                        <v-icon icon="fas fa-edit" small />
                    </v-btn>
                    <v-btn icon @click="openDialogDeleteBuild(item)" small>
                        <v-icon icon="fas fa-trash" small color="red darken-2" />
                    </v-btn>
                </template>
                <template v-slot:group.header="{headers, isOpen, toggle, remove, group}">
                    <th :colspan="headers.length - 1">
                        <v-btn icon @click="toggle" class="mr-2" small>
                            <v-icon :icon="isOpen ? 'fas fa-caret-up' : 'fas fa-caret-down'"/>
                        </v-btn>
                        {{ group }}
                    </th>
                    <th class="text-right">
                        <v-btn icon @click="remove" x-small>
                            <v-icon icon="fas fa-times" />
                        </v-btn>
                    </th>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>
<script>

export default {
    name: 'JenkinsBuilds',
    computed: {
        builds() {
            return this.$store.getters['jenkins/getBuilds']
        },
        buildHeaders() {
            return [
                {title: this.text.category, value: 'type'},
                {title: this.text.name, value: 'name', groupable: false},
                {title: this.text.label, value: 'label', groupable: false},
                {title: this.text.job, value: 'job', groupable: false},
                {title: '', value: 'actions', sortable: false, align: 'end', groupable: false},
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
                title: this.i18n.getMessage('TitleUpdate', build.name),
                valid: true,
                current: build,
                item: Object.assign({}, build),
            }
        },
        openNewBuild: function () {
            this.dialogBuild = {
                open: true,
                title: this.text.newBuild,
                valid: false,
                current: null,
                item: Object.assign({}, this.defaultBuild),
            }
        },
        openDialogDeleteBuild: function (build) {
            this.dialogDeleteBuild = true
            this.deleteBuild = Object.assign({}, build)
        },
        closeDialogBuild: function () {
            this.dialogBuild.open = false
            this.dialogBuild.current = null
        },
        saveBuild: function () {
            if (this.$refs.buildForm.validate()) {
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
        addBuild: function () {
            if (this.$refs.buildForm.validate()) {
                this.$store.dispatch('jenkins/addBuild', this.dialogBuild.item)
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

            return this.dialogBuild.current.uuid !== item.uuid
        },
    },
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
                valid: false,
                current: null,
                item: {
                    uuid: null,
                    type: null,
                    job: null,
                    label: '',
                    name: '',
                },
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
}
</script>
