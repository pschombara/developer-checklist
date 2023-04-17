<template>
    <v-card flat class="mt-5">
        <v-card-text>
            <v-row>
                <v-col cols="12" sm="6" md="3">
                    <v-text-field v-model="host" :label="text.host" :rules="hostRules" clearable clear-icon="fas fa-times"></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="7">
                    <v-card>
                        <v-card-title>{{text.projects}}</v-card-title>
                        <v-card-text>
                            <v-data-table
                                :headers="projectsHeader"
                                :items="projects"
                                :search="searchProject"
                                :sort-by="['domain', 'project']"
                                multi-sort
                                show-group-by
                                :group-by="[{key: 'domain'}]"
                            >
                                <template #top>
                                    <v-toolbar flat>
                                        <v-text-field
                                            v-model="searchProject"
                                            prepend-icon="fas fa-search"
                                            clear-icon="fas fa-times"
                                            :label="text.search"
                                            single-line
                                            hide-details
                                            clearable
                                        ></v-text-field>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                            variant="plain"
                                            prepend-icon="fas fa-plus"
                                            color="primary"
                                            @click="openNewProject">{{text.add}}</v-btn>
                                        <v-dialog v-model="dialogProject.open" max-width="450">
                                            <v-card>
                                                <v-card-title>{{dialogProject.title}}</v-card-title>
                                                <v-card-text>
                                                    <v-form
                                                        ref="projectForm"
                                                        v-model="dialogProject.valid"

                                                    >
                                                        <v-autocomplete
                                                            v-model="dialogProject.item.domain"
                                                            :items="categories"
                                                            :label="text.category"
                                                            item-title="name"
                                                            item-value="name"
                                                            :rules="domainRules"
                                                            required
                                                            @change="$refs.projectForm.validate()"
                                                        ></v-autocomplete>
                                                        <v-text-field
                                                            v-model="dialogProject.item.project"
                                                            :rules="projectRules"
                                                            :label="text.project"
                                                            required
                                                        ></v-text-field>
                                                    </v-form>
                                                </v-card-text>
                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                    <v-btn color="secondary" plain @click="closeProject">{{ text.cancel }}</v-btn>
                                                    <v-btn v-if="null === dialogProject.item.uuid" color="primary" plain :disabled="!dialogProject.valid" @click="addProject">{{ text.add }}</v-btn>
                                                    <v-btn v-else color="primary" plain :disabled="!dialogProject.valid" @click="saveProject">{{ text.save }}</v-btn>
                                                    <v-spacer></v-spacer>
                                                </v-card-actions>
                                            </v-card>
                                        </v-dialog>
                                        <v-dialog v-model="dialogDeleteProject" max-width="450">
                                            <v-card>
                                                <v-card-title class="headline">{{ i18n.getMessage('TitleDelete', deleteProject.project) }}</v-card-title>
                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                    <v-btn color="secondary" plain @click="closeDialogDeleteProject()">
                                                        {{ text.cancel }}</v-btn>
                                                    <v-btn color="tertiary" plain @click="removeProject(deleteProject)">
                                                        {{ text.delete }}</v-btn>
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
                                        @click="openProject(item)"> </v-btn>
                                    <v-btn
                                        variant="plain"
                                        icon="fas fa-trash"
                                        size="small"
                                        color="tertiary"
                                        @click="openDialogDeleteProject(item)"></v-btn>
                                </template>
                            </v-data-table>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" md="5">
                    <v-card>
                        <v-card-title>{{text.categories}}</v-card-title>
                        <v-card-text>
                            <v-data-table
                                :headers="categoriesHeader"
                                :items="categories"
                                :search="searchCategory"
                                :sort-by="['name']"
                            >
                                <template #top>
                                    <v-toolbar flat>
                                        <v-text-field
                                            v-model="searchCategory"
                                            prepend-icon="fas fa-search"
                                            clear-icon="fas fa-times"
                                            :label="text.search"
                                            single-line
                                            hide-details
                                            clearable
                                        ></v-text-field>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                            variant="plain"
                                            prepend-icon="fas fa-plus"
                                            color="primary"
                                            @click="openNewCategory">{{text.add}}</v-btn>
                                        <v-dialog v-model="dialogCategory.open" max-width="450">
                                            <v-card>
                                                <v-card-title>{{ dialogCategory.title }}</v-card-title>
                                                <v-card-text>
                                                    <v-form ref="categoryForm" v-model="dialogCategory.valid">
                                                        <v-text-field
                                                            v-model="dialogCategory.item.name"
                                                            :rules="categoryRules"
                                                            :label="text.name"
                                                        ></v-text-field>
                                                    </v-form>
                                                </v-card-text>
                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                    <v-btn color="grey" plain @click="closeDialogCategory">{{ text.cancel }}</v-btn>
                                                    <v-btn v-if="null === dialogCategory.current" color="primary" plain :disabled="!dialogCategory.valid" @click="addCategory">{{ text.add }}</v-btn>
                                                    <v-btn v-else color="primary" plain :disabled="!dialogCategory.valid" @click="saveCategory">{{ text.save }}</v-btn>
                                                    <v-spacer></v-spacer>
                                                </v-card-actions>
                                            </v-card>
                                        </v-dialog>
                                        <v-dialog v-model="dialogDeleteCategory" max-width="450">
                                            <v-card>
                                                <v-card-title class="headline">{{ i18n.getMessage('TitleDelete', deleteCategory.name) }}</v-card-title>
                                                <v-card-text>{{ text.subTitleDeleteCategory }}</v-card-text>
                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                    <v-btn color="secondary" plain @click="closeDialogDeleteCategory()">
                                                        {{ text.cancel }}</v-btn>
                                                    <v-btn color="tertiary" plain @click="removeCategory(deleteCategory)">
                                                        {{ text.delete }}</v-btn>
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
                                        @click="openCategory(item)"></v-btn>
                                    <v-btn
                                        variant="plain"
                                        icon="fas fa-trash"
                                        size="small"
                                        color="tertiary"
                                        @click="openDialogDeleteCategory(item)"> </v-btn>
                                </template>
                            </v-data-table>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
