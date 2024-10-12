<script setup>
import {computed, ref} from 'vue'
import {useJenkinsStorage} from '../../../stores/jenkins.js'

const i18n = chrome.i18n
const jenkinsStore = useJenkinsStorage()

const buildNameRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
    value => false === checkBuildDuplicated(value) || i18n.getMessage('errDuplicated'),
]

const buildJobRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
]

const buildTypeRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
]

const text = {
    category: i18n.getMessage('Category'),
    newCategory: i18n.getMessage('NewCategory'),
    newBuild: i18n.getMessage('NewBuild'),
    search: i18n.getMessage('Search'),
    add: i18n.getMessage('Add'),
    save: i18n.getMessage('Save'),
    cancel: i18n.getMessage('Cancel'),
    delete: i18n.getMessage('Delete'),
    label: i18n.getMessage('Label'),
    name: i18n.getMessage('Name'),
    build: i18n.getMessage('Build'),
    builds: i18n.getMessage('Builds'),
    job: i18n.getMessage('Job'),
}

const buildHeaders = [
    {title: text.name, key: 'name', groupable: false},
    {title: text.label, key: 'label', groupable: false},
    {title: text.job, key: 'job', groupable: false},
    {title: '', key: 'actions', sortable: false, align: 'end', groupable: false},
]

const searchBuild = ref('')
const dialogDeleteBuild = ref(false)

const defaultBuild = {
    uuid: null,
    type: null,
    job: null,
    label: '',
    name: '',
}

const dialogBuild = ref({
    open: false,
    title: '',
    current: null,
    item: {...defaultBuild},
    saveButton: '',
})

const deleteBuild = ref({})

const builds = computed(() => {
    return jenkinsStore.getBuilds
})

const categories = computed(() => {
    return jenkinsStore.getCategories
})

const openBuild = build => {
    dialogBuild.value = {
        open: true,
        title: i18n.getMessage('TitleUpdate', build.name),
        current: build,
        item: {...build},
        saveButton: text.save,
    }
}

const openNewBuild = () => {
    dialogBuild.value = {
        open: true,
        title: text.newBuild,
        current: null,
        item: {...defaultBuild},
        saveButton: text.add,
    }
}

const openDialogDeleteBuild = build => {
    dialogDeleteBuild.value = true
    deleteBuild.value = {...build}
}

const closeDialogBuild = () => {
    dialogBuild.value.open = false
    dialogBuild.value.current = null
}

const saveBuild = async event => {
    const result = await event

    if (false === result.valid) {
        return
    }

    if (null === dialogBuild.value.item.uuid) {
        jenkinsStore.addBuild(
            dialogBuild.value.item.type,
            dialogBuild.value.item.job,
            dialogBuild.value.item.label,
            dialogBuild.value.item.name,
        )
    } else {
        jenkinsStore.updateBuild(
            dialogBuild.value.item.uuid,
            dialogBuild.value.item.type,
            dialogBuild.value.item.job,
            dialogBuild.value.item.label,
            dialogBuild.value.item.name,
        )
    }

    closeDialogBuild()
}

const removeBuild = build => {
    jenkinsStore.removeBuild(build.uuid)
    closeDialogDeleteBuild()
}

const closeDialogDeleteBuild = () => {
    dialogDeleteBuild.value = false
    deleteBuild.value = {}
}

const checkBuildDuplicated = value => {
    if (null === value) {
        return false
    }

    const item = dialogBuild.value.item
    const search = jenkinsStore.getBuilds.find(build => build.type === item.type && build.name.toLowerCase() === item.name.toLowerCase())

    if (undefined === search) {
        return false
    }

    if (null === dialogBuild.value.current) {
        return true
    }

    return search.uuid !== item.uuid || dialogBuild.value.current.uuid !== item.uuid
}
</script>

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
