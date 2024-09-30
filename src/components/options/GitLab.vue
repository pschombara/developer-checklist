<script setup>
import Helper from '../../mixins/helper'
import {useGitLabStorage} from '../../stores/gitlab.js'
import {computed, ref} from 'vue'
import {useJenkinsStorage} from '../../stores/jenkins.js'

const gitLabStorage = useGitLabStorage()
const jenkinsStorage = useJenkinsStorage()

let init = false
const i18n = chrome.i18n

const text = {
    host: i18n.getMessage('Host'),
    categories: i18n.getMessage('Categories'),
    category: i18n.getMessage('Category'),
    newCategory: i18n.getMessage('NewCategory'),
    projects: i18n.getMessage('Projects'),
    project: i18n.getMessage('Project'),
    newProject: i18n.getMessage('NewProject'),
    save: i18n.getMessage('Save'),
    cancel: i18n.getMessage('Cancel'),
    delete: i18n.getMessage('Delete'),
    search: i18n.getMessage('Search'),
    subTitleDeleteCategory: i18n.getMessage('SubTitleDeleteCategory'),
    add: i18n.getMessage('Add'),
    name: i18n.getMessage('Name'),
    ciBuild: i18n.getMessage('CiBuild'),
}

const hostRules = [
    value => Helper.isURL(value) || i18n.getMessage('errUrlInvalid'),
]

const domainRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
]

const projectRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
    value => false === checkProjectDuplicated(value) || i18n.getMessage('errDuplicated'),
]
const categoryRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
    value => false === checkCategoryDuplicated(value) || i18n.getMessage('errDuplicated'),
]

const host = computed({
    get() {
        return gitLabStorage.getHost
    },
    set(value) {
        if (null === value || Helper.isURL(value)) {
            gitLabStorage.setHost(value)
        }
    },
})

const projects = computed(() => {
    return gitLabStorage.getProjects
})

const categories = computed(() => {
    return gitLabStorage.getCategories.map(category => {
        return {name: category}
    })
})

const ciProjects = computed(() => {
    return jenkinsStorage.getBuilds
})

const defaultCategory = {
    name: '',
}

const defaultProject = {
    domain: null,
    project: null,
    uuid: null,
    ciBuild: null,
}

const defaultDialogCategory = {
    open: false,
    title: '',
    item: {...defaultCategory},
    current: null,
    saveButton: '',
}

const defaultDialogProject = {
    open: false,
    title: '',
    item: {...defaultProject},
    current: null,
    saveButton: '',
}

const dialogCategory = ref({...defaultDialogCategory})
const dialogDeleteCategory = ref(false)
const dialogDeleteProject = ref(false)
const searchCategory = ref('')
const searchProject = ref('')
const dialogProject = ref({...defaultDialogProject})
const deleteCategory = ref({})
const deleteProject = ref({})

const categoriesHeader = [
    {title: text.category, key: 'name'},
    {title: '', key: 'actions', sortable: false, align: 'end'},
]

const projectsHeader = [
    {title: text.project, key: 'project', groupable: false},
    {title: '', key: 'actions', sortable: false, align: 'end', groupable: false},
]

const removeCategory = item => {
    gitLabStorage.removeCategory(item.name)
    closeDialogDeleteCategory()
}

const removeProject = item => {
    gitLabStorage.removeProject(item.uuid)
    closeDialogDeleteProject()
}

const openDialogDeleteCategory = item => {
    dialogDeleteCategory.value = true
    deleteCategory.value = {...item}
}

const closeDialogDeleteCategory = () => {
    dialogDeleteCategory.value = false
    deleteCategory.value = {}
}

const openDialogDeleteProject = item => {
    deleteProject.value = item
    dialogDeleteProject.value = true
}

const closeDialogDeleteProject = () => {
    dialogDeleteProject.value = false
    deleteProject.value = {}
}

const closeDialogCategory = () => {
    dialogCategory.value.open = false
    dialogCategory.value.current = null
}

const openNewCategory = () => {
    dialogCategory.value = {
        open: true,
        title: text.newCategory,
        item: {...defaultCategory},
        current: null,
        saveButton: text.add,
    }
}

const openNewProject = () => {
    dialogProject.value = {
        open: true,
        title: text.newProject,
        item: {...defaultProject},
        current: null,
        saveButton: text.add,
    }
}

const openCategory = category => {
    dialogCategory.value = {
        open: true,
        title: i18n.getMessage('TitleUpdate', category.name),
        item: {...category},
        current: category,
        saveButton: text.save,
    }
}