import Helper from '../../mixins/helper'

export default {
    name: 'OptionGitLab',
    data() {
        return {
            dialogCategory: {
                open: false,
                title: '',
                item: {
                    name: null,
                },
                current: null,
                valid: false,
            },
            dialogDeleteCategory: false,
            searchCategory: '',
            dialogProject: {
                open: false,
                title: '',
                item: {
                    domain: null,
                    project: null,
                    uuid: null,
                },
                current: null,
                valid: false,
            },
            dialogDeleteProject: false,
            searchProject: '',
            hostRules: [
                value => Helper.isURL(value) || chrome.i18n.getMessage('errUrlInvalid'),
            ],
            domainRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
            ],
            projectRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
                value => false === this.checkProjectDuplicated(value) || chrome.i18n.getMessage('errDuplicated'),
            ],
            categoryRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
                value => false === this.checkCategoryDuplicated(value) || chrome.i18n.getMessage('errDuplicated'),
            ],
            text: {
                host: chrome.i18n.getMessage('Host'),
                categories: chrome.i18n.getMessage('Categories'),
                category: chrome.i18n.getMessage('Category'),
                newCategory: chrome.i18n.getMessage('NewCategory'),
                projects: chrome.i18n.getMessage('Projects'),
                project: chrome.i18n.getMessage('Project'),
                newProject: chrome.i18n.getMessage('NewProject'),
                save: chrome.i18n.getMessage('Save'),
                cancel: chrome.i18n.getMessage('Cancel'),
                delete: chrome.i18n.getMessage('Delete'),
                search: chrome.i18n.getMessage('Search'),
                subTitleDeleteCategory: chrome.i18n.getMessage('SubTitleDeleteCategory'),
                add: chrome.i18n.getMessage('Add'),
                name: chrome.i18n.getMessage('Name'),
            },
            i18n: chrome.i18n,
            deleteCategory: {},
            deleteProject: {},
            defaultCategory: {
                name: '',
            },
            defaultProject: {
                domain: null,
                project: null,
                uuid: null,
            },
        }
    },
    computed: {
        host: {
            get() {
                return this.$store.getters['gitLab/getHost']
            },
            set(value) {
                if (null === value || Helper.isURL(value)) {
                    this.$store.dispatch('gitLab/updateHost', value ?? '')
                }
            },
        },
        categories() {
            return this.$store.getters['gitLab/getCategories']
        },
        projects() {
            return this.$store.getters['gitLab/getProjects']
        },
        categoriesHeader() {
            return [
                { title: this.text.category, key: 'name' },
                { title: '', key: 'actions', sortable: false, align: 'end' },
            ]
        },
        projectsHeader() {
            return [
                { title: this.text.project, key: 'project', groupable: false },
                { title: '', key: 'actions', sortable: false, align: 'end', groupable: false },
            ]
        },
    },
    methods: {
        removeCategory: function (item) {
            this.$store.dispatch('gitLab/removeCategory', item.name)
            this.closeDialogDeleteCategory()
        },
        removeProject: function (item) {
            this.$store.dispatch('gitLab/removeProject', item)
            this.closeDialogDeleteProject()
        },
        openDialogDeleteCategory: function (item) {
            this.dialogDeleteCategory = true
            this.deleteCategory = Object.assign({}, item)
        },
        closeDialogDeleteCategory: function () {
            this.dialogDeleteCategory = false
            this.deleteCategory = {}
        },
        openDialogDeleteProject: function (item) {
            this.deleteProject = item
            this.dialogDeleteProject = true
        },
        closeDialogDeleteProject: function () {
            this.dialogDeleteProject = false
            this.deleteProject = {}
        },
        closeDialogCategory: function () {
            this.dialogCategory.open = false
            this.dialogCategory.current = null
        },
        openNewCategory: function() {
            this.dialogCategory = {
                open: true,
                title: this.text.newCategory,
                item: Object.assign({}, this.defaultCategory),
                current: null,
                valid: false,
            }
        },
        openNewProject: function() {
            this.dialogProject = {
                open: true,
                title: this.text.newProject,
                item: Object.assign({}, this.defaultProject),
                current: null,
                valid: false,
            }
        },
        openCategory: function (category) {
            this.dialogCategory = {
                open: true,
                title: this.i18n.getMessage('TitleUpdate', category.name),
                item: Object.assign({}, category),
                current: category,
                valid: true,
            }
        },
        openProject: function (project) {
            this.dialogProject = {
                open: true,
                title: this.i18n.getMessage('TitleUpdate', project.project),
                item: Object.assign({}, project),
                current: project,
                valid: true,
            }
        },
        closeProject: function () {
            this.dialogProject.open = false
            this.dialogProject.current = null
        },
        addCategory: function () {
            if(this.$refs.categoryForm.validate()) {
                this.$store.dispatch('gitLab/addCategory', this.dialogCategory.item.name)
            }

            this.closeDialogCategory()
        },
        saveCategory: function () {
            if (this.$refs.categoryForm.validate()) {
                this.$store.dispatch(
                    'gitLab/updateCategory',
                    {
                        previousName: this.dialogCategory.current.name,
                        newName: this.dialogCategory.item.name,
                    },
                )
            }

            this.closeDialogCategory()
        },
        checkCategoryDuplicated: function (value) {
            if (false === this.$store.getters['gitLab/getCategoryNames'].map(x => x.toLowerCase()).includes(value.toLowerCase())) {
                return false
            }

            if (null === this.dialogCategory.current) {
                return true
            }

            return value !== this.dialogCategory.current.name
        },
        checkProjectDuplicated: function (value) {
            let projects = this.$store.getters['gitLab/getProjects']
            let item = this.dialogProject.item

            if (null === value) {
                return false
            }

            let searchResult = projects.find(project => project.domain === item.domain && project.project.toLowerCase() === value.toLowerCase())

            if (undefined === searchResult) {
                return false
            }

            if (null === this.dialogProject.current) {
                return true
            }

            return this.dialogProject.current.uuid !== item.uuid
        },
        addProject: function () {
            if (this.$refs.projectForm.validate()) {
                this.$store.dispatch('gitLab/addProject', this.dialogProject.item)
            }

            this.closeProject()
        },
        saveProject: function () {
            if (this.$refs.projectForm.validate()) {
                this.$store.dispatch(
                    'gitLab/updateProject',
                    {
                        previous: this.dialogProject.current,
                        project: this.dialogProject.item,
                    },
                )
            }

            this.closeProject()
        },
    },
}
</script>
