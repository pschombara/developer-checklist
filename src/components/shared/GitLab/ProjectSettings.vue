<script lang="ts" setup>

import {computed, ref} from 'vue'
import {useJenkinsStorage} from '@/stores/jenkins'
import {useGitLabStorage} from '@/stores/gitlab'

const props = defineProps<{
    project: object
}>()
const emits = defineEmits(['close'])

const jenkinsStorage = useJenkinsStorage()
const gitLabStorage = useGitLabStorage()

const i18n = browser.i18n

const text = {
    category: i18n.getMessage('Category'),
    project: i18n.getMessage('Project'),
    cancel: i18n.getMessage('Cancel'),
    ciBuild: i18n.getMessage('CiBuild'),
}

const domainRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
]

const projectRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
    value => false === checkProjectDuplicated(value) || i18n.getMessage('errDuplicated'),
]

const ciProjects = computed(() => jenkinsStorage.getBuilds)
const categories = computed(() => {
    return gitLabStorage.getCategories.map(category => {
        return {name: category}
    })
})

const projectData = ref(props.project)

const saveProject = async event => {
    const result = await event

    if (false === result.valid) {
        return
    }

    if (null === projectData.value.current) {
        gitLabStorage.addProject(
            projectData.value.item.ciBuild,
            projectData.value.item.domain,
            projectData.value.item.project,
        )
    } else {
        gitLabStorage.updateProject(
            projectData.value.item.uuid,
            projectData.value.item.ciBuild,
            projectData.value.item.domain,
            projectData.value.item.project,
        )
    }

    emits('close')
}

const checkProjectDuplicated = value => {
    const projects = gitLabStorage.getProjects

    if (null === value) {
        return false
    }

    let searchResult = projects.find(project => project.domain === projectData.value.item.domain && project.project.toLowerCase() === value.toLowerCase())

    if (undefined === searchResult) {
        return false
    }

    if (null === projectData.value.current) {
        return true
    }

    return searchResult.uuid !== projectData.value.item.uuid || projectData.value.current.uuid !== projectData.value.item.uuid
}

const load = async () => {
    await jenkinsStorage.load()
    await gitLabStorage.load()
}

load()
</script>

<template>
    <v-form
        validate-on="input"
        @submit.prevent="saveProject">
        <v-card>
            <v-card-title>{{ projectData.title }}</v-card-title>
            <v-card-text>
                <v-autocomplete
                    v-model="projectData.item.domain"
                    :items="categories"
                    :label="text.category"
                    item-title="name"
                    item-value="name"
                    :rules="domainRules"
                    @change="$refs.projectForm.validate()"
                />
                <v-text-field
                    v-model="projectData.item.project"
                    :rules="projectRules"
                    :label="text.project"
                />
                <v-autocomplete
                    v-model="projectData.item.ciBuild"
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
                    @click="emits('close')">{{ text.cancel }}
                </v-btn>
                <v-btn
                    type="submit"
                    color="primary"
                    variant="plain">{{ projectData.saveButton }}
                </v-btn>
                <v-spacer/>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<style scoped>

</style>