const openProject = project => {
    dialogProject.value = {
        open: true,
        title: i18n.getMessage('TitleUpdate', project.project),
        item: {...project},
        current: project,
        saveButton: text.save,
    }
}

const closeProject = () => {
    dialogProject.value.open = false
    dialogProject.value.current = null
}

const checkCategoryDuplicated = value => {
    if (false === gitLabStorage.getCategories.map(x => x.toLowerCase()).includes(value.toLowerCase())) {
        return false
    }

    if (null === dialogCategory.value.current) {
        return true
    }

    return value !== dialogCategory.value.current.name
}
const checkProjectDuplicated = value => {
    const projects = gitLabStorage.getProjects

    if (null === value) {
        return false
    }

    let searchResult = projects.find(project => project.domain === dialogProject.value.item.domain && dialogProject.value.item.project.toLowerCase() === value.toLowerCase())

    if (undefined === searchResult) {
        return false
    }

    if (null === dialogProject.value.current) {
        return true
    }

    return searchResult.uuid !== dialogProject.value.item.uuid || dialogProject.value.current.uuid !== dialogProject.value.item.uuid
}

const saveCategory = async event => {
    const result = await event

    if (false === result.valid) {
        return
    }

    if (null === dialogCategory.value.current) {
        gitLabStorage.addCategory(dialogCategory.value.item.name)
    } else {
        gitLabStorage.renameCategory(dialogCategory.value.current.name, dialogCategory.value.item.name)
    }

    closeDialogCategory()
}

const saveProject = async event => {
    const result = await event

    if (false === result.valid) {
        return
    }

    if (null === dialogProject.value.current) {
        gitLabStorage.addProject(
            dialogProject.value.item.ciBuild,
            dialogProject.value.item.domain,
            dialogProject.value.item.project,
        )
    } else {
        gitLabStorage.updateProject(
            dialogProject.value.item.uuid,
            dialogProject.value.item.ciBuild,
            dialogProject.value.item.domain,
            dialogProject.value.item.project,
        )
    }

    closeProject()
}

gitLabStorage.$subscribe(() => {
    if (init) {
        gitLabStorage.save()
    }
})

Promise.all([gitLabStorage.load(), jenkinsStorage.load()]).then(() => init = true)
</script>

<template>
    <v-card flat class="mt-5">
        <v-card-text>
            <v-row>
                <v-col cols="12" sm="6" md="3">
                    <v-text-field
