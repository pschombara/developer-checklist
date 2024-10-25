<script setup>
import {computed, ref} from 'vue'
import {useJenkinsStorage} from '../../../stores/jenkins.ts'
import BuildSettings from '../../shared/Jenkins/BuildSettings.vue'

const i18n = browser.i18n
const jenkinsStore = useJenkinsStorage()

const text = {
    search: i18n.getMessage('Search'),
    add: i18n.getMessage('Add'),
    cancel: i18n.getMessage('Cancel'),
    delete: i18n.getMessage('Delete'),
    label: i18n.getMessage('Label'),
    name: i18n.getMessage('Name'),
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
    current: null,
    item: {...defaultBuild},
})

const deleteBuild = ref({})

const builds = computed(() => {
    return jenkinsStore.getBuilds
})

const openBuild = build => {
    dialogBuild.value = {
        open: true,
        current: build,
        item: {...build},
    }
}

const openNewBuild = () => {
    dialogBuild.value = {
        open: true,
        current: null,
        item: {...defaultBuild},
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

const removeBuild = build => {
    jenkinsStore.removeBuild(build.uuid)
    closeDialogDeleteBuild()
}

const closeDialogDeleteBuild = () => {
    dialogDeleteBuild.value = false
    deleteBuild.value = {}
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
                            <BuildSettings :build="dialogBuild.item" :create="null === dialogBuild.current" @close="closeDialogBuild"/>
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