v-model="host" :label="text.host" :rules="hostRules" clearable
                                  clear-icon="fas fa-times"></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="7">
                    <v-card>
                        <v-card-title>{{ text.projects }}</v-card-title>
                        <v-card-text>
                            <v-data-table
                                :headers="projectsHeader"
                                :items="projects"
                                :search="searchProject"
                                :sort-by="[{key: 'domain', order: 'asc'}, {key: 'project', order: 'asc'}]"
                                multi-sort
                                show-group-by
                                :group-by="[{key: 'domain'}]"
                            >
                                <template #top>
                                    <v-toolbar flat>
                                        <v-toolbar-title>
                                            <v-text-field
                                                v-model="searchProject"
                                                prepend-icon="fas fa-search"
                                                clear-icon="fas fa-times"
                                                :label="text.search"
                                                single-line
                                                hide-details
                                                clearable
                                            ></v-text-field>
                                        </v-toolbar-title>
                                        <v-spacer/>
                                        <v-btn
                                            variant="plain"
                                            prepend-icon="fas fa-plus"
                                            color="primary"
                                            @click="openNewProject">{{ text.add }}
                                        </v-btn>
                                        <v-dialog v-model="dialogProject.open" max-width="450">
                                            <v-form
                                                validate-on="input"
                                                @submit.prevent="saveProject">
                                                <v-card>
                                                    <v-card-title>{{ dialogProject.title }}</v-card-title>
                                                    <v-card-text>
                                                        <v-autocomplete
                                                            v-model="dialogProject.item.domain"
                                                            :items="categories"
                                                            :label="text.category"
                                                            item-title="name"
                                                            item-value="name"
                                                            :rules="domainRules"
                                                            @change="$refs.projectForm.validate()"
                                                        />
                                                        <v-text-field
                                                            v-model="dialogProject.item.project"
                                                            :rules="projectRules"
                                                            :label="text.project"
                                                        />
                                                        <v-autocomplete
                                                            v-model="dialogProject.item.ciBuild"
                                                            :items="ciProjects"
                                                            :label="text.ciBuild"
                                                            item-title="name"
                                                            item-value="uuid"
                                                        />
                                                    </v-card-text>
                                                    <v-card-actions>
                                                        <v-spacer/>
                                                        <v-btn
                                                            color="secondary"
                                                            variant="plain"
                                                            @click="closeProject">{{ text.cancel }}
                                                        </v-btn>
                                                        <v-btn
                                                            type="submit"
                                                            color="primary"
                                                            variant="plain">{{ dialogProject.saveButton }}
                                                        </v-btn>
                                                        <v-spacer/>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-form>
                                        </v-dialog>
                                        <v-dialog v-model="dialogDeleteProject" max-width="450">
                                            <v-card>
                                                <v-card-title class="headline">
                                                    {{ i18n.getMessage('TitleDelete', deleteProject.project) }}
                                                </v-card-title>
                                                <v-card-actions>
                                                    <v-spacer/>
                                                    <v-btn color="secondary" plain @click="closeDialogDeleteProject()">
                                                        {{ text.cancel }}
                                                    </v-btn>
                                                    <v-btn color="tertiary" plain @click="removeProject(deleteProject)">
                                                        {{ text.delete }}
                                                    </v-btn>
                                                    <v-spacer/>
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
                                        @click="openProject(item)"/>
                                    <v-btn
                                        variant="plain"
                                        icon="fas fa-trash"
                                        size="small"
                                        color="tertiary"
                                        @click="openDialogDeleteProject(item)"/>
                                </template>
                            </v-data-table>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" md="5">
                    <v-card>
                        <v-card-title>{{ text.categories }}</v-card-title>
                        <v-card-text>
                            <v-data-table
                                :headers="categoriesHeader"
                                :items="categories"
                                :search="searchCategory"
                                :sort-by="['name']"
                            >
                                <template #top>
                                    <v-toolbar flat>
                                        <v-toolbar-title>
                                            <v-text-field
                                                v-model="searchCategory"
                                                prepend-icon="fas fa-search"
                                                clear-icon="fas fa-times"
                                                :label="text.search"
                                                single-line
                                                hide-details
                                                clearable
                                            />
                                        </v-toolbar-title>
                                        <v-spacer/>
                                        <v-btn
                                            variant="plain"
                                            prepend-icon="fas fa-plus"
                                            color="primary"
                                            @click="openNewCategory">{{ text.add }}
                                        </v-btn>
                                        <v-dialog v-model="dialogCategory.open" max-width="450">
                                            <v-form
                                                validate-on="input"
                                                @submit.prevent="saveCategory">
                                                <v-card>
                                                    <v-card-title>{{ dialogCategory.title }}</v-card-title>
                                                    <v-card-text>
                                                        <v-text-field
                                                            v-model="dialogCategory.item.name"
                                                            :rules="categoryRules"
                                                            :label="text.name"
                                                        />
                                                    </v-card-text>
                                                    <v-card-actions>
                                                        <v-spacer/>
                                                        <v-btn
                                                            color="secondary"
                                                            variant="plain"
                                                            @click="closeDialogCategory">{{ text.cancel }}
                                                        </v-btn>
                                                        <v-btn
                                                            type="submit"
                                                            color="primary"
                                                            variant="plain">{{ dialogCategory.saveButton }}
                                                        </v-btn>
                                                        <v-spacer/>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-form>
                                        </v-dialog>
                                        <v-dialog v-model="dialogDeleteCategory" max-width="450">
                                            <v-card>
                                                <v-card-title class="headline">
                                                    {{ i18n.getMessage('TitleDelete', deleteCategory.name) }}
                                                </v-card-title>
                                                <v-card-text>{{ text.subTitleDeleteCategory }}</v-card-text>
                                                <v-card-actions>
                                                    <v-spacer/>
                                                    <v-btn color="secondary" plain @click="closeDialogDeleteCategory()">
                                                        {{ text.cancel }}
                                                    </v-btn>
                                                    <v-btn
color="tertiary" plain
                                                           @click="removeCategory(deleteCategory)">
                                                        {{ text.delete }}
                                                    </v-btn>
                                                    <v-spacer/>
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
                                        @click="openCategory(item)"/>
                                    <v-btn
                                        variant="plain"
                                        icon="fas fa-trash"
                                        size="small"
                                        color="tertiary"
                                        @click="openDialogDeleteCategory(item)"/>
                                </template>
                            </v-data-table>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
